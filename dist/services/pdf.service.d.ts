export declare class PDFService {
    /**
     * Extracts text from a PDF file buffer.
     * @param buffer Buffer containing the PDF file.
     * @returns Extracted text as a string.
     */
    static extractText(buffer: Buffer): Promise<string>;
    /**
     * Valida si el texto extraído parece ser un reporte de motor válido.
     * Busca coincidencias de palabras clave tanto en inglés como en español.
     */
    static isValidEngineReport(text: string): boolean;
}
