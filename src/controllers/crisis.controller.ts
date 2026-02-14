import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const startCrisis = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { emotionIds, intensity } = req.body; 

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    
    if (!emotionIds || !Array.isArray(emotionIds) || emotionIds.length === 0) {
      return res.status(400).json({ 
        error: "Debes seleccionar al menos una emoción para iniciar la crisis." 
      });
    }


    const newCrisis = await prisma.crisisSession.create({
      data: {
        userId: userId,
        intensityLevel: intensity || 5, 
        startedAt: new Date(),
        
       
        selectedEmotions: {
          connect: emotionIds.map((id: number) => ({ emotionId: Number(id) }))
        }
      },
      include: {
        selectedEmotions: true 
      }
    });

    res.status(201).json({
      message: "Crisis iniciada. Estamos contigo.",
      crisisId: newCrisis.crisisId, // <--- ESTO ES VITAL PARA EL FRONTEND
      session: newCrisis
    });

  } catch (error) {
    console.error("Error al iniciar crisis:", error);
    res.status(500).json({ error: "Error interno al iniciar sesión de crisis" });
  }
};