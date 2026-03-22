# Extracts raw text from an uploaded resume file in memory without saving it to disk. 
# Handles PDF files using PyMuPDF and DOCX files using python-docx. Returns plain text string.

import fitz
import docx
import io
 
 
def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Extract raw text from a resume file.
    Accepts file as bytes and filename to determine type.
    Returns extracted text as a string.
    """
    filename = filename.lower()
 
    if filename.endswith(".pdf"):
        return extract_from_pdf(file_bytes)
    elif filename.endswith(".docx"):
        return extract_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {filename}. Only PDF and DOCX are supported.")
 
 
def extract_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF (fitz)."""
    text = ""
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text.strip()
 
 
def extract_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    doc = docx.Document(io.BytesIO(file_bytes))
    text = "\n".join([para.text for para in doc.paragraphs])
    return text.strip()
 