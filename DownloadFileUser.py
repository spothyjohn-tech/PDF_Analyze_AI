from fastapi import HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from docx import Document
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
import tempfile
import os
import uuid

FONT_PATH = os.path.join(
    os.path.dirname(__file__),
    "fonts",
    "DejaVuSans.ttf"
)

pdfmetrics.registerFont(TTFont("DejaVu", FONT_PATH))

class DownloadRequest(BaseModel):
    content: str
    filename: str
    file_type: str  # txt | pdf | docx


def generate_docx(content: str, filename: str) -> str:
    doc = Document()
    for line in content.split("\n"):
        doc.add_paragraph(line)

    temp_path = os.path.join(
        tempfile.gettempdir(),
        f"{uuid.uuid4()}_{filename}.docx"
    )
    doc.save(temp_path)
    return temp_path


def generate_pdf(content: str, filename: str) -> str:
    temp_path = os.path.join(
        tempfile.gettempdir(),
        f"{uuid.uuid4()}_{filename}.pdf"
    )

    doc = SimpleDocTemplate(
        temp_path,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()
    styles["Normal"].fontName = "DejaVu"
    styles["Normal"].fontSize = 11
    styles["Normal"].leading = 14

    story = []

    for block in content.split("\n\n"):
        story.append(Paragraph(block.replace("\n", "<br/>"), styles["Normal"]))

    doc.build(story)
    return temp_path


def handle_download(request: DownloadRequest):
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Пустой контент")

    base_name = os.path.splitext(request.filename)[0]

    if request.file_type == "docx":
        path = generate_docx(request.content, base_name)
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        out_name = f"анализ_{base_name}.docx"

    elif request.file_type == "pdf":
        path = generate_pdf(request.content, base_name)
        media_type = "application/pdf"
        out_name = f"анализ_{base_name}.pdf"

    elif request.file_type == "txt":
        path = os.path.join(
            tempfile.gettempdir(),
            f"{uuid.uuid4()}_{base_name}.txt"
        )
        with open(path, "w", encoding="utf-8") as f:
            f.write(request.content)

        media_type = "text/plain"
        out_name = f"анализ_{base_name}.txt"

    else:
        raise HTTPException(status_code=400, detail="Неподдерживаемый формат")

    return FileResponse(
        path,
        media_type=media_type,
        filename=out_name
    )
