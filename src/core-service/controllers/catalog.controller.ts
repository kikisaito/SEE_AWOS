import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma';

export const getEmotions = async (req: Request, res: Response) => {
  try {
    const emotions = await prisma.emotionCatalog.findMany();
    res.json(emotions);
  } catch (error) {
    console.error("Error al obtener emociones:", error);
    res.status(500).json({ error: 'Error interno al obtener emociones' });
  }
};

export const getEvaluations = async (req: Request, res: Response) => {
  try {
    const evaluations = await prisma.evaluationScaleCatalog.findMany();
    res.json(evaluations);
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error);
    res.status(500).json({ error: 'Error interno al obtener evaluaciones' });
  }
};