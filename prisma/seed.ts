// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(' Iniciando poblado de datos (Seeding)...')

  const emociones = [
    'Miedo', 
    'Ira', 
    'Tristeza', 
    'Ansiedad', 
    'Vacío',
    'Vergüenza'
  ]
  
  console.log('Creating emotions...')
  for (const nombre of emociones) {
    await prisma.emotionCatalog.upsert({
      where: { name: nombre },
      update: {},
      create: { name: nombre },
    })
  }

  const victorias = [
    'Higiene personal',     
    'Alimentación saludable',
    'No consumo sustancias', 
    'Ejercicio',
    'Contacto social positivo', 
    'Salí de casa',          
    'Practiqué autocuidado'  
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
    'Un poco mejor', // En tu diseño dice "Un poco", lo estandarizamos aquí
    'Igual',
    'Peor' // O "No" según diseño, pero "Peor" es más claro para métricas
  ]

  console.log('Creating evaluation scales...')
  for (const desc of evaluaciones) {
    await prisma.evaluationScaleCatalog.upsert({
      where: { description: desc },
      update: {},
      create: { description: desc },
    })
  }

  console.log(' Base de datos poblada correctamente.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })