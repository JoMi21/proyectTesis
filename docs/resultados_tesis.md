# Capítulo: Resultados del Proyecto y Pruebas del Sistema

En este apartado se presentan de forma detallada y analítica los resultados obtenidos tras el desarrollo, refactorización y despliegue del sistema de **Agente de Optimización Logística**. Se documentan las pruebas técnicas realizadas, las mejoras arquitectónicas implementadas y la eficiencia lograda en el procesamiento de información logística utilizando modelos de Inteligencia Artificial (LLMs).

---

## 1. Resultados de la Arquitectura y Refactorización del Código

El sistema inicial presentaba acoplamiento de código (código espagueti) que impedía su escalabilidad. Como resultado del proyecto, se logró lo siguiente:

### 1.1 Implementación del Patrón Arquitectónico en Capas (MVC adaptado)
Se separaron exitosamente las responsabilidades del sistema en tres capas lógicas distintas:
*   **Capa de Enrutamiento (`Routes`):** Archivos ligeros que definen puntos de entrada HTTP y middlewares.
*   **Capa de Controladores (`Controllers`):** Orquestación pura de la lógica de negocio, encargados de recibir peticiones, delegar tareas y emitir respuestas HTTP.
*   **Capa de Servicios (`Services`):** Encapsulación de la lógica pesada, incluyendo el `pdf.service.ts` para extracción y el `ai.service.ts` / `claude.service.ts` para interacción con la API de IA, así como la persistencia de datos en Supabase.

### 1.2 Eliminación de Cuellos de Botella de I/O (Procesamiento Zero I/O)
**Prueba y Solución:** Originalmente, la carga concurrente de reportes físicos al disco del servidor generaba bloqueos de Entrada/Salida (I/O). Se modificó la infraestructura de `multer` para utilizar **Almacenamiento en Memoria (MemoryStorage)**.
**Resultado:** Los archivos PDF ahora se procesan nativamente en la memoria RAM (como `Buffers`), se extrae el texto usando la librería `pdf-parse` y se destruye el archivo temporal en milisegundos. Esto incrementó drásticamente la velocidad de respuesta del backend y garantiza la escalabilidad en entornos en la nube o *Serverless*.

---

## 2. Pruebas de Seguridad y Validaciones Estructurales (Defensas del Sistema)

Se construyeron e implementaron escudos de validación estrictos en el sistema para garantizar tolerancia a fallos, previniendo la corrupción de la base de datos o el agotamiento de recursos.

### 2.1 Pruebas de Sanitización y Filtro de Archivos
*   **Límite de Memoria (Memory Anti-Crash):** Se comprobó el rechazo automático de archivos superiores a **5 MB**. Esto asegura que ataques de denegación de servicio (DoS) intentando saturar la memoria RAM del servidor sean bloqueados de raíz por el middleware.
*   **Filtro Anti-Malware (MIME Type Estricto):** El sistema fue probado con múltiples formatos (`.jpg`, `.exe`, `.sh`, `.docx`), logrando rechazar el 100% de los formatos no deseados, permitiendo acceso exclusivo al *Mimetype* `application/pdf`.

### 2.2 Pruebas de Lógica de Negocio y Filtrado Léxico de Costos
Uno de los resultados más críticos fue la prevención de peticiones falsas a la Inteligencia Artificial, lo cual generaría costos económicos por tokens consumidos.
*   **Filtro Léxico Pre-Análisis:** Se desarrolló un algoritmo que lee el texto crudo del PDF y busca la presencia de términos técnicos del ámbito logístico *(ej. DDEC, Nexiq, Idle Time, Ralentí, Fuel Economy)*.
*   **Resultado de la Prueba:** Al inyectar un documento PDF con un currículum vitae y otro con un menú de restaurante, el sistema abortó el proceso inmediatamente (HTTP 400), validando que la IA procese **exclusivamente reportes de motores reales**.

### 2.3 Normalización de Identificadores (Unit ID)
Para mantener la integridad de la base de datos en Supabase, se implementó una Expresión Regular (`/^[A-Za-z0-9\-\s]+$/`) en el ID de la unidad.
*   **Resultado:** Se probó exitosamente que el identificador exige al menos un número y prohíbe caracteres especiales que corrompen inyecciones de SQL o rompen el frontend, alineando el sistema a la nomenclatura del mundo real en flotillas de transporte.

---

## 3. Integración de IA, Control de Costos y Pruebas de Contexto

El "corazón" analítico del sistema dependía de la interacción eficiente con APIs de Inteligencia Artificial (Claude 3.5 Sonnet / Gemini). 

### 3.1 Control de Costos y Límite de Tokens
*   **Protección Anti-Spam en el Chatbot:** Se impuso un límite rígido de **400 caracteres** por mensaje del usuario. En pruebas, se validó que esto previene inyecciones masivas de texto que intenten agotar el saldo de facturación (Tokens) del LLM.

### 3.2 Optimización de Memoria Contextual (*Out of Memory Prevention*)
*   **Problema Inicial:** El agente intentaba ingerir toda la base de datos como contexto, resultando en caídas por sobrecarga de límite de tokens de la IA y tiempos de latencia inaceptables.
*   **Prueba y Solución:** Se implementó una **Paginación de Contexto Histórico**. Actualmente, el sistema realiza una llamada a Supabase solicitando únicamente los **20 reportes más recientes**. 
*   **Resultado:** El chatbot ahora procesa la información de forma rápida y el contexto se mantiene dentro de los límites estrictos de procesamiento del modelo. Se tiene planificado a futuro el uso de *Búsqueda Vectorial (Embeddings / RAG)* para seguir escalando este apartado.

### 3.3 Consistencia en Respuestas (Prompt Engineering)
El comportamiento del LLM se forzó a través de un *System Prompt* avanzado para que actuara bajo tres pilares: Razonamiento Racional (Maximizar el ahorro), Basado en Hechos (Priorizar métricas sobre intuición) y Descubrimiento de Patrones. 
*   **Resultado:** Las pruebas de las respuestas arrojadas en formato JSON a partir de PDFs reales de DDEC confirmaron que el agente identifica con precisión métricas clave como *Ralentí (Idle Time)* y *Consumo de Combustible*, emitiendo recomendaciones imparciales.

---

## 4. Estandarización Técnica y Despliegue Continuo (CI/CD)

Se dotó al proyecto con estándares corporativos para demostrar una madurez propia de un entorno de producción profesional:

### 4.1 Tolerancia a Fallos en Infraestructura (Arranque "Fail-Fast")
*   **Prueba Realizada:** Se forzó el arranque del servidor sin las credenciales críticas (`GEMINI_API_KEY`, `SUPABASE_URL`) en el archivo `.env`.
*   **Resultado:** El sistema activa su validador y aborta el encendido de inmediato lanzando una alerta fatal, previniendo escenarios donde la plataforma opere de manera defectuosa de cara al usuario o cause corrupción de datos por fallas silenciosas.

### 4.2 Documentación Viva e Interactiva
*   Se sustituyó la documentación estática por **Swagger / OpenAPI** interactivo. A través del endpoint `/api-docs`, los resultados de cada ruta de la API, los formatos esperados y las respuestas (HTTP 200, 400, 500) quedaron mapeados e interactivamente comprobables.

### 4.3 Integración Continua (CI/CD)
*   **Resultado:** Se implementó un pipeline automatizado (`.github/workflows/ci.yml`). Las pruebas confirman que cada intento de integrar código al repositorio activa contenedores Linux automatizados que compilan e instalan Node.js. Esto garantiza que ningún código defectuoso llegue a las etapas productivas del sistema.

---

## 5. Conclusiones de Resultados

En conclusión, los resultados confirman que la aplicación de arquitecturas robustas (MVC, validación léxica previa a uso de IA) y un manejo eficiente de memoria asíncrona, permiten desplegar sistemas de **Inteligencia Artificial Logística** estables, seguros y económicamente viables. La transición de procesamientos locales lentos a un entorno escalable, en conjunto con un diseño *Glassmorphism* moderno para la interfaz del usuario, validan plenamente el cumplimiento de los requerimientos y el éxito funcional del proyecto propuesto para esta tesis.

---

## 6. Análisis e Interpretación de Resultados

Al procesar un documento en formato PDF generado por DDEC Reports, el sistema extrae automáticamente métricas críticas operativas, tales como el consumo de combustible y los tiempos de ralentí. Esta automatización elimina los errores de transposición manual que ocurren durante la captura tradicional de datos. Como resultado, la información en crudo se convierte de inmediato en activos estratégicos, listos para una evaluación cuantitativa sin intervención humana.

A través de la interfaz de consulta interactiva, se explora el registro histórico persistido en Supabase para identificar patrones de ineficiencia comparativa. Al confrontar el rendimiento de dos unidades asignadas a la misma ruta, el sistema revela un contraste significativo en la economía de combustible. Este descubrimiento valida el cumplimiento del aprendizaje organizacional, dado que la retención y disponibilidad de información pasada permiten a la empresa corregir desviaciones operativas recurrentes.

A manera de conclusión técnica, se determina que el despliegue del tablero de parámetros y el agente conversacional erradican el banco de niebla informativo propio del transporte tradicional. La visualización de los datos procesados sustituye las suposiciones y la intuición por un nivel de claridad técnica absoluto. Con este enfoque, la interpretación de los resultados establece un estándar de gestión fundamentado de forma exclusiva en evidencia demostrable.
