import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma';


export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { emotionIds } = req.query;

    if (!emotionIds || typeof emotionIds !== 'string') {
      return res.status(400).json({ 
        error: "Debes enviar 'emotionIds' separados por comas (ej: ?emotionIds=1,4)" 
      });
    }


    const targetIds = emotionIds.split(',').map(id => Number(id.trim()));

    
    if (targetIds.some(isNaN)) {
      return res.status(400).json({ error: "Los IDs deben ser números" });
    }

    console.log("Buscando recomendaciones para emociones:", targetIds);

    
    const recommendations = await prisma.capsule.findMany({
      where: {
        isActive: true, 
        targetEmotions: {
          some: { 
            emotionId: { in: targetIds } // "...está en la lista de lo que siente el usuario"
          }
        }
      },
      include: {
        targetEmotions: true, 
      },
      take: 10 
    });

    
    const shuffled = recommendations.sort(() => 0.5 - Math.random());

    res.json({
      count: shuffled.length,
      criteria: targetIds,
      data: shuffled
    });

  } catch (error) {
    console.error("Error en recomendaciones:", error);
    res.status(500).json({ error: "Error al generar recomendaciones" });
  }
};