import { PDFParse } from 'pdf-parse';
export class PDFService {
    /**
     * Extracts text from a PDF file buffer.
     * @param buffer Buffer containing the PDF file.
     * @returns Extracted text as a string.
     */
    static async extractText(buffer) {
        try {
            const parser = new PDFParse({ data: buffer });
            const result = await parser.getText();
            return result.text;
        }
        catch (error) {
            console.error('Error parsing PDF:', error);
            throw new Error('Failed to extract text from PDF');
        }
    }
    /**
     * Valida si el texto extraído parece ser un reporte de motor válido.
     * Busca coincidencias de palabras clave tanto en inglés como en español.
     */
    static isValidEngineReport(text) {
        const keywords = [
            'ddec', 'detroit diesel', 'nexiq', 'cummins',
            'trip activity', 'actividad de viaje', 'reporte de actividad',
            'fuel economy', 'economía de combustible', 'rendimiento',
            'idle time', 'tiempo de ralentí', 'ralenti', 'ralentí',
            'engine', 'motor', 'rpm', 'hard brake', 'frenado'
        ];
        const lowerText = text.toLowerCase();
        let matchCount = 0;
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                matchCount++;
            }
        }
        // Se requieren al menos 2 o 3 coincidencias para considerarlo un reporte válido.
        // Esto evita que un currículum o menú de restaurante pase la validación.
        return matchCount >= 3;
    }
}
//# sourceMappingURL=pdf.service.js.map