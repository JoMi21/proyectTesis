# Especificación de Requerimientos: Sistema de Optimización Logística Basado en Agentes Inteligentes

## 1. Introducción
### 1.1 Propósito
El propósito de este documento es definir los requerimientos funcionales y no funcionales para el desarrollo de un sistema de información que transforme los datos en crudo de la operación logística en activos estratégicos. El sistema busca eliminar el "banco de niebla de información" y facilitar una administración basada en hechos mediante el uso de un agente racional basado en modelos.

### 1.2 Alcance del Sistema
El software se limita al procesamiento de reportes de viaje en formato PDF generados por hardware Nexiq y software DDEC Reports de una PyME transportista en Cajeme. No se pretende una generalización absoluta, sino la ejecución de un caso de prueba para demostrar la viabilidad de la IA (modelos LLM como Claude y Gemini) en la infraestructura actual de la organización.

## 2. Descripción General
### 2.1 Perspectiva del Producto
El sistema funciona como un agente racional que percibe su entorno a través de archivos digitales y actúa mediante una interfaz de consulta (chatbot) y un tablero de control (dashboard). Utiliza APIs de Inteligencia Artificial (Claude 3.5 Sonnet / Gemini 2.5 Flash) como núcleo de razonamiento y Supabase (PostgreSQL) para garantizar el aprendizaje organizacional mediante la preservación de registros históricos.

### 2.2 Funciones del Producto (Resumen)
*   **Percepción:** Extracción automatizada de datos técnicos de reportes PDF.
*   **Razonamiento:** Descubrimiento de patrones de ineficiencia en combustible, tiempos operativos (ralentí) y eventos de conducción agresiva.
*   **Aprendizaje:** Persistencia de datos históricos para la mejora continua de procesos y análisis comparativo.
*   **Actuación:** Despliegue de métricas visuales dinámicas y respuesta a consultas técnicas del administrador.

## 3. Requerimientos Funcionales

| ID | Nombre | Descripción | Sustento Técnico |
| :--- | :--- | :--- | :--- |
| **RF-01** | Extracción de Percepciones | El sistema debe extraer texto plano de reportes PDF de Nexiq/DDEC Reports sin intervención manual para evitar errores de transposición. | Sommerville (2005): Validación de entrada. |
| **RF-02** | Descubrimiento de Patrones | El agente debe identificar asociaciones y secuencias de eventos que revelen ineficiencias en el consumo de diésel y tiempos de ralentí. | Laudon (2012): Cadena de valor de información. |
| **RF-03** | Análisis de Rentabilidad | El sistema debe comparar el desempeño entre unidades (ej. Camión A vs Camión B) para determinar la rentabilidad por kilómetro recorrido. | Russell y Norvig (2004): Maximización de rendimiento. |
| **RF-04** | Persistencia Histórica | Los análisis resultantes deben almacenarse en una base de datos centralizada para permitir consultas de viajes previos. | Laudon (2012): Aprendizaje organizacional. |
| **RF-05** | Interfaz de Consulta (Chatbot) | El administrador debe poder realizar preguntas técnicas en lenguaje natural sobre los datos de los viajes sin leer el reporte original. | Russell y Norvig (2004): Función del agente. |
| **RF-06** | Tablero de Parámetros (Dashboard) | Despliegue visual de indicadores clave de desempeño (KPI) mediante tarjetas métricas dinámicas y gráficas de tendencias. | Laudon (2012): Administración orientada a la información. |
| **RF-07** | Arquitectura Multi-Modelo | El sistema debe permitir la configuración y alternancia entre diferentes proveedores de IA (ej. Anthropic y Google) según disponibilidad y costos. | Continuidad del negocio y tolerancia a fallos. |

## 4. Requerimientos No Funcionales
### 4.1 Eficiencia y Desempeño
*   El procesamiento de los datos mediante las APIs de IA debe realizarse de forma asíncrona para no bloquear la interfaz de usuario.
*   El sistema debe manejar estados de "Alta Demanda" (ej. HTTP 503) de manera elegante, notificando al usuario sin corromper el estado de la aplicación.
*   El sistema debe ser capaz de entregar respuestas técnicas precisas basadas exclusivamente en los datos del reporte cargado, evitando "alucinaciones" mediante la configuración estricta del *System Prompt*.

### 4.2 Usabilidad
*   La interfaz debe seguir un diseño de "glassmorphism" para reducir la carga cognitiva y presentar la información de forma profesional y minimalista.
*   El sistema debe ser operable por el administrador y el personal del área de mecánicos (interfaz de carga) con mínima capacitación previa.

### 4.3 Seguridad y Confiabilidad
*   La conexión con el backend debe realizarse mediante protocolos seguros y las claves de API (Claude/Gemini/Supabase) deben estar protegidas rigurosamente en variables de entorno.
*   Se debe garantizar la consistencia y fiabilidad del dato extraído frente al registro original del hardware de escaneo.

## 5. Restricciones y Limitaciones
*   **Infraestructura:** El software debe ejecutarse en el entorno tecnológico actual de la empresa transportista en Cajeme, requiriendo únicamente un navegador web moderno.
*   **Temporalidad:** El análisis se limita a los datos generados en los meses previos al cierre de la investigación.
*   **Normativa (ITSON):** Todas las salidas de texto del sistema (recomendaciones de la IA, mensajes del chatbot) deben cumplir con las normas de redacción institucionales: voz impersonal y ausencia de gerundios.
