// Handles resume file upload logic. Validates file type (PDF or DOCX only), reads the file, sends 
// it as multipart/form-data to POST /api/recommend, and triggers the results render on response.

document.addEventListener('DOMContentLoaded', function() {
    const uploadBox = document.getElementById('uploadBox');
    const resumeInput = document.getElementById('resumeInput');
    const fileNameDisplay = document.getElementById('fileName');
    const uploadBtn = document.querySelector('.upload-btn');
    const browseSpan = document.querySelector('.browse');

    // File validation constants
    const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    // Browse button click
    if (browseSpan) {
        browseSpan.addEventListener('click', () => {
            resumeInput.click();
        });
    }

    // Upload button click
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            resumeInput.click();
        });
    }

    // File input change
    resumeInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFile(this.files[0]);
        }
    });

    // Drag and drop events
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.backgroundColor = '#6E40AA';
        uploadBox.style.borderColor = '#C89B3C';
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.backgroundColor = '#0A1428';
        uploadBox.style.borderColor = '#0DD3E6';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.backgroundColor = '#0A1428';
        uploadBox.style.borderColor = '#0DD3E6';
        
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // File upload box click
    uploadBox.addEventListener('click', () => {
        resumeInput.click();
    });

    // Handle file processing
    function handleFile(file) {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            alert('Invalid file type. Please upload a PDF or DOCX file.');
            return;
        }

        // Validate file size
        if (file.size > MAX_SIZE) {
            alert('File is too large. Maximum size is 5MB.');
            return;
        }

        // Display file name
        fileNameDisplay.textContent = `File selected: ${file.name}`;
        fileNameDisplay.style.color = '#C89B3C';
        fileNameDisplay.style.marginTop = '20px';

        // Upload file
        uploadFile(file);
    }

    // Upload file to backend
    function uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        fileNameDisplay.textContent = 'Uploading...';
        fileNameDisplay.style.color = '#0DD3E6';

        fetch('/api/recommend', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            return response.json();
        })
        .then(data => {
            fileNameDisplay.textContent = `✓ Upload successful: ${file.name}`;
            fileNameDisplay.style.color = '#0DD3E6';
            // Trigger results display if needed
            if (window.renderResults) {
                window.renderResults(data);
            }
        })
        .catch(error => {
            fileNameDisplay.textContent = `✗ Upload failed: ${error.message}`;
            fileNameDisplay.style.color = '#FF6B6B';
            console.error('Upload error:', error);
        });
    }
});