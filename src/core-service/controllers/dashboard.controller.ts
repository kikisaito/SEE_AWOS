import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma';

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    
    const totalVictories = await prisma.userVictory.count({
      where: { 
        userId,
        occurredAt: {
          gte: thirtyDaysAgo //  (Mayor o igual a hace 30 días)
        }
      }
    });

    // 3. Contar Cápsulas Activas (Esto es estado actual, no depende del tiempo)
    const activeCapsules = await prisma.capsule.count({
      where: { 
        userId,
        isActive: true 
      }
    });


    const recentCrisis = await prisma.crisisSession.count({
      where: {
        userId,
        startedAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    res.json({
      metrics: {
        totalVictories, 
        activeCapsules,
        recentCrisis
      },
      period: "Últimos 30 días" 
    });

  } catch (error) {
    console.error("Error dashboard:", error);
    res.status(500).json({ error: "Error al generar el reporte" });
  }
};



export const getPendingReflections = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    
    const pending = await prisma.crisisSession.findMany({
      where: {
        userId,
        isReflectionCompleted: false // Solo las que no se han llenado
      },
      select: {
        crisisId: true,
        startedAt: true,
        intensityLevel: true
      },
      orderBy: { startedAt: 'desc' }
    });

    res.json({ count: pending.length, data: pending });
  } catch (error) {
    res.status(500).json({ error: "Error obteniendo pendientes" });
  }
};