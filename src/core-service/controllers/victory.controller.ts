import { Request, Response } from 'express';
import prisma from '../../shared/config/prisma';

interface AuthRequest extends Request { user?: { userId: string } }


export const getVictoryTypes = async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user?.userId;
  
  const types = await prisma.victoryTypeCatalog.findMany({
    where: {
      OR: [
        { userId: null },      
        { userId: userId }     //capsulas de usuario
      ]
    },
    orderBy: { victoryTypeId: 'asc' }
  });
  res.json(types);
};

export const registerVictories = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { victoryTypeIds, newCustomVictoryName } = req.body; 

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const createdVictories = [];

    
    if (newCustomVictoryName && typeof newCustomVictoryName === 'string') {
      const customType = await prisma.victoryTypeCatalog.create({
        data: {
          name: newCustomVictoryName,
          userId: userId
        }
      });
      
      if (!victoryTypeIds) {
         
      }
     
    }

    //   1. Crear Tipo Personalizado (si hay texto).
    //   2. Registrar Victorias (con los IDs).
    
    
    await prisma.$transaction(async (tx) => {
      let finalIds = Array.isArray(victoryTypeIds) ? victoryTypeIds : [];

      
      if (newCustomVictoryName) {
        
        const existing = await tx.victoryTypeCatalog.findFirst({
            where: { name: newCustomVictoryName, userId }
        });

        let typeId;
        if (existing) {
            typeId = existing.victoryTypeId;
        } else {
            const newType = await tx.victoryTypeCatalog.create({
                data: { name: newCustomVictoryName, userId }
            });
            typeId = newType.victoryTypeId;
        }
        finalIds.push(typeId);
      }

     
      if (finalIds.length > 0) {
        await tx.userVictory.createMany({
          data: finalIds.map((id: number) => ({
            userId,
            victoryTypeId: Number(id)
          }))
        });
      }
    });

    res.status(201).json({ message: "Victorias registradas con éxito" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error registrando victorias" });
  }
};