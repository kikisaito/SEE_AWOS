import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma'; 
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

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        preferredName,
        avatarKey //Tony aqui se guarda el archivo s3 en el campo avatarKey, que es un string con el nombre del archivo en S3. El frontend usará ese nombre para construir la URL de la imagen.
      },
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