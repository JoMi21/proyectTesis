# Logistics Optimization Chatbot - Walkthrough

¡Proyecto completado! He implementado un sistema robusto que transforma reportes DDEC y Nexiq en insights estratégicos utilizando la potencia de Claude 3.5 Sonnet.

## Características Implementadas

### 🧠 Cerebro del Agente (Claude 3.5 Sonnet)
- **Análisis Racional**: El agente detecta excesos de combustible comparando con estándares óptimos.
- **Detección de Tiempos Muertos**: Identifica ineficiencias operativas basadas en el tiempo de ralentí.
- **Seguridad y Rentabilidad**: Analiza eventos de frenado y velocidad para garantizar la seguridad de la carga.

### 🖥️ Interfaz de Usuario (Dashboard Premium)
- **Glassmorphism Design**: Interfaz moderna y minimalista con efectos de transparencia.
- **Drag & Drop**: Subida de archivos PDF intuitiva.
- **Visualización Dinámica**: Los indicadores se actualizan en tiempo real tras el análisis.

### 🚀 Backend de Alto Rendimiento
- **Express + TypeScript**: Base sólida y tipada.
- **PDF-Parse Integration**: Extracción precisa de texto de reportes técnicos.
- **ESM Architecture**: Configuración moderna de módulos para máxima compatibilidad.

## Cómo ejecutar el proyecto

1.  **Configurar Variables de Entorno**:
    - Renombra `.env.template` a `.env`.
    - Agrega tu `ANTHROPIC_API_KEY`.

2.  **Instalar Dependencias**:
    ```bash
    npm install
    ```

3.  **Compilar y Ejecutar**:
    ```bash
    # Compilar TypeScript
    npx tsc
    
    # Iniciar el servidor
    node dist/index.js
    ```

4.  **Acceder**:
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Resultados del Análisis
El sistema entregará un JSON estructurado que el frontend mapea automáticamente en tarjetas de métricas, recomendaciones y patrones detectados.

![Dashboar Preview](file:///C:/Users/migue/Desktop/tesis/src/public/index.html) <!-- Nota: El usuario puede abrir el archivo directamente -->
