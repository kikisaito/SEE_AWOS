import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../shared/config/prisma';

interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

const formatDate = (date: Date) => new Intl.DateTimeFormat('es-MX', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);

export const generateClinicalReport = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const userEmail = (req as AuthRequest).user?.email || "Usuario";
    const { startDate, endDate } = req.query;

    if (!userId) return res.status(401).json({ error: "No autorizado" });

    // 1. Configurar Fechas
    const end = endDate ? new Date(String(endDate)) : new Date();
    const start = startDate ? new Date(String(startDate)) : new Date();
    if (!startDate) start.setDate(end.getDate() - 30);

    // 2. OBTENER DATOS DE CRISIS (Para análisis profundo)
    const crisisHistory = await prisma.crisisSession.findMany({
      where: { userId, startedAt: { gte: start, lte: end } },
      include: { selectedEmotions: true, finalEvaluation: true },
      orderBy: { startedAt: 'desc' }
    });

    // 3. OBTENER VICTORIAS CON DETALLE (Para saber de qué tipo son)
    const victories = await prisma.userVictory.findMany({
      where: { userId, occurredAt: { gte: start, lte: end } },
      include: { victoryType: true }
    });

    
    const emotionCounts: Record<string, number> = {};
    crisisHistory.forEach(c => {
      c.selectedEmotions.forEach(e => {
        emotionCounts[e.name] = (emotionCounts[e.name] || 0) + 1;
      });
    });
    // Convertir a array y ordenar por frecuencia
    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([name, count]) => ({
        name,
        count,
        percent: crisisHistory.length > 0 ? ((count / crisisHistory.length) * 100).toFixed(1) : "0"
      }));

    // B. Efectividad de Estrategias
    const crisesWithCapsule = crisisHistory.filter(c => c.usedCapsuleId !== null).length;
    const crisesImproved = crisisHistory.filter(c => 
      c.finalEvaluation?.description === 'Mejor' || c.finalEvaluation?.description === 'Un poco mejor'
    ).length;

    // C. Victorias más frecuentes
    const victoryCounts: Record<string, number> = {};
    victories.forEach(v => {
      victoryCounts[v.victoryType.name] = (victoryCounts[v.victoryType.name] || 0) + 1;
    });
    const sortedVictories = Object.entries(victoryCounts)
      .sort(([,a], [,b]) => b - a);


    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SEE_Reporte_${Date.now()}.pdf`);

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    doc.pipe(res);

    
    const bgDark = '#1E1E1E';  
    
    
    // --- ENCABEZADO TIPO "TERMINAL" ---
    doc.fontSize(18).font('Courier-Bold').text('INFORME CLÍNICO GENERADO POR SEE/AWOS');
    doc.fontSize(10).font('Courier').text('============================================================');
    doc.text(`PACIENTE: ${userEmail}`);
    doc.text(`PERIODO:  ${formatDate(start)} - ${formatDate(end)}`);
    doc.text(`GENERADO: ${new Date().toLocaleString()}`);
    doc.text('============================================================');
    doc.moveDown();

    // --- SECCIÓN 1: RESUMEN GENERAL ---
    doc.fontSize(14).font('Courier-Bold').text('[1] RESUMEN GENERAL');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Courier');
    doc.text(`• Total de Crisis:      ${crisisHistory.length}`);
    
    // Calcular frecuencia aprox (días entre crisis)
    const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const freq = crisisHistory.length > 0 ? (daysDiff / crisisHistory.length).toFixed(1) : "N/A";
    doc.text(`• Frecuencia Estimada:  Una crisis cada ${freq} días`);
    
    doc.moveDown(0.5);
    doc.font('Courier-Bold').text('EMOCIONES PREDOMINANTES:');
    doc.font('Courier');
    if (sortedEmotions.length === 0) doc.text("  Sin datos suficientes.");
    sortedEmotions.slice(0, 5).forEach(e => {
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
    doc.text(`• Ejercicios Resp.:     ${crisisHistory.filter(c => c.breathingExerciseCompleted).length} completados`);
    doc.moveDown();

    // --- SECCIÓN 3: VICTORIAS (HÁBITOS) ---
    doc.fontSize(14).font('Courier-Bold').text('[3] PATRONES DE AUTOCUIDADO');
    doc.moveDown(0.5);
    doc.fontSize(10).font('Courier');
    doc.text(`• Total de Victorias:   ${victories.length}`);
    doc.moveDown(0.5);
    doc.text('HÁBITOS MÁS FRECUENTES:');
    if (sortedVictories.length === 0) doc.text("  Sin registros aún.");
    sortedVictories.forEach(([name, count]) => {
      const percent = victories.length > 0 ? ((count / victories.length) * 100).toFixed(0) : "0";
      doc.text(`  [✔] ${name.padEnd(25)}: ${count} veces (${percent}%)`);
    });
    doc.moveDown();

    // --- SECCIÓN 4: BITÁCORA DETALLADA ---
    doc.fontSize(14).font('Courier-Bold').text('[4] DETALLE CRONOLÓGICO');
    doc.text('------------------------------------------------------------');
    doc.moveDown(0.5);
    
    crisisHistory.forEach(crisis => {
        // Control de salto de página
        if (doc.y > 700) doc.addPage();

        doc.fontSize(10).font('Courier-Bold').text(`${formatDate(new Date(crisis.startedAt))}`);
        doc.font('Courier').fontSize(9);
        doc.text(`   Intensidad: ${crisis.intensityLevel}/10 | Estado Final: ${crisis.finalEvaluation?.description || 'N/A'}`);
        doc.text(`   Emociones:  ${crisis.selectedEmotions.map(e => e.name).join(', ')}`);
        if (crisis.triggerDesc) doc.text(`   Detonante:  "${crisis.triggerDesc}"`);
        if (crisis.notes) doc.text(`   Notas:      "${crisis.notes}"`);
        doc.moveDown(0.5);
    });

    // Pie de página legal
    doc.fontSize(8).text(
      '\n\nAVISO: Este reporte es una herramienta complementaria y no sustituye el juicio clínico profesional.',
      { align: 'center' }
    );

    doc.end();

  } catch (error) {
    console.error("Error reporte:", error);
    if (!res.headersSent) res.status(500).json({ error: "Error generando reporte" });
  }
};