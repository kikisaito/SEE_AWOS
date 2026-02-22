import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

console.log("🔍 Buscando variables de entorno...");

if (!process.env.DATABASE_URL) {
  console.error(" ERROR: DATABASE_URL no encontrada. Verifica que el archivo .env esté en la carpeta raíz (junto a package.json)");
} else {
  console.log(" Variables cargadas correctamente.");
}

const prisma = new PrismaClient();

export default prisma;