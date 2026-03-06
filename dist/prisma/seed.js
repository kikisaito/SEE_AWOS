"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log(' Iniciando poblado de datos (Seeding)...');
    // 1. Catálogo de Emociones
    const emociones = ['Miedo', 'Ira', 'Tristeza', 'Ansiedad', 'Vacío', 'Vergüenza'];
    console.log('Creating emotions...');
    for (const nombre of emociones) {
        await prisma.emotionCatalog.upsert({
            where: { name: nombre },
            update: {},
            create: { name: nombre },
        });
    }
    // 2. Catálogo de Tipos de Victoria
    const victorias = [
        'Higiene personal',
        'Alimentación saludable',
        'No consumo sustancias',
        'Ejercicio',
        'Contacto social positivo',
        'Salí de casa',
        'Practiqué autocuidado'
    ];
    console.log('Creating victory types...');
    for (const nombre of victorias) {
        // Usamos findFirst en lugar de upsert para evitar el error de la llave compuesta
        const existe = await prisma.victoryTypeCatalog.findFirst({
            where: { name: nombre }
        });
        if (!existe) {
            await prisma.victoryTypeCatalog.create({
                data: { name: nombre }
            });
        }
    }
    // 3. Catálogo de Escala de Evaluación
    const evaluaciones = ['Mejor', 'Un poco mejor', 'Igual', 'Peor'];
    console.log('Creating evaluation scales...');
    for (const desc of evaluaciones) {
        await prisma.evaluationScaleCatalog.upsert({
            where: { description: desc },
            update: {},
            create: { description: desc },
        });
    }
    console.log(' Base de datos poblada correctamente.');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map