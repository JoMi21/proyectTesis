# Guía de Estudio: Arquitectura del Sistema (Cliente-Servidor)

Este documento explica cómo está estructurado el "Logistics OptiAgent" para que puedas defender con seguridad las decisiones técnicas de tu tesis.

## 1. El Paradigma "Thin Client" (Cliente Ligero)
Tu proyecto utiliza una arquitectura de **Cliente Ligero**. Esto significa que el Frontend (la interfaz visual) es intencionalmente sencillo y delega todo el trabajo pesado (cálculos, inteligencia artificial, base de datos) al Servidor (Backend).

Esto es ideal para tu tesis porque el núcleo de tu investigación no es crear una página web compleja, sino **resolver un problema logístico usando Inteligencia Artificial**.

## 2. El Frontend (La Capa de Presentación)
**Ubicación en el código:** Carpeta `src/public/`

### ¿Qué tecnologías usa?
*   **HTML5, CSS3 y Vanilla JavaScript** (JS puro, sin frameworks como React o Angular).
*   **Librerías externas:** `Chart.js` para visualización gráfica.

### ¿Cuál es su rol?
1.  **Recopilar datos del usuario:** El mecánico sube el PDF y escribe notas.
2.  **Hacer peticiones (Requests):** Usando `fetch()`, el código de `admin.js` o `upload.js` le "pide" al Backend que haga el trabajo (por ejemplo, `/api/reports`).
3.  **Dibujar (Renderizar):** Una vez que el Backend responde con los datos (en formato JSON), el Frontend toma esos números y "dibuja" las gráficas y las tarjetas con la estética de *Glassmorphism*.

### Justificación para la Tesis:
*"Decidí implementar el Frontend con Vanilla JS porque la complejidad de estado de la interfaz es baja. Un framework como React habría añadido una sobrecarga innecesaria ('over-engineering'), ya que el verdadero valor y la complejidad de este sistema residen en el procesamiento de lenguaje natural en el servidor."*

## 3. El Backend (El Cerebro / Capa Lógica)
**Ubicación en el código:** Carpeta `src/` (y compilado en `dist/`)

### ¿Qué tecnologías usa?
*   **Node.js y Express:** Para montar el servidor de API REST.
*   **TypeScript:** Para dar tipado fuerte y evitar errores de ejecución.
*   **Supabase (PostgreSQL):** Como base de datos persistente.
*   **SDKs de IA:** Google Generative AI (Gemini) y Anthropic (Claude).
*   **Procesamiento de Archivos:** `multer` (para recibir el archivo) y `pdf-parse` (para extraer texto).

### ¿Cuál es su rol?
Es el motor del sistema. Realiza todo el trabajo "sucio" y pesado:
1.  **Recepción segura:** Recibe el PDF subido desde el navegador.
2.  **Extracción de Texto:** Convierte el binario del PDF en texto plano.
3.  **Orquestación de IA:** Inyecta el texto junto con el *System Prompt* estricto y lo envía a los servidores de Google o Anthropic.
4.  **Limpieza de Datos:** Recibe la respuesta de la IA y se asegura de que sea un JSON válido.
5.  **Persistencia:** Guarda todo el historial en Supabase.
6.  **Distribución:** Expone rutas web (API REST) para que el Frontend pueda consumir la información ya masticada y procesada.

## 4. Preguntas Frecuentes en una Defensa

**Q: ¿Por qué usaste Node.js en lugar de Python, si Python es el rey de la IA?**
*A: "Porque Node.js, gracias a su naturaleza asíncrona, es excelente para manejar operaciones de entrada/salida (I/O) intensivas, como leer archivos PDF y hacer llamadas de red a APIs externas (Google/Anthropic) sin bloquear el servidor. Además, al usar TypeScript, pude unificar el lenguaje de todo el stack (Frontend y Backend)."*

**Q: ¿Qué pasa si la IA se satura o se cae?**
*A: "El sistema cuenta con una arquitectura Multi-Modelo. Actualmente usa Gemini 2.5 Flash, pero con un simple cambio de variable de entorno puede utilizar Claude 3.5 Sonnet, ofreciendo tolerancia a fallos por proveedor."*
