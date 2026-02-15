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


export const getPresignedUrl = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { fileName, fileType } = req.query; 

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    if (!fileName || !fileType) {
      return res.status(400).json({ error: "Faltan parámetros: fileName y fileType son requeridos" });
    }

    // Llamamos al servicio S3
    const { uploadUrl, key } = await generateUploadUrl(
      userId, 
      String(fileName), 
      String(fileType)
    );

    res.json({
      uploadUrl, 
      s3Key: key 
    });

  } catch (error) {
    console.error("Error obteniendo URL firmada:", error);
    res.status(500).json({ error: "Error al conectar con el servicio de almacenamiento" });
  }
};






export const requestUpload = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    
    
    const { fileName, fileType } = req.query; 

    if (!userId) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }

    
    if (!fileName || !fileType) {
      return res.status(400).json({ error: "Nombre de archivo y tipo (fileType) requeridos" });
    }

   
    const data = await generateUploadUrl(
        userId, 
        String(fileName), 
        String(fileType) 
    );

    res.json(data);

  } catch (error) {
    console.error("Error S3:", error);
    res.status(500).json({ error: "Error al generar URL de subida" });
  }
};



export const createCapsule = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
  
    const { title, contentType, contentText, s3Key, emotionIds } = req.body;

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    
    if (contentType === 'TEXT' && !contentText) {
      return res.status(400).json({ error: "Falta el texto de la cápsula" });
    }
    if (contentType === 'AUDIO' && !s3Key) {
      return res.status(400).json({ error: "Falta el archivo de audio (s3Key)" });
    }

    const newCapsule = await prisma.capsule.create({
      data: {
        userId,
        title,
        contentType, 
        contentText: contentType === 'TEXT' ? contentText : null,
        s3Key: contentType === 'AUDIO' ? s3Key : null,
        targetEmotions: {
          connect: emotionIds?.map((id: number) => ({ emotionId: id })) || []
        }
      }
    });

    res.status(201).json(newCapsule);
  } catch (error) {
    console.error("Error creando cápsula:", error);
    res.status(500).json({ error: "Error interno" });
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
        userId: userId 
      },
      orderBy: {
        createdAt: 'desc' 
      },
      
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