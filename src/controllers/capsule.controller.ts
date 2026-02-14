import { Request, Response } from 'express';
import { ContentType } from '@prisma/client'; 
import prisma from '../config/prisma'; 
import { generateUploadUrl } from '../services/s3.service';
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const requestUpload = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.body;
    
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!fileName) {
      return res.status(400).json({ error: "Nombre de archivo requerido" });
    }

    const data = await generateUploadUrl(userId, fileName);
    res.json(data);
  } catch (error) {
    console.error("Error S3:", error);
    res.status(500).json({ error: "Error al solicitar subida", details: error });
  }
};


export const createCapsule = async (req: Request, res: Response) => {
  try {
  
    const { s3Key, emotionIds, description, title } = req.body;
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no identificado en el token" });
    }

    if (!s3Key || !emotionIds || !Array.isArray(emotionIds) || emotionIds.length === 0) {
      return res.status(400).json({ 
        error: "Faltan datos: s3Key y un array de emotionIds (ej: [1, 2]) son obligatorios" 
      });
    }

    const newCapsule = await prisma.capsule.create({
      data: {
        s3Key: s3Key,
        userId: userId,
        title: title || `Cápsula - ${new Date().toLocaleDateString()}`,
        contentText: description || "",  
        contentType: 'AUDIO' as ContentType,
        
        // --- AQUÍ ESTÁ LA MAGIA DEL MANY-TO-MANY ---
        // Conectamos la cápsula con MÚLTIPLES emociones a la vez
        targetEmotions: {
          connect: emotionIds.map((id: number) => ({ emotionId: Number(id) }))
        }
      },
      // Incluimos las emociones en la respuesta para confirmar que se guardaron
      include: {
        targetEmotions: true
      }
    });

    res.status(201).json({ 
      message: "Cápsula guardada exitosamente", 
      capsule: newCapsule 
    });

  } catch (error) {
    console.error(" Error al guardar en DB:", error);
    res.status(500).json({ 
      error: "Error interno",
      details: String(error)
    });
  }
};





export const getCapsules = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

   
    const capsules = await prisma.capsule.findMany({
      where: {
        userId: userId // Filtro mágico: solo las mías
      },
      orderBy: {
        createdAt: 'desc' // Las más nuevas primero
      },
      // (Opcional) Incluimos el nombre de la emoción para que se vea bonito
      include: {
        targetEmotions: true 
      }
    });

    res.json({
      message: "Cápsulas recuperadas exitosamente",
      count: capsules.length,
      capsules: capsules
    });

  } catch (error) {
    console.error("Error al obtener cápsulas:", error);
    res.status(500).json({ error: "Error interno al obtener las cápsulas" });
  }
};