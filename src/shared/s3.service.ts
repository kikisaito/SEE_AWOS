import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    return { uploadUrl, key }; 
  } catch (error) {
    console.error("Error detallado en S3 Service:", error);
    throw new Error("No se pudo generar la URL de carga. Revisa tus credenciales AWS.");
  }
};