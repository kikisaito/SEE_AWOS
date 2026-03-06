import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma'; 
import { deleteFileFromS3 } from '../../shared/s3.service';

interface AuthRequest extends Request {
  user?: { userId: string };
}

// GET /api/users/profile (Para que el frontend cargue los datos)
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const user = await prisma.user.findUnique({
      where: { userId },
      select: { 
        email: true, 
        preferredName: true, 
        avatarKey: true, 
        createdAt: true 
      } 
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(user);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

// PUT /api/users/profile (Actualizar nombre y/o foto)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { preferredName, avatarKey } = req.body;

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    // 1. Buscamos al usuario actual para ver si ya tiene una foto
    const currentUser = await prisma.user.findUnique({
      where: { userId },
      select: { avatarKey: true }
    });

    // 2. Limpieza de S3: Si tiene foto vieja, y Tony mandó borrarla ("") o cambiarla por una nueva, eliminamos la anterior
    if (currentUser?.avatarKey && currentUser.avatarKey !== avatarKey) {
      try {
        await deleteFileFromS3(currentUser.avatarKey);
      } catch (s3Error) {
        console.warn("Aviso: No se pudo borrar la foto antigua de S3, continuando...", s3Error);
      }
    }

    // 3. Construimos el objeto de actualización a prueba de balas
    const dataToUpdate: any = {};
    if (preferredName !== undefined) dataToUpdate.preferredName = preferredName;
    
    // Si Tony manda "" o null, limpiamos la base de datos
    if (avatarKey === "" || avatarKey === null) {
      dataToUpdate.avatarKey = null;
    } else if (avatarKey !== undefined) {
      dataToUpdate.avatarKey = avatarKey;
    }

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: dataToUpdate,
      select: { preferredName: true, avatarKey: true }
    });

    res.json({ message: "Perfil actualizado con éxito", user: updatedUser });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ error: "No se pudo actualizar el perfil" });
  }
};

// DELETE /api/users/profile (Borrar cuenta - GDPR)
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autorizado" });

    // "onDelete: Cascade" 
    // borrar al usuario eliminará automáticamente TODAS sus crisis, victorias y cápsulas.
    await prisma.user.delete({
      where: { userId }
    });

    res.json({ message: "Cuenta y datos eliminados correctamente. Lamentamos verte partir." });
  } catch (error) {
    console.error("Error eliminando cuenta:", error);
    res.status(500).json({ error: "No se pudo eliminar la cuenta" });
  }
};
