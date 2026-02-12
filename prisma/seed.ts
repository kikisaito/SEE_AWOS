// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(' Iniciando poblado de datos (Seeding)...')

  // 1. Catálogo de Emociones (MVP Simplificado)
  const emociones = ['Miedo', 'Ira', 'Tristeza', 'Ansiedad', 'Vacío']
  
  console.log('Creating emotions...')
  for (const nombre of emociones) {
    await prisma.emotionCatalog.upsert({
      where: { name: nombre },
      update: {},
      create: { name: nombre },
    })
  }

  // 2. Catálogo de Tipos de Victoria
  const victorias = [
    'Higiene',       // Bañarse, lavarse dientes
    'Alimentación',  // Comer 3 veces
    'No Consumo',    // Mantenerse sobrio
    'Ejercicio',     // Mover el cuerpo
    'Contacto Social' // Hablar con alguien
  ]

  console.log('Creating victory types...')
  for (const nombre of victorias) {
    await prisma.victoryTypeCatalog.upsert({
      where: { name: nombre },
      update: {},
      create: { name: nombre },
    })
  }

  // 3. Catálogo de Escala de Evaluación (Post-Crisis)
  const evaluaciones = [
    'Mejor',
    'Un poco mejor',
    'Igual',
    'Peor'
  ]

  console.log('Creating evaluation scales...')
  for (const desc of evaluaciones) {
    await prisma.evaluationScaleCatalog.upsert({
      where: { description: desc },
      update: {},
      create: { description: desc },
    })
  }

  console.log('Base de datos poblada correctamente.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })