"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log("🔍 Buscando variables de entorno...");
if (!process.env.DATABASE_URL) {
    console.error(" ERROR: DATABASE_URL no encontrada. Verifica que el archivo .env esté en la carpeta raíz (junto a package.json)");
}
else {
    console.log(" Variables cargadas correctamente.");
}
const prisma = new client_1.PrismaClient();
exports.default = prisma;
//# sourceMappingURL=prisma.js.map