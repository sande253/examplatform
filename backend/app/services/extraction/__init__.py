from .pdf_extractor import PDFExtractor
from .mock_extractor import MockExtractor
from .groq_extractor import GroqExtractor
from app.core.config import settings

def get_extractor():
    if settings.USE_MOCK_EXTRACTOR or not settings.GROQ_API_KEY:
        return MockExtractor()
    return GroqExtractor()
