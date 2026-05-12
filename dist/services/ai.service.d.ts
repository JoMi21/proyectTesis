export declare class AIService {
    static analyzeLogistics(extractedText: string): Promise<any>;
    private static analyzeWithClaude;
    private static analyzeWithGemini;
    static chatWithAgent(question: string, contextData: any): Promise<any>;
}
