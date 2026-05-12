document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loading-text');
    const dashboard = document.getElementById('dashboard');
    const historyList = document.getElementById('history-list');
    const chartSection = document.getElementById('chart-section');
    const chartUnitName = document.getElementById('chart-unit-name');
    let historyChartInstance = null;
    let allReports = [];

    // Display Elements
    const valConsumo = document.getElementById('val-consumo');
    const unitConsumo = document.getElementById('unit-consumo');
    const descConsumo = document.getElementById('desc-consumo');
    const valRalenti = document.getElementById('val-ralenti');
    const unitRalenti = document.getElementById('unit-ralenti');
    const descRalenti = document.getElementById('desc-ralenti');
    const valFrenados = document.getElementById('val-frenados');
    const valExcesos = document.getElementById('val-excesos');
    const descEventos = document.getElementById('desc-eventos');
    const recommendationsList = document.getElementById('recommendations-list');
    const patternsDesc = document.getElementById('patterns-desc');

    // Initial load
    fetchHistory();

    // Refresh every 30 seconds
    setInterval(fetchHistory, 30000);

    async function fetchHistory() {
        try {
            const response = await fetch('/api/reports');
            allReports = await response.json();
            renderHistory(allReports);
        } catch (error) {
            console.error('Error fetching history:', error);
            historyList.innerHTML = '<p style="color: red;">Error al cargar historial.</p>';
        }
    }

    function renderHistory(reports) {
        if (reports.length === 0) {
            historyList.innerHTML = '<p style="color: var(--text-gray);">No hay reportes guardados aún.</p>';
            return;
        }

        historyList.innerHTML = '';
        reports.forEach(report => {
            const div = document.createElement('div');
            div.className = `history-item glass-card ${report.status}`;
            div.style.padding = '1rem';
            div.style.marginBottom = '1rem';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';

            const info = document.createElement('div');
            info.innerHTML = `
                <strong style="color: white; display: block;">${report.file_name}</strong>
                <small style="color: var(--text-gray);">${new Date(report.created_at).toLocaleString()}</small>
                <div style="margin-top: 5px; font-size: 0.8rem; color: var(--accent-cyan);">Estado: ${report.status}</div>
                ${report.mechanic_notes ? `<div style="font-size: 0.75rem; color: #aaa; margin-top: 5px;">Mecánico: ${report.mechanic_notes}</div>` : ''}
            `;

            const actions = document.createElement('div');
            const btn = document.createElement('button');
            btn.textContent = report.status === 'analizado' ? 'Ver Análisis' : 'Analizar con Claude';
            btn.className = 'action-btn';
            btn.style.padding = '8px 18px';
            btn.style.borderRadius = '20px';
            btn.style.border = 'none';
            btn.style.background = report.status === 'analizado' ? 'var(--accent-cyan)' : 'var(--primary)';
            btn.style.color = 'var(--bg-dark)';
            btn.style.cursor = 'pointer';
            btn.style.fontWeight = '700';
            btn.style.transition = '0.3s';

            btn.onclick = () => {
                if (report.status === 'analizado') {
                    displayResults(report);
                } else {
                    analyzeStoredReport(report.id);
                }
            };

            actions.appendChild(btn);
            div.appendChild(info);
            div.appendChild(actions);
            historyList.appendChild(div);
        });
    }

    async function analyzeStoredReport(id) {
        showLoading('Claude está procesando el reporte técnico...');
        try {
            const response = await fetch(`/api/reports/${id}/analyze`, { method: 'POST' });
            if (!response.ok) throw new Error('Error en el análisis');
            const data = await response.json();
            
            // Actualizar allReports localmente o re-hacer fetchHistory
            await fetchHistory();
            
            // Buscar el reporte actualizado para mostrarlo
            const updatedReport = allReports.find(r => r.id === id);
            if (updatedReport) displayResults(updatedReport);
            
        } catch (error) {
            console.error('Error:', error);
            alert('El análisis falló. Revisa la consola y tu API Key.');
        } finally {
            hideLoading();
        }
    }

    function displayResults(report) {
        const data = report.analysis_data;
        if (!data) return;

        dashboard.style.display = 'grid';
        dashboard.scrollIntoView({ behavior: 'smooth' });

        valConsumo.textContent = data.indicadores.consumo.valor;
        unitConsumo.textContent = data.indicadores.consumo.unidad;
        descConsumo.textContent = data.indicadores.consumo.analisis;

        valRalenti.textContent = data.indicadores.ralenti.valor;
        unitRalenti.textContent = data.indicadores.ralenti.unidad;
        descRalenti.textContent = data.indicadores.ralenti.analisis;

        valFrenados.textContent = data.indicadores.eventos.frenados;
        valExcesos.textContent = data.indicadores.eventos.excesosVelocidad;
        descEventos.textContent = data.indicadores.eventos.analisis;

        recommendationsList.innerHTML = '';
        data.recomendaciones.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });

        patternsDesc.textContent = data.patronesDetectados.join(' | ');

        renderChart(report);
    }

    function showLoading(text) {
        loadingText.textContent = text;
        loading.style.display = 'block';
        dashboard.style.display = 'none';
    }

    function hideLoading() {
        loading.style.display = 'none';
    }

    function getUnitId(fileName) {
        if (fileName.includes('___')) {
            return fileName.split('___')[0];
        } else {
            let unidad = fileName.split(/[-_\s\.]/)[0]; 
            if(unidad.length < 3) unidad = fileName.substring(0, 8);
            return unidad;
        }
    }

    function renderChart(currentReport) {
        const targetUnit = getUnitId(currentReport.file_name);
        chartUnitName.textContent = targetUnit;

        // Filtrar solo los analizados que sean de esta MISMA unidad
        const analyzed = allReports.filter(r => 
            r.status === 'analizado' && 
            r.analysis_data && 
            r.analysis_data.indicadores &&
            getUnitId(r.file_name) === targetUnit
        );
        
        // Ordenar cronológicamente (más antiguo a más nuevo) asumiendo que vienen al revés de DB
        analyzed.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        if (analyzed.length === 0) {
            chartSection.style.display = 'none';
            return;
        }

        chartSection.style.display = 'block';

        // Preparar datos
        const labels = analyzed.map(r => {
            const date = new Date(r.created_at);
            return `${date.getDate()}/${date.getMonth()+1} - ${date.getHours()}:${date.getMinutes()}`;
        });
        
        const dataConsumo = analyzed.map(r => parseFloat(r.analysis_data.indicadores.consumo.valor) || 0);
        const dataRalenti = analyzed.map(r => parseFloat(r.analysis_data.indicadores.ralenti.valor) || 0);

        const ctx = document.getElementById('historyChart').getContext('2d');
        
        if (historyChartInstance) {
            historyChartInstance.destroy();
        }

        historyChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'bar',
                        label: 'Consumo (MPG)',
                        data: dataConsumo,
                        backgroundColor: 'rgba(0, 240, 255, 0.6)',
                        borderColor: 'rgba(0, 240, 255, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        type: 'bar', // Cambiado a barra enseguida
                        label: 'Ralentí (Min / %)',
                        data: dataRalenti,
                        backgroundColor: 'rgba(255, 77, 77, 0.6)',
                        borderColor: 'rgba(255, 77, 77, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                color: '#fff',
                scales: {
                    x: {
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: { display: true, text: 'Consumo (MPG)', color: 'rgba(0, 240, 255, 0.8)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: { display: true, text: 'Ralentí', color: '#ff4d4d' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
                        grid: { drawOnChartArea: false }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#fff' }
                    }
                }
            }
        });
    }

    // ==========================================
    // LÓGICA DEL CHATBOT
    // ==========================================
    const chatToggle = document.getElementById('chatbot-toggle');
    const chatWindow = document.getElementById('chatbot-window');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatMessages = document.getElementById('chat-messages');

    chatToggle.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
        if (chatWindow.style.display === 'flex') {
            chatInput.focus();
        }
    });

    chatSend.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    async function sendChatMessage() {
        const question = chatInput.value.trim();
        if (!question) return;

        // Añadir mensaje del usuario a la UI
        appendMessage(question, 'user');
        chatInput.value = '';

        // Añadir loader del bot
        const loaderId = 'loader-' + Date.now();
        appendMessage('<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>', 'bot', loaderId);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question })
            });

            const data = await response.json();
            
            // Remover loader y poner respuesta
            document.getElementById(loaderId).remove();
            if (data.answer) {
                appendMessage(data.answer, 'bot');
            } else {
                appendMessage("Error en la comunicación con el agente.", 'bot');
            }
        } catch (error) {
            console.error('Chat error:', error);
            document.getElementById(loaderId).remove();
            appendMessage("Falla de conexión con el servidor.", 'bot');
        }
    }

    function appendMessage(text, sender, id = null) {
        const div = document.createElement('div');
        if (id) div.id = id;
        
        div.style.padding = '0.8rem';
        div.style.borderRadius = '12px';
        div.style.maxWidth = '85%';
        div.style.fontSize = '0.9rem';
        div.style.color = 'white';
        div.style.lineHeight = '1.4';

        if (sender === 'user') {
            div.style.background = 'var(--accent-cyan)';
            div.style.color = 'var(--bg-dark)';
            div.style.alignSelf = 'flex-end';
            div.style.fontWeight = '600';
            div.innerText = text;
        } else {
            div.style.background = 'rgba(255,255,255,0.1)';
            div.style.alignSelf = 'flex-start';
            
            // Parseo básico de Markdown a HTML para que no se vea todo en un solo bloque
            let formattedText = text;
            if (!text.includes('<div class="spinner"')) {
                formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'); // Negritas
                formattedText = formattedText.replace(/\* (.*?)(?=\n|$)/g, '<li>$1</li>'); // Listas
                formattedText = formattedText.replace(/\n/g, '<br>'); // Saltos de línea
                formattedText = formattedText.replace(/(<li>.*<\/li>)/g, '<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">$1</ul>'); // Envolver en ul
            }
            
            div.innerHTML = formattedText; 
        }

        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});
