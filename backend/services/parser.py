# Extracts raw text from an uploaded resume file in memory without saving it to disk. 
# Handles PDF files using PyMuPDF. Returns plain text string.
import fitz
 
def extract_text(file: bytes, filename: str) -> str:
    """Extract raw text from a resume file parse it and return a string."""
    filename = filename.lower()
    if filename.endswith(".pdf"):
        return extract_from_pdf(file)
    else:
        raise ValueError(f"Unsupported file type: {filename}. Only PDF and DOCX are supported.")
 
 
def extract_from_pdf(file):
    """Extract text from PDF using PyMuPDF (fitz)."""
    text = ""
    with fitz.open(stream=file, filetype="pdf") as f:
        if f.page_count > 3:
            raise ValueError(f"Resume must not exceed 3 pages. Yours has {f.page_count} pages.")
        for page in f:
            text += page.get_text()
    return text.strip()