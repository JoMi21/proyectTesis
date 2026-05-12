import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import analysisRoutes from './routes/analysis.routes.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
// Fail-Fast: Verificación estricta de variables de entorno al iniciar
const requiredEnvVars = ['GEMINI_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`\n❌ ERROR FATAL: No se encontró la variable de entorno obligatoria '${envVar}'.`);
        console.error(`Por favor, asegúrate de que el archivo .env esté configurado correctamente.\n`);
        process.exit(1);
    }
}
const app = express();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../src/public')));
// Routes
app.use('/api', analysisRoutes);
// Swagger Documentation Route
try {
    const swaggerDocument = JSON.parse(fs.readFileSync(path.join(__dirname, '../docs/swagger.json'), 'utf8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
catch (err) {
    console.warn("⚠️ No se pudo cargar swagger.json. La documentación en /api-docs no estará disponible.");
}
// General route for index
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/public', 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// Prevent crash on unhandled errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
//# sourceMappingURL=index.js.map