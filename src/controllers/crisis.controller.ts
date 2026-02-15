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


export const updateCrisis = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req as AuthRequest).user?.userId;
    
    // Datos que nos manda el frontend al terminar
    const { 
      breathingCompleted, 
      finalEvaluationId, 
      notes, 
      triggerDesc, 
      location, 
      companion, 
      substanceUse 
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    // 1. Verificamos que la crisis exista y pertenezca al usuario
    const existingCrisis = await prisma.crisisSession.findUnique({
      where: { crisisId: id }
    });

    if (!existingCrisis) {
      return res.status(404).json({ error: "Crisis no encontrada" });
    }

    if (existingCrisis.userId !== userId) {
      return res.status(403).json({ error: "No tienes permiso para editar esta crisis" });
    }

    // 2. Actualizamos la crisis (Cierre)
    const updatedCrisis = await prisma.crisisSession.update({
      where: { crisisId: id },
      data: {
        breathingExerciseCompleted: breathingCompleted || false,
        finalEvaluationId: finalEvaluationId ? Number(finalEvaluationId) : null,
        notes: notes || null,
        triggerDesc: triggerDesc || null,
        location: location || null,
        companion: companion || null,
        substanceUse: substanceUse || null,
        isReflectionCompleted: true, // ¡Marcamos que ya reflexionó!
        endedAt: new Date() // Guardamos la hora exacta del fin
      },
      include: {
        finalEvaluation: true // Para devolver info bonita
      }
    });

    res.json({
      message: "Crisis finalizada y registrada. Eres fuerte.",
      crisis: updatedCrisis
    });

  } catch (error) {
    console.error("Error al finalizar crisis:", error);
    res.status(500).json({ error: "Error interno al actualizar crisis" });
  }
};