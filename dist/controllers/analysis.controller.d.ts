import { Request, Response } from 'express';
export declare class AnalysisController {
    /**
     * Maneja la subida de un reporte, valida el ID de la unidad,
     * extrae el texto del PDF y lo guarda en Supabase.
     */
    static uploadReport(req: Request, res: Response): Promise<void>;
    /**
     * Obtiene todos los reportes almacenados.
     */
    static getAllReports(_req: Request, res: Response): Promise<void>;
    /**
     * Manda a analizar un reporte almacenado mediante Inteligencia Artificial.
     */
    static analyzeReport(req: Request, res: Response): Promise<void>;
    /**
     * Interactúa con el Agente de Chat pasándole el contexto histórico.
     */
    static chat(req: Request, res: Response): Promise<void>;
}
