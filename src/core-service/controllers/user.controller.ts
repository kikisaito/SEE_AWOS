import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma'; 
// CORRECCIÓN: Apunta a cloudinary y usa deleteFileFromCloud
import { deleteFileFromCloud } from '../../shared/cloudinary.service';

interface AuthRequest extends Request {
  user?: { userId: string };
}

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

    if (currentUser?.avatarKey && currentUser.avatarKey !== avatarKey) {
      try {
        // CORRECCIÓN: Borrado en Cloudinary
        await deleteFileFromCloud(currentUser.avatarKey);
      } catch (cloudError) {
        console.warn("Aviso: No se pudo borrar la foto antigua de Cloudinary, continuando...", cloudError);
      }
    }

    // 3. Construimos el objeto de actualización a prueba de balas
    const dataToUpdate: any = {};
    if (preferredName !== undefined) dataToUpdate.preferredName = preferredName;
    
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

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    if (!userId) return res.status(401).json({ error: "No autorizado" });

    await prisma.user.delete({
      where: { userId }
    });

    res.json({ message: "Cuenta y datos eliminados correctamente. Lamentamos verte partir." });
  } catch (error) {
    console.error("Error eliminando cuenta:", error);
    res.status(500).json({ error: "No se pudo eliminar la cuenta" });
  }
};