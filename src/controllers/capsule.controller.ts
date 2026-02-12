import { Request, Response } from 'express';
import { generateUploadUrl } from '../services/s3.service';

export const requestUpload = async (req: Request, res: Response) => {
  try {
    const { fileName } = req.body;
    // En un futuro, el userId vendrá del Token JWT
    const userId = "temp-user-123"; 

    if (!fileName) {
      return res.status(400).json({ error: "Nombre de archivo requerido" });
    }

    const data = await generateUploadUrl(userId, fileName);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error al solicitar subida", details: error });
  }
};