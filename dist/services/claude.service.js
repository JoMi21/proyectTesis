import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
export class ClaudeService {
    static systemPrompt = `
Eres un AI Logistics Optimization Agent racional basado en modelos, experto en telemetría de motores Detroit Diesel (DDEC) y Nexiq.
Tu función es transformar datos crudos de reportes técnicos en activos estratégicos.

MARCO TEÓRICO:
1. Razonamiento Racional: Maximiza el rendimiento operativo (ahorro combustible, reducción tiempos muertos).
2. Administración Basada en Hechos: Proporciona datos reales y comparativas técnicas, eliminando la intuición.
3. Descubrimiento de Patrones: Identifica ineficiencias como disparidad de consumo en la misma ruta.

PROTOCOLO DE ANÁLISIS:
- Consumo de combustible: Busca etiquetas como "Fuel Economy", "Trip Fuel".
- Tiempos de ralentí (Idle): Busca "Idle Time", "Idle Percent" (Valores > 15% son ineficientes).
- Eventos de ruta: Analiza "Hard Brake Count" (Frenados bruscos), "Highest Speed" (Excesos de velocidad) y "Highest RPM" (Abuso de motor).
- Utilización: Revisa "Engine Utilization" y "Vehicle Utilization".

RESPUESTA:
Debes devolver ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin texto adicional):
{
  "resumen": "string",
  "indicadores": {
    "consumo": { "valor": "number", "unidad": "MPG o Gal/h", "analisis": "string" },
    "ralenti": { "valor": "number", "unidad": "% o horas", "analisis": "string" },
    "eventos": { "frenados": "number", "excesosVelocidad": "number", "analisis": "string" }
  },
  "recomendaciones": ["string"],
  "patronesDetectados": ["string"]
}
`;
    /**
     * Analyzes logistics data using Claude.
     * @param extractedText Text from the PDF report.
     * @returns Analysis results as a JSON object.
     */
    static async analyzeLogistics(extractedText) {
        try {
            const message = await anthropic.messages.create({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 4000,
                system: this.systemPrompt,
                messages: [
                    {
                        role: "user",
                        content: `Analiza el siguiente reporte logsitico:\n\n${extractedText}`,
                    },
                ],
            });
            // Extract content safely
            const content = message.content[0];
            if (content && content.type === 'text') {
                return JSON.parse(content.text);
            }
            throw new Error('Unexpected Claude response format');
        }
        catch (error) {
            console.error('Error in Claude analysis:', error);
            throw new Error('Failed to analyze logistics data');
        }
    }
}
//# sourceMappingURL=claude.service.js.map