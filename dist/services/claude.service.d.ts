export declare class ClaudeService {
    private static systemPrompt;
    /**
     * Analyzes logistics data using Claude.
     * @param extractedText Text from the PDF report.
     * @returns Analysis results as a JSON object.
     */
    static analyzeLogistics(extractedText: string): Promise<any>;
}
