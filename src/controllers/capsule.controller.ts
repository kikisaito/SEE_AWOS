import { Request, Response } from 'express';
import { PrismaClient, ContentType } from '@prisma/client'; 
import { generateUploadUrl } from '../services/s3.service';

const prisma = new PrismaClient();


export const requestUpload = async (req: Request, res: Response) => {
  try {
    const { fileName, userId } = req.body;
    const finalUserId = userId || "temp-user-123"; 

    if (!fileName) {
      return res.status(400).json({ error: "Nombre de archivo requerido" });
    }

    const data = await generateUploadUrl(finalUserId, fileName);
    res.json(data);
  } catch (error) {
    console.error("Error S3:", error);
    res.status(500).json({ error: "Error al solicitar subida", details: error });
  }
};

export const createCapsule = async (req: Request, res: Response) => {
  try {
    
    const { s3Key, emotionId, description, userId, title } = req.body;

    
    if (!s3Key || !userId || !emotionId) {
      return res.status(400).json({ 
        error: "Faltan datos obligatorios: s3Key, userId o emotionId" 
      });
    }

    
    const newCapsule = await prisma.capsule.create({
      data: {
        s3Key: s3Key,                    // Mapea a s3_key
        userId: userId,                  // Mapea a user_id
        targetEmotionId: Number(emotionId), // Mapea a target_emotion_id (aseguramos que sea número)
        
        
        title: title || `Cápsula de Audio - ${new Date().toLocaleDateString()}`,
        
        
        contentText: description || "",  
        
        
        contentType: 'AUDIO' as ContentType, 
      },
    });

    res.status(201).json({ 
      message: "Cápsula guardada exitosamente en la DB", 
      capsule: newCapsule 
    });

  } catch (error) {
    console.error("Error al guardar en DB:", error);
    res.status(500).json({ 
      error: "No se pudo guardar la cápsula en la base de datos",
      details: String(error)
    });
  }
};