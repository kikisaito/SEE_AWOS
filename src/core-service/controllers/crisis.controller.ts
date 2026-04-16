import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma';

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
        isReflectionCompleted: true, // Marcamos que ya reflexionó
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




export const updateCrisisReflection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.userId;
    
   
    const { 
      triggerDesc, 
      location, 
      companion, 
      substanceUse, 
      notes 
    } = req.body;

    
    if (!location || !companion || !substanceUse) {
      return res.status(400).json({ error: "Completa los campos obligatorios (*)" });
    }

    const updated = await prisma.crisisSession.update({
      where: { 
       crisisId: String(id), 
        userId },
      data: {
        
        triggerDesc: triggerDesc ? String(triggerDesc) : null,
        location: String(location),
        companion: String(companion),
        substanceUse: String(substanceUse),
        notes: notes ? String(notes) : null,
        
        isReflectionCompleted: true
      }
    });

    res.json({ message: "Reflexión guardada", data: updated });
  } catch (error) {
    console.error("Error reflexión:", error);
    res.status(500).json({ error: "Error al guardar reflexión" });
  }
};





export const updateCrisisProgress = async (req: Request, res: Response) => {
  try {
    console.log("=== DEBUG TONY: BODY RECIBIDO EN /progress ===");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("===============================================");
    const userId = (req as any).user?.userId;
    const { id } = req.params; 
    
    
    const { 
        breathingExerciseCompleted, 
        usedCapsuleId, 
        finalEvaluationId 
    } = req.body;

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const existingCrisis = await prisma.crisisSession.findFirst({
      where: { crisisId: String(id), userId: userId }
    });

    if (!existingCrisis) {
      return res.status(404).json({ error: "Crisis no encontrada o no te pertenece" });
    }

    // 🚀 Objeto de datos dinámico a prueba de balas
    const dataToUpdate: any = {};
    
    if (breathingExerciseCompleted !== undefined) {
        dataToUpdate.breathingExerciseCompleted = breathingExerciseCompleted;
    }
    if (usedCapsuleId !== undefined) {
        dataToUpdate.usedCapsuleId = usedCapsuleId;
    }
    // Si Tony manda la evaluación por aquí, la atrapamos también
    if (finalEvaluationId !== undefined) {
        dataToUpdate.finalEvaluationId = Number(finalEvaluationId);
    }

    const updatedCrisis = await prisma.crisisSession.update({
      where: { crisisId: String(id) },
      data: dataToUpdate
    });

    res.status(200).json({ message: "Progreso de crisis actualizado", crisis: updatedCrisis });
  } catch (error) {
    console.error("Error al actualizar progreso:", error);
    res.status(500).json({ error: "Error interno al actualizar la crisis" });
  }
};







export const saveCrisisReflection = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { id } = req.params;
    
    const { 
      triggerDesc, location, companion, substanceUse, 
      notes, finalEvaluationId, usedCapsuleId 
    } = req.body;

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const existingCrisis = await prisma.crisisSession.findFirst({
      where: { crisisId: String(id), userId: userId }
    });

    if (!existingCrisis) {
      return res.status(404).json({ error: "Crisis no encontrada o no te pertenece" });
    }

    const [finishedCrisis, rachaActualizada] = await prisma.$transaction(async (tx) => {
      
      const crisisActualizada = await tx.crisisSession.update({
        where: { crisisId: String(id) },
        data: {
          // Lógica corregida: Solo actualiza el campo si no es undefined. 
          // Esto protege los datos que Tony ya envió en peticiones previas.
          ...(triggerDesc !== undefined && { triggerDesc: String(triggerDesc) }),
          ...(location !== undefined && { location: String(location) }),
          ...(companion !== undefined && { companion: String(companion) }),
          ...(substanceUse !== undefined && { substanceUse: String(substanceUse) }),
          ...(notes !== undefined && { notes: String(notes) }),
          ...(finalEvaluationId !== undefined && { finalEvaluationId: Number(finalEvaluationId) }),
          ...(usedCapsuleId !== undefined && { usedCapsuleId: String(usedCapsuleId) }),

          isReflectionCompleted: true, 
          endedAt: new Date() 
        }
      });

      const victoriaCreada = await tx.userVictory.create({
        data: {
          userId: userId,
          victoryTypeId: 1, 
          occurredAt: new Date()
        }
      });

      return [crisisActualizada, victoriaCreada];
    });

    res.status(200).json({ 
        message: "Reflexión guardada. Racha y crisis actualizadas mediante transacción segura.", 
        crisis: finishedCrisis,
        victoria: rachaActualizada
    });

  } catch (error) {
    console.error("Error crítico en transacción de crisis:", error);
    res.status(500).json({ error: "Fallo la transacción. Base de datos intacta." });
  }
};