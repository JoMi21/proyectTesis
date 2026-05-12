# Reporte de Optimizaciones, Seguridad y Estándares Técnicos

Este documento detalla todas las refactorizaciones, validaciones lógicas y estándares de la industria que se implementaron en el backend del proyecto para garantizar su fiabilidad, escalabilidad y nivel profesional.

## 1. Arquitectura y Código Limpio (Clean Code)

### Patrón MVC (Modelo-Vista-Controlador)
Para evitar el anti-patrón de "Código Espagueti", el monolito fue refactorizado aplicando el principio de Separación de Responsabilidades:
- **Routes (`analysis.routes.ts`):** Archivo ligero que únicamente define los puntos de entrada HTTP (Endpoints) y aplica los middlewares necesarios (como la captura de errores de subida).
- **Controllers (`analysis.controller.ts`):** Orquesta la lógica de negocio. Recibe la petición, llama a los servicios adecuados y emite la respuesta HTTP.
- **Services (`ai.service.ts`, `pdf.service.ts`):** Ejecutan la lógica pesada (IA, análisis de PDFs, acceso a base de datos).

---

## 2. Capas de Seguridad y Validaciones (Defensas del Sistema)

Se construyeron múltiples "escudos" de validación para evitar que errores humanos o ataques maliciosos colapsen el sistema o generen gastos innecesarios de IA.

### A. Protecciones de Entrada de Archivos
- **Almacenamiento en Memoria (Zero I/O):** Los PDFs ya no se escriben en el disco duro físico del servidor. Se cargan directamente a la memoria RAM como un `Buffer` para extraer el texto y luego se desechan. Esto soluciona cuellos de botella de disco ante múltiples peticiones concurrentes.
- **Límite de Tamaño (Memory Anti-Crash):** Se configuró la librería `multer` para rechazar automáticamente cualquier archivo que supere los **5 MB**. Esto previene que un atacante sature la RAM del servidor.
- **Validación de Tipo MIME (Anti-Malware):** El servidor rechaza de raíz archivos con extensiones peligrosas (ej. `.exe`, `.sh`, `.jpg`). Solo permite un Mimetype estricto de `application/pdf`.

### B. Validaciones Lógicas de Negocio
- **Filtro Léxico de PDFs:** Antes de enviar el documento a la costosa API de Google Gemini, el sistema evalúa internamente si el PDF realmente es de motores. Analiza el texto en búsqueda de al menos 3 coincidencias de palabras clave bilingües (*DDEC, Nexiq, Idle Time, Ralentí, Fuel Economy*). Si es un currículum o menú de restaurante, devuelve un error HTTP 400.
- **Normalización del Unit ID:** Se implementó una Expresión Regular (Regex) estricta para el identificador del camión: `/^[A-Za-z0-9\-\s]+$/`. Exige que no esté vacío, prohíbe caracteres especiales que corrompan bases de datos, e **impone la existencia de al menos un número** (para adaptarse a la nomenclatura real de flotillas).

### C. Control de Costos y Recursos de IA
- **Protección contra Spam en Chat:** El endpoint `/chat` restringe las preguntas a un máximo de **400 caracteres**. Esto evita que usuarios inyecten textos masivos que agoten la cuota de Tokens de la API.
- **Paginación de Contexto Histórico:** El chat inteligente ya no absorbe el 100% de la base de datos como contexto (lo que causaría errores *Out of Memory* en la IA). Ahora, solicita exclusivamente a Supabase los 20 reportes más recientes.

### D. Seguridad de Infraestructura
- **Arranque "Fail-Fast":** Se programó un validador en `index.ts` que escanea el archivo `.env` al encender. Si faltan credenciales críticas (como `GEMINI_API_KEY` o `SUPABASE_URL`), el sistema aborta el encendido de inmediato lanzando una alerta fatal. Esto evita que el proyecto se caiga silenciosamente en un entorno de Producción.

---

## 3. Estándares Industriales y de Integración

Para asegurar que el backend funcione en el mundo real junto a otros sistemas o equipos de desarrollo, se implementaron estándares corporativos:

- **CORS (Cross-Origin Resource Sharing):** Se habilitó el acceso seguro para permitir que cualquier aplicación Frontend moderna (React, Angular, apps móviles) consuma la API sin ser bloqueada por los navegadores web.
- **Documentación Viva (Swagger / OpenAPI):** En lugar de forzar a futuros desarrolladores a probar las rutas "a ciegas" con herramientas como Postman, se integró `swagger-ui-express`. A través del endpoint `/api-docs`, el servidor despliega un manual interactivo web generado automáticamente que lista todas las rutas, los formatos esperados, y proporciona botones para probarlas en tiempo real.
- **Integración Continua (CI/CD):** Se creó un flujo automatizado (`.github/workflows/ci.yml`). Cada vez que el código es empujado (push) a GitHub, servidores externos inician Ubuntu Linux, instalan Node.js y verifican que el proyecto compile correctamente, garantizando que código roto nunca llegue a producción.
