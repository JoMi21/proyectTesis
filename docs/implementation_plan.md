# Logistics Optimization Chatbot Implementation Plan

Build a platform that extracts data from DDEC/Nexiq reports using Claude AI and displays actionable logistics insights in a premium web interface.

## User Review Required

> [!IMPORTANT]
> The implementation requires an **Anthropic API Key**. You will need to provide this in a `.env` file.
> The interface will be built using Vanilla CSS/JS for a premium feel, avoiding heavy frameworks unless requested.

## Proposed Changes

### Backend (Express API)

#### [NEW] [src/index.ts](file:///C:/Users/migue/Desktop/tesis/src/index.ts)
Entry point for the Express server. Handles routing and initialization.

#### [NEW] [src/services/pdf.service.ts](file:///C:/Users/migue/Desktop/tesis/src/services/pdf.service.ts)
Service for extracting text from uploaded PDFs using `pdf-parse`.

#### [NEW] [src/services/claude.service.ts](file:///C:/Users/migue/Desktop/tesis/src/services/claude.service.ts)
Service to interact with Claude API. Contains the "Logistics Optimization Agent" system prompt and logic.

#### [NEW] [src/routes/analysis.routes.ts](file:///C:/Users/migue/Desktop/tesis/src/routes/analysis.routes.ts)
Endpoints for uploading files and retrieving analysis results.

---

### Frontend (User Interface)

#### [NEW] [src/public/index.html](file:///C:/Users/migue/Desktop/tesis/src/public/index.html)
Main dashboard UI. Featuring a premium dark mode, drag-and-drop file upload, and dynamic data cards.

#### [NEW] [src/public/index.css](file:///C:/Users/migue/Desktop/tesis/src/public/index.css)
Custom CSS for the logistics optimization aesthetics (glassmorphism, vibrant accents).

#### [NEW] [src/public/app.js](file:///C:/Users/migue/Desktop/tesis/src/public/app.js)
Frontend logic for chat interaction and data visualization.

## Verification Plan

### Automated Tests
- Script to test PDF text extraction independently.
- Mock server to verify API endpoint responses.

### Manual Verification
- Upload sample DDEC/Nexiq reports and verify the accuracy of the extracted insights.
- Verify the responsiveness and visual quality of the dashboard.
