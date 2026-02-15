import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const registerVictories = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { victoryTypeIds } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    
    if (!victoryTypeIds || !Array.isArray(victoryTypeIds) || victoryTypeIds.length === 0) {
      return res.status(400).json({ 
        error: "Debes enviar una lista de victorias (ej: [1, 2])" 
      });
    }

   
    const result = await prisma.userVictory.createMany({
      data: victoryTypeIds.map((id: number) => ({
        userId: userId,
        victoryTypeId: Number(id),
        occurredAt: new Date()
      }))
    });

    res.status(201).json({
      message: "Victorias registradas. ¡Sigue así!",
      count: result.count, 
      data: victoryTypeIds // Devolvemos lo que guardó para feedback visual
    });

  } catch (error) {
    console.error("Error al registrar victorias:", error);
    res.status(500).json({ error: "Error interno al guardar victorias" });
  }
};