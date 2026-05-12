document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadContainer = document.getElementById('upload-container');
    const loading = document.getElementById('loading');
    const loadingText = document.getElementById('loading-text');
    const unitId = document.getElementById('unit-id');
    const mechanicNotes = document.getElementById('mechanic-notes');
    const uploadBtn = document.getElementById('upload-btn');

    let selectedFile = null;

    // Click to select file
    dropZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            selectedFile = e.target.files[0];
            dropZone.querySelector('p').textContent = `Seleccionado: ${selectedFile.name}`;
            dropZone.classList.add('selected');
        }
    });

    uploadBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('Por favor selecciona un archivo PDF primero.');
            return;
        }
        if (!unitId.value.trim()) {
            alert('Por favor ingresa el ID de la Unidad o Camión.');
            return;
        }
        await uploadReport();
    });

    async function uploadReport() {
        const formData = new FormData();
        formData.append('report', selectedFile);
        formData.append('unitId', unitId.value.trim().toUpperCase());
        formData.append('mechanicNotes', mechanicNotes.value);

        showLoading('Guardando reporte y extrayendo datos...');

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Error al subir el reporte');

            alert('✅ Reporte guardado exitosamente. El administrador ya puede verlo en su panel.');
            resetUploadForm();
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Hubo un error al guardar el reporte.');
        } finally {
            hideLoading();
        }
    }

    function showLoading(text) {
        loadingText.textContent = text;
        loading.style.display = 'block';
        uploadContainer.style.display = 'none';
    }

    function hideLoading() {
        loading.style.display = 'none';
        uploadContainer.style.display = 'block';
    }

    function resetUploadForm() {
        selectedFile = null;
        fileInput.value = '';
        unitId.value = '';
        mechanicNotes.value = '';
        dropZone.querySelector('p').textContent = 'Arrastra tu reporte DDEC / Nexiq o haz clic para subir';
        dropZone.classList.remove('selected');
    }
});
