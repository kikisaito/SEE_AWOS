import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../shared/config/prisma';

interface AuthRequest extends Request {
  user?: { userId: string };
}

const formatDate = (date: Date) => new Intl.DateTimeFormat(
  'es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);

export const generateClinicalReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { startDate, endDate, period } = req.query; 

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    // 1. OBTENER EL NOMBRE REAL DEL USUARIO
    const user = await prisma.user.findUnique({
        where: { userId },
        select: { preferredName: true, email: true }
    });
    const userName = user?.preferredName || user?.email || "Paciente SEE";

    // 2. CONFIGURAR FECHAS (Con soporte para period=week|month|today)
    let end = endDate ? new Date(String(endDate)) : new Date();
    let start = startDate ? new Date(String(startDate)) : new Date();
    
    if (!startDate && !endDate) {
        if (period === 'week') {
            start.setDate(end.getDate() - 7);
        } else if (period === 'month') {
            start.setMonth(end.getMonth() - 1);
        } else if (period === 'today') {
            start.setHours(0, 0, 0, 0);
        } else {
            start.setDate(end.getDate() - 30); 
        }
    }

    // 3. OBTENER DATOS DE CRISIS
   const crisisHistory = await prisma.crisisSession.findMany({
      where: { 
          userId, 
          startedAt: { gte: start, lte: end },
          isReflectionCompleted: true // 🚀 EL CANDADO: Ignora las crisis abandonadas a medias
      },
      include: { 
          selectedEmotions: true, 
          finalEvaluation: true,  
          usedCapsule: true
      },
      orderBy: { startedAt: 'desc' }
    });

    // 4. OBTENER VICTORIAS
    const victories = await prisma.userVictory.findMany({
      where: { userId, occurredAt: { gte: start, lte: end } },
      include: { victoryType: true }
    });

    // --- A. Procesar Emociones ---
    const emotionCounts: Record<string, number> = {};
    crisisHistory.forEach((c: any) => { 
      if (c.selectedEmotions && Array.isArray(c.selectedEmotions)) {
          c.selectedEmotions.forEach((e: any) => { 
            const emotionName = e.name || 'Desconocida';
            emotionCounts[emotionName] = (emotionCounts[emotionName] || 0) + 1;
          });
      }
    });

    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([name, count]) => ({
        name,
        count,
        percent: crisisHistory.length > 0 ? ((count / crisisHistory.length) * 100).toFixed(1) : "0"
      }));

    const crisesWithCapsule = crisisHistory.filter((c: any) => c.usedCapsuleId !== null && c.usedCapsuleId !== undefined).length;
    
    const crisesImproved = crisisHistory.filter((c: any) => { 
        const evalData = c.finalEvaluation;
        if (!evalData) return false;
        const desc = typeof evalData === 'string' ? evalData : evalData.description;
        return desc === 'Mejor' || desc === 'Un poco mejor';
    }).length;

    // --- B. Procesar Victorias ---
    const victoryCounts: Record<string, number> = {};
    victories.forEach((v: any) => { 
      if (v.victoryType && v.victoryType.name) {
          const cleanName = v.victoryType.name.replace(/\['\s*/g, '').replace(/'\]/g, '').trim();
          victoryCounts[cleanName] = (victoryCounts[cleanName] || 0) + 1;
      }
    });
    const sortedVictories = Object.entries(victoryCounts).sort(([,a], [,b]) => b - a);

    // --- CONFIGURACIÓN DEL ARCHIVO PDF ---
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SEE_Reporte_${userName.replace(/\s+/g, '_')}.pdf`);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);
    
    // --- ENCABEZADO TIPO "TERMINAL" ---
    doc.fontSize(18).font('Courier-Bold').text('INFORME GENERADO POR SEE/AWOS');
    doc.fontSize(10).font('Courier').text('============================================================');
    doc.text(`PACIENTE: ${userName}`); 
    doc.text(`PERIODO:  ${formatDate(start)} - ${formatDate(end)}`);
    doc.text(`GENERADO: ${new Date().toLocaleString()}`);
    doc.text('============================================================');
    doc.moveDown();

    // --- SECCIÓN 1: RESUMEN GENERAL ---
    doc.fontSize(14).font('Courier-Bold').text('[1] RESUMEN GENERAL');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Courier');
    doc.text(`• Total de Crisis:      ${crisisHistory.length}`);
    
    const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const freq = crisisHistory.length > 0 ? (daysDiff / crisisHistory.length).toFixed(1) : "N/A";
    
    doc.text(`• Frecuencia Estimada:  Una crisis cada ${freq} días`);
    
    doc.moveDown(0.5);
    doc.font('Courier-Bold').text('EMOCIONES PREDOMINANTES:');
    doc.font('Courier');
    if (sortedEmotions.length === 0) doc.text("  Sin datos suficientes.");
    sortedEmotions.slice(0, 5).forEach((e: any) => {
      doc.text(`  - ${e.name.padEnd(15)}: ${e.count} eventos (${e.percent}%)`);
    });
    doc.moveDown();






    // --- SECCIÓN 2: EFECTIVIDAD ---
    doc.fontSize(14).font('Courier-Bold').text('[2] EFECTIVIDAD DE ESTRATEGIAS');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Courier');
    
    const capsulePercent = crisisHistory.length > 0 ? ((crisesWithCapsule / crisisHistory.length) * 100).toFixed(0) : "0";
    const improvePercent = crisisHistory.length > 0 ? ((crisesImproved / crisisHistory.length) * 100).toFixed(0) : "0";

    doc.text(`• Uso de Cápsulas:      ${crisesWithCapsule} de ${crisisHistory.length} crisis (${capsulePercent}%)`);
    doc.text(`• Tasa de Mejora:       ${crisesImproved} de ${crisisHistory.length} crisis reportaron alivio (${improvePercent}%)`);
    doc.text(`• Ejercicios Resp.:     ${crisisHistory.filter((c: any) => c.breathingExerciseCompleted).length} completados`);
    doc.moveDown();

    // --- SECCIÓN 3: VICTORIAS (HÁBITOS) ---
    doc.fontSize(14).font('Courier-Bold').text('[3] PATRONES DE AUTOCUIDADO');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Courier');
    doc.text(`• Total de Victorias:   ${victories.length}`);
    doc.moveDown(0.5);
    doc.text('HÁBITOS MÁS FRECUENTES:');
    if (sortedVictories.length === 0) doc.text("  Sin registros aún.");
    sortedVictories.forEach(([name, count]: [string, number]) => {
      const percent = victories.length > 0 ? ((count / victories.length) * 100).toFixed(0) : "0";
      doc.text(`  [✔] ${name.padEnd(25)}: ${count} veces (${percent}%)`);
    });
    doc.moveDown();

    // --- SECCIÓN 4: BITÁCORA DETALLADA (EL TÍTULO QUE FALTABA) ---
    doc.fontSize(14).font('Courier-Bold').text('[4] DETALLE CRONOLÓGICO');
    doc.text('------------------------------------------------------------');
    doc.moveDown(0.5);

    crisisHistory.forEach((crisis: any) => {
        if (doc.y > 700) doc.addPage(); 

        doc.fontSize(10).font('Courier-Bold').text(`${formatDate(new Date(crisis.startedAt))}`);
        doc.font('Courier').fontSize(9);
        
        const finalEval = typeof crisis.finalEvaluation === 'string' 
          ? crisis.finalEvaluation 
          : (crisis.finalEvaluation?.description || 'N/A');

        doc.text(`   Intensidad: ${crisis.intensityLevel || 'N/A'}/10 | Estado Final: ${finalEval}`);
        
        if (crisis.selectedEmotions && Array.isArray(crisis.selectedEmotions)) {
            const emNames = crisis.selectedEmotions.map((e: any) => e.name).filter(Boolean).join(', ');
           doc.text(`   Emociones:  ${emNames}`);
        }
        
        if (crisis.location)     doc.text(`   Lugar:      ${crisis.location}`);
        if (crisis.companion)    doc.text(`   Compañía:   ${crisis.companion}`);
        if (crisis.substanceUse) doc.text(`   Sustancias: ${crisis.substanceUse}`);
        if (crisis.triggerDesc)  doc.text(`   Detonante:  "${crisis.triggerDesc}"`);
        if (crisis.notes)        doc.text(`   Notas:      "${crisis.notes}"`);
        
        doc.moveDown(0.5);
    });
    
    doc.end();
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Error generating report" });
  }
};