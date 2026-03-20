import { Request, Response } from 'express';
// IMPORTANTE: Cambiamos la ruta para que apunte a cloudinary.service
import { generateUploadUrl } from '../../shared/cloudinary.service'; 

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const getPresignedUrl = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { filename } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: "El parámetro 'filename' es obligatorio" });
    }

    let fileType = 'application/octet-stream';
    if (filename.toLowerCase().endsWith('.jpg') || filename.toLowerCase().endsWith('.jpeg')) fileType = 'image/jpeg';
    else if (filename.toLowerCase().endsWith('.png')) fileType = 'image/png';
    else if (filename.toLowerCase().endsWith('.m4a') || filename.toLowerCase().endsWith('.mp3')) fileType = 'audio/mpeg';

    const result = await generateUploadUrl(userId, filename, fileType);
    
    res.json(result);

  } catch (error) {
    console.error("Error en el controlador de Media:", error);
    res.status(500).json({ error: "No se pudo generar la configuración de carga" });
  }
};