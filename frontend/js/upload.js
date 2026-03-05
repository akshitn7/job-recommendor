// Handles resume file upload logic. Validates file type (PDF or DOCX only), reads the file, sends 
// it as multipart/form-data to POST /api/recommend, and triggers the results render on response.