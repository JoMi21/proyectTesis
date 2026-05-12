import { Router } from 'express';
import multer from 'multer';
import { AnalysisController } from '../controllers/analysis.controller.js';

const router = Router();

// Configuracion de Multer: Limite 5MB, solo PDF, en Memoria
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('FORMATO_INVALIDO'));
        }
    }
});

/**
 * Middleware para capturar errores de Multer (tamaño o formato inválido)
 */
const handleUploadError = (req: any, res: any, next: any) => {
    upload.single('report')(req, res, (err) => {
        if (err) {
            if (err.message === 'FORMATO_INVALIDO') {
                return res.status(400).json({ error: 'Formato de archivo no soportado. Solo se permiten PDFs.' });
            }
            return res.status(400).json({ error: `Error al subir el archivo (asegúrate de que no pese más de 5MB). Detalles: ${err.message}` });
        }
        next();
    });
};

// Rutas Limpias (Delegadas al Controller)
router.post('/upload', handleUploadError, AnalysisController.uploadReport);
router.get('/reports', AnalysisController.getAllReports);
router.post('/reports/:id/analyze', AnalysisController.analyzeReport);
router.post('/chat', AnalysisController.chat);

export default router;
