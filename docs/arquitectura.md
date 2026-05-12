# Documentación de Arquitectura de Software

## 1. Arquitectura Actual
Actualmente, la aplicación cuenta con una **Arquitectura Monolítica** en el backend construida sobre **Node.js y Express**, conectada a **Supabase** como Backend-as-a-Service (BaaS) para la persistencia de datos, y comunicándose con APIs externas de inteligencia artificial (Gemini de Google).

### Flujo Actual
1. **Frontend / Cliente:** Se comunica mediante peticiones HTTP REST a los endpoints de Express (en el puerto 3000).
2. **Controladores (Routes):** Reciben la petición (ej. `/upload`, `/chat`, `/reports`) y actúan como intermediarios.
3. **Servicios (Services):**
   - **PDFService:** Extrae texto de los reportes. Inicialmente escribía a disco; ahora extrae el texto **directamente desde la memoria (RAM)** usando Buffers, lo que mejora drásticamente los tiempos de lectura y reduce el I/O.
   - **AIService:** Procesa el texto extraído y consulta a la API de Gemini mediante un prompt estructurado (JSON).
   - **SupabaseService:** Realiza el CRUD a la base de datos de PostgreSQL alojada en Supabase.

### Problemas Previos de Escalabilidad Resueltos
- **Cuello de Botella en el Almacenamiento Local:** Antes, cada reporte subido se guardaba temporalmente en el disco del servidor mediante `multer`. Si el sistema hubiese tenido múltiples subidas concurrentes o estuviera balanceado en varias instancias efímeras (ej. Kubernetes), hubiese generado colapsos y fallos de I/O. Se cambió a **`memoryStorage`**.
- **Sobrecarga de Contexto en IA (Out-Of-Memory/Token Limits):** En el chat interactivo, se estaba enviando el historial de *todos* los reportes existentes al agente, lo cual no es escalable si se tienen cientos de registros. Se optimizó implementando un sistema de paginación (`getRecentReports`) limitando la información.

---

## 2. Propuesta de Evolución: Sistema Orientado a Microservicios o Endpoints Distribuidos (Serverless)

Para lograr una escalabilidad masiva y prepararse para un entorno donde existan cientos de usuarios simultáneos analizando reportes complejos, la arquitectura debe migrar a un **Sistema Basado en Servicios Desacoplados**. 

### 2.1 Cómo funcionaría
En este modelo, el sistema se dividiría en múltiples procesos (o funciones Lambda/Serverless), donde el Backend principal ya no hace todo el trabajo pesado sincrónicamente, sino que delega.

1. **API Gateway:** Único punto de entrada para los clientes. Enruta las solicitudes a los distintos servicios.
2. **Servicio de Archivos (File Service):** 
   - El cliente no envía el PDF al servidor de Express. En su lugar, el servidor le otorga una "URL firmada" (Signed URL) de Supabase Storage o AWS S3. 
   - El cliente sube el archivo **directamente a la nube**.
3. **Event-Driven Processing (Pub/Sub):**
   - Cuando el archivo se sube exitosamente, la base de datos lanza un **evento (Webhook)**.
   - Un **Servicio de Extracción (Worker)** recibe la notificación, descarga el PDF y extrae el texto.
   - Este Worker envía el texto extraído a un servicio de encolamiento (Kafka, RabbitMQ, o AWS SQS).
4. **Servicio de IA (AI Service):**
   - Consume mensajes de la cola a su propio ritmo.
   - Llama a Gemini / Claude. Si la API externa se cae o responde lento, el mensaje se reintenta automáticamente gracias a la cola sin afectar al usuario final.
   - Guarda el resultado del análisis nuevamente en Supabase y notifica al cliente (ej. por WebSockets o Server-Sent Events) que su análisis está listo.

### 2.2 Beneficios del Nuevo Modelo Detallado
- **Escalabilidad Horizontal:** Si de repente se suben 1,000 PDFs, el servidor API no colapsa, simplemente se encolan 1,000 trabajos que los "Workers" irán procesando según los recursos disponibles.
- **Tolerancia a Fallos (Resiliencia):** Si la API de Google falla temporalmente, el trabajo se vuelve a encolar sin que el usuario tenga que subir el archivo otra vez.
- **Sin tiempos de espera (Timeout):** En la arquitectura actual (REST Síncrono), el usuario debe esperar a que se procese el archivo para recibir respuesta (lo que puede dar un `HTTP 504 Gateway Timeout` si tarda más de 30 segundos). Con este nuevo enfoque, el usuario recibe un estado "En proceso..." inmediatamente y es notificado cuando finaliza.
- **Búsqueda Vectorial (RAG):** Para escalar el chat, los análisis no se mandan crudos a la IA. En su lugar, se generarían "Embeddings" (vectores matemáticos de los textos) almacenados en una base de datos vectorial (Supabase soporta `pgvector`), permitiendo al chatbot buscar solo los fragmentos relevantes exactos en lugar de enviar el historial entero, reduciendo masivamente el consumo de tokens.
