import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();
const systemPrompt = `
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
- Análisis Integral: Evalúa todos los demás parámetros capturados (temperaturas, presiones, códigos de falla, etc.) para dar una perspectiva general del estado de la unidad. Identifica y resalta el parámetro más anormal o crítico que requiera atención inmediata.

RESPUESTA:
Debes devolver ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin texto adicional, sin bloques de código markdown):
{
  "resumen": "string",
  "indicadores": {
    "consumo": { "valor": "number", "unidad": "MPG o Gal/h", "analisis": "string" },
    "ralenti": { "valor": "number", "unidad": "% o horas", "analisis": "string" },
    "eventos": { "frenados": "number", "excesosVelocidad": "number", "analisis": "string" }
  },
  "analisisIntegral": {
    "perspectivaGeneral": "string",
    "parametroMasCritico": {
      "nombre": "string",
      "valor": "string",
      "motivo": "string"
    }
  },
  "recomendaciones": ["string"],
  "patronesDetectados": ["string"]
}
`;
export class AIService {
    static async analyzeLogistics(extractedText) {
        const provider = (process.env.AI_PROVIDER || 'gemini').trim().toLowerCase();
        console.log(`Usando Proveedor: ${provider}`);
        if (provider === 'claude') {
            return this.analyzeWithClaude(extractedText);
        }
        else {
            return this.analyzeWithGemini(extractedText);
        }
    }
    static async analyzeWithClaude(text) {
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const message = await anthropic.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 4000,
            system: systemPrompt,
            messages: [{ role: "user", content: `Analiza el siguiente reporte:\n\n${text}` }],
        });
        const content = message.content[0];
        if (content && content.type === 'text') {
            let jsonText = content.text;
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (jsonMatch)
                jsonText = jsonMatch[0];
            return JSON.parse(jsonText);
        }
        throw new Error('Unexpected Claude response');
    }
    static async analyzeWithGemini(text) {
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        // Usamos el endpoint v1beta de Google con gemini-2.5-flash (el modelo 1.5 ya no está disponible)
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{
                    parts: [{ text: `INSTRUCCIONES:\n${systemPrompt}\n\nREPORTE:\n${text}` }]
                }],
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
                responseMimeType: "application/json"
            }
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error de Google API:', JSON.stringify(errorData, null, 2));
                throw new Error(`Google API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            let jsonText = data.candidates[0].content.parts[0].text;
            try {
                return JSON.parse(jsonText);
            }
            catch (e) {
                const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
                if (!jsonMatch)
                    throw new Error("No se encontró JSON en la respuesta de Gemini");
                return JSON.parse(jsonMatch[0]);
            }
        }
        catch (error) {
            console.error('Error en analyzeWithGemini:', error);
            throw error;
        }
    }
    static async chatWithAgent(question, contextData) {
        const apiKey = (process.env.GEMINI_API_KEY || '').trim();
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        // Construir un contexto reducido para no exceder los tokens (solo la info clave)
        const simplifiedContext = contextData.map((r) => ({
            unidad: r.file_name,
            fecha: r.created_at,
            indicadores: r.analysis_data?.indicadores || null
        })).filter((r) => r.indicadores !== null);
        const chatPrompt = `Eres un Agente Consultor Experto en Logística. Tienes acceso al siguiente historial de análisis de la flota:
${JSON.stringify(simplifiedContext)}

RESTRICCIONES IMPORTANTES DE REDACCIÓN (NORMATIVA ITSON):
1. Redacta tu respuesta estrictamente en voz impersonal (ej. "se observó", "se recomienda", NO "yo observo", "recomiendo" o "hemos encontrado").
2. Está estrictamente prohibido utilizar gerundios (palabras terminadas en -ando, -iendo).
3. Responde de manera profesional, analítica, directa y basándote ÚNICAMENTE en los datos proporcionados. Si la pregunta no está relacionada con la logística o los datos, indica que no es posible procesar la solicitud.

Pregunta del usuario: ${question}`;
        const payload = {
            contents: [{ parts: [{ text: chatPrompt }] }],
            generationConfig: { temperature: 0.2 }
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                throw new Error('Error de Google API en Chatbot');
            }
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        }
        catch (error) {
            console.error('Error en chatWithAgent:', error);
            return "Se detectó un error de conexión con el motor de inferencia. Favor de reintentar.";
        }
    }
}
//# sourceMappingURL=ai.service.js.map