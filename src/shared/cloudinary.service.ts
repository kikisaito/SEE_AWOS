import { v2 as cloudinary } from 'cloudinary';

// 1. Configuración de Credenciales
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Generar firma para Tony (Reemplaza la URL presignada de S3)
export const generateUploadUrl = async (userId: string, fileName: string, fileType: string) => {
  const cleanFileName = fileName.replace(/\s+/g, '-').split('.')[0]; // Quitamos extensión
  const publicId = `users/${userId}/${Date.now()}-${cleanFileName}`;
  const timestamp = Math.round(new Date().getTime() / 1000);

  // Cloudinary agrupa audio y video en la categoría 'video'
  const resourceType = fileType.startsWith('audio') ? 'video' : 'image';

  try {
    const signature = cloudinary.utils.api_sign_request(
      { timestamp: timestamp, public_id: publicId },
      process.env.CLOUDINARY_API_SECRET!
    );

    // Devolvemos el mismo formato para no romper el controlador
    return { 
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, 
      key: publicId, // Mantenemos "key" para que Prisma guarde esto en "s3Key"
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY
    };
  } catch (error) {
    console.error("Error al firmar para Cloudinary:", error);
    throw new Error("No se pudo generar la firma de carga.");
  }
};

// 3. Borrar archivo (Reemplaza a deleteFileFromS3)
export const deleteFileFromCloud = async (cloudKey: string) => {
  try {
    // Intentamos borrar como video (audio) y como imagen por si acaso
    await cloudinary.uploader.destroy(cloudKey, { resource_type: 'video' });
    await cloudinary.uploader.destroy(cloudKey, { resource_type: 'image' });
    console.log(`[SUCCESS] Archivo eliminado de Cloudinary: ${cloudKey}`);
  } catch (error) {
    console.error("Error al borrar archivo de Cloudinary:", error);
    throw new Error("No se pudo eliminar el archivo físico de la nube");
  }
};

// 4. Leer archivo (Reemplaza a getDownloadUrl)
export const getDownloadUrl = async (cloudKey: string): Promise<string> => {
  try {
    // Cloudinary genera la URL pública al instante sin necesidad de firmarla cada vez
    // Usamos 'video' porque tus cápsulas son principalmente audio
    const fileUrl = cloudinary.url(cloudKey, { secure: true, resource_type: 'video' });
    return fileUrl;
  } catch (error) {
    console.error("Error al generar URL de lectura de Cloudinary:", error);
    throw new Error("No se pudo generar el enlace de audio");
  }
};