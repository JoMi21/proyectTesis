import { PDFService } from '../services/pdf.service.js';
import { AIService } from '../services/ai.service.js';
import { SupabaseService } from '../services/supabase.service.js';
export class AnalysisController {
    /**
     * Maneja la subida de un reporte, valida el ID de la unidad,
     * extrae el texto del PDF y lo guarda en Supabase.
     */
    static async uploadReport(req, res) {
        try {
            if (!req.file || !req.file.buffer) {
                res.status(400).json({ error: 'No se subió ningún archivo' });
                return;
            }
            const mechanicNotes = req.body.mechanicNotes || '';
            const unitId = req.body.unitId?.trim();
            // 1. Validar Unit ID
            if (!unitId) {
                res.status(400).json({ error: 'El identificador de la unidad (unitId) es obligatorio.' });
                return;
            }
            const validFormatRegex = /^[A-Za-z0-9\-\s]+$/;
            const hasNumberRegex = /\d/;
            if (!validFormatRegex.test(unitId) || !hasNumberRegex.test(unitId)) {
                res.status(400).json({
                    error: 'Formato de unidad inválido. Debe contener al menos un número y evitar caracteres especiales (Ejemplos válidos: "125", "T-10", "Unidad 4").'
                });
                return;
            }
            // 2. Extraer texto y validar contenido del reporte
            const text = await PDFService.extractText(req.file.buffer);
            if (!PDFService.isValidEngineReport(text)) {
                res.status(400).json({
                    error: 'El documento no parece ser un reporte de telemetría válido (DDEC/Nexiq).'
                });
                return;
            }
            // 3. Guardar en BD
            const saveName = `${unitId}___${req.file.originalname}`;
            const report = await SupabaseService.saveReport(saveName, text, mechanicNotes);
            res.json({
                message: 'Reporte procesado y guardado correctamente',
                reportId: report?.id
            });
        }
        catch (error) {
            console.error('Error en uploadReport:', error);
            res.status(500).json({ error: 'Falló el procesamiento del reporte' });
        }
    }
    /**
     * Obtiene todos los reportes almacenados.
     */
    static async getAllReports(_req, res) {
        try {
            const reports = await SupabaseService.getAllReports();
            res.json(reports);
        }
        catch (error) {
            console.error('Error en getAllReports:', error);
            res.status(500).json({ error: 'No se pudieron obtener los reportes' });
        }
    }
    /**
     * Manda a analizar un reporte almacenado mediante Inteligencia Artificial.
     */
    static async analyzeReport(req, res) {
        try {
            const id = req.params.id;
            // 1. Obtener texto de BD
            const report = await SupabaseService.getReportById(id);
            if (!report) {
                res.status(404).json({ error: 'Reporte no encontrado' });
                return;
            }
            // 2. Analizar con IA
            const analysis = await AIService.analyzeLogistics(report.raw_text);
            // 3. Actualizar BD con el análisis
            await SupabaseService.updateAnalysis(id, analysis);
            res.json(analysis);
        }
        catch (error) {
            console.error('Error en analyzeReport:', error);
            res.status(500).json({ error: 'El análisis ha fallado' });
        }
    }
    /**
     * Interactúa con el Agente de Chat pasándole el contexto histórico.
     */
    static async chat(req, res) {
        try {
            const { question } = req.body;
            if (!question) {
                res.status(400).json({ error: 'La pregunta es obligatoria.' });
                return;
            }
            if (question.length > 400) {
                res.status(400).json({ error: 'La pregunta es demasiado larga. Por favor sé más conciso (máximo 400 caracteres).' });
                return;
            }
            // Contexto reciente para la IA
            const recentReports = await SupabaseService.getRecentReports(20);
            const answer = await AIService.chatWithAgent(question, recentReports);
            res.json({ answer });
        }
        catch (error) {
            console.error('Error en chat:', error);
            res.status(500).json({ error: 'El procesamiento del chat falló' });
        }
    }
}
//# sourceMappingURL=analysis.controller.js.map