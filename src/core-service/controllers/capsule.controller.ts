import { Request, Response } from 'express';
import { ContentType } from '@prisma/client'; 
import prisma from '../../shared/config/prisma'; 
import { generateUploadUrl, deleteFileFromS3, getDownloadUrl } from '../../shared/s3.service';


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

    // Obtenemos las cápsulas de la base de datos
    const capsules = await prisma.capsule.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: { targetEmotions: true }
    });

    // MAGIA DE ARQUITECTO: Mapeamos las cápsulas para inyectarles la URL firmada
    const capsulesWithUrls = await Promise.all(
      capsules.map(async (capsule) => {
        let audioUrl = null;

        // Si es de tipo AUDIO y tiene un s3Key, vamos a AWS por su Pase VIP de 1 hora
        if (capsule.contentType === 'AUDIO' && capsule.s3Key) {
          audioUrl = await getDownloadUrl(capsule.s3Key);
        }

        return {
          ...capsule,
          audioUrl // Tony recibirá este campo exacto que pidió
        };
      })
    );

    res.json({
      message: "Cápsulas recuperadas exitosamente",
      count: capsulesWithUrls.length,
      capsules: capsulesWithUrls // Enviamos el arreglo con las URLs ya inyectadas
    });

  } catch (error) {
    console.error("Error al obtener cápsulas:", error);
    res.status(500).json({ error: "Error interno al obtener las cápsulas" });
  }
};



export const updateCapsule = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { id } = req.params; 
    const { title, contentType, contentText, s3Key, emotionIds } = req.body;

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const existingCapsule = await prisma.capsule.findFirst({
      where: { capsuleId: String(id), userId: userId }
    });

    if (!existingCapsule) {
      return res.status(404).json({ error: "Cápsula no encontrada o no te pertenece" });
    }

    // 🚀 NUEVO: OPERACIÓN DE LIMPIEZA S3 (NIVEL SENIOR)
    // Si la cápsula ya tenía un audio guardado...
    if (existingCapsule.contentType === 'AUDIO' && existingCapsule.s3Key) {
      // Y Tony nos dice que ahora será TEXTO, o nos manda un s3Key NUEVO...
      if (contentType === 'TEXT' || (s3Key && s3Key !== existingCapsule.s3Key)) {
        try {
          // Borramos el audio viejo de Amazon para no tener basura en la nube
          await deleteFileFromS3(existingCapsule.s3Key);
          console.log("🗑️ Audio viejo eliminado por actualización");
        } catch (error) {
          console.error("Aviso: No se pudo borrar el audio viejo de S3");
        }
      }
    }

    // Construimos los datos dinámicos a actualizar
    const dataToUpdate: any = {};
    
    if (title !== undefined) dataToUpdate.title = title;
    
    if (contentType !== undefined) {
      dataToUpdate.contentType = contentType;
      if (contentType === 'TEXT') {
        dataToUpdate.contentText = contentText;
        dataToUpdate.s3Key = null; 
      } else if (contentType === 'AUDIO') {
        dataToUpdate.s3Key = s3Key;
        dataToUpdate.contentText = null; 
      }
    } else {
      if (contentText !== undefined) dataToUpdate.contentText = contentText;
      if (s3Key !== undefined) dataToUpdate.s3Key = s3Key;
    }

    if (emotionIds) {
      dataToUpdate.targetEmotions = {
        set: [], 
        connect: emotionIds.map((emotionId: number) => ({ emotionId })) 
      };
    }

    const updatedCapsule = await prisma.capsule.update({
      where: { capsuleId: String(id) },
      data: dataToUpdate,
      include: { targetEmotions: true }
    });

    // Inyectamos el Pase VIP actualizado
    let audioUrl = null;
    if (updatedCapsule.contentType === 'AUDIO' && updatedCapsule.s3Key) {
      audioUrl = await getDownloadUrl(updatedCapsule.s3Key); 
    }

    res.status(200).json({ 
      message: "Cápsula actualizada con éxito", 
      capsule: { ...updatedCapsule, audioUrl } 
    });

  } catch (error) {
    console.error("Error al actualizar cápsula:", error);
    res.status(500).json({ error: "Error interno al actualizar la cápsula" });
  }
};




export const deleteCapsule = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    // PASO 1: Buscar la cápsula para saber si existe y si tiene un archivo en S3
    const existingCapsule = await prisma.capsule.findFirst({
      where: { 
        capsuleId: String(id), 
        userId: userId 
      }
    });

    if (!existingCapsule) {
      return res.status(404).json({ error: "Cápsula no encontrada o no te pertenece" });
    }

    // PASO 2: Si es un audio y tiene una llave de S3, disparar a Amazon primero
    if (existingCapsule.contentType === 'AUDIO' && existingCapsule.s3Key) {
        try {
            await deleteFileFromS3(existingCapsule.s3Key);
        } catch (s3Error) {
            // Si S3 falla, detenemos todo. No borramos la base de datos para no perder el rastro.
            return res.status(500).json({ error: "Error al eliminar el archivo físico de la nube" });
        }
    }

    // PASO 3: Destruir el registro en PostgreSQL
    await prisma.capsule.delete({
      where: { 
        capsuleId: String(id) 
      }
    });

    res.status(200).json({ message: "Cápsula y archivo eliminados correctamente" });
  } catch (error) {
    console.error("Error al eliminar cápsula:", error);
    res.status(500).json({ error: "Error interno al eliminar la cápsula" });
  }
};