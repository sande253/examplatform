import io
import logging
import os
import shutil

import pymupdf as fitz
from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)

_WINDOWS_TESSERACT_PATHS = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
)


def _resolve_tesseract_cmd() -> str | None:
    configured = (settings.TESSERACT_CMD or "").strip()
    if configured and os.path.isfile(configured):
        return configured
    on_path = shutil.which("tesseract")
    if on_path:
        return on_path
    for candidate in _WINDOWS_TESSERACT_PATHS:
        if os.path.isfile(candidate):
            return candidate
    return None


class PDFExtractor:
    def extract_text(self, file_path: str) -> str:
        text_parts: list[str] = []
        doc = fitz.open(file_path)
        try:
            for page in doc:
                page_text = (page.get_text() or "").strip()
                if not page_text:
                    page_text = self._ocr_page(page)
                if page_text:
                    text_parts.append(page_text)
        finally:
            doc.close()
        return "\n".join(text_parts)

    def _ocr_page(self, page) -> str:
        """Render a page to PNG and run Tesseract OCR."""
        try:
            import pytesseract
        except ImportError:
            logger.warning("pytesseract is not installed; skipping OCR for scanned page.")
            return ""

        tesseract_cmd = _resolve_tesseract_cmd()
        if tesseract_cmd:
            pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        else:
            logger.warning("Tesseract executable was not found; skipping OCR for scanned page.")
            return ""

        try:
            # 2x zoom improves OCR accuracy on scanned exam papers.
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            return (pytesseract.image_to_string(img) or "").strip()
        except pytesseract.TesseractNotFoundError:
            logger.warning(
                "Tesseract is not installed or not on PATH; skipping OCR for scanned page."
            )
            return ""
        except Exception as error:
            logger.warning("OCR failed for page %s: %s", page.number, error)
            return ""
