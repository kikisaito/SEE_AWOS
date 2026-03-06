import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_BUCKET_NAME) {
  console.warn(" ADVERTENCIA: Credenciales de AWS no configuradas completamente.");
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN || '', 
  },
});




export const generateUploadUrl = async (userId: string, fileName: string, fileType: string) => {
  const cleanFileName = fileName.replace(/\s+/g, '-');
  const key = `users/${userId}/${Date.now()}-${cleanFileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    ContentType: fileType, 
  });

  try {
    const uploadUrl = await getSignedUrl(s3Client, command, { 
        expiresIn: 300,
        signableHeaders: new Set(['x-amz-acl']) 
    });
    
    return { uploadUrl, key }; 
  } catch (error) {
    console.error("Error detallado en S3 Service:", error);
    throw new Error("No se pudo generar la URL de carga.");
  }
};






export const deleteFileFromS3 = async (s3Key: string) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME, 
      Key: s3Key,
    });
    
    await s3Client.send(command);
    console.log(` Archivo eliminado de S3: ${s3Key}`);
  } catch (error) {
    console.error(" Error al borrar archivo de S3:", error);
    throw new Error("No se pudo eliminar el archivo físico de la nube");
  }
};



export const getDownloadUrl = async (s3Key: string): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error("❌ Error al generar URL de lectura de S3:", error);
    throw new Error("No se pudo generar el enlace de audio");
  }
};