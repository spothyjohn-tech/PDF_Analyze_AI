from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import tempfile
import os
import pdfplumber
from docx import Document
from DownloadFileUser import DownloadRequest, handle_download
from gigachat import GigaChat


current_dir = os.path.dirname(__file__)
cert_path = os.path.join(current_dir, "russian_trusted_root_ca.cer")

giga = GigaChat(
   credentials="YOUR_API",
   ca_bundle_file=cert_path
)

app = FastAPI(title="AI Document Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

def extract_text_from_pdf(file_path: str) -> str:
    """Извлечение текста из PDF файла"""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    except Exception as e:
        raise Exception(f"Ошибка чтения PDF: {str(e)}")
    return text

def extract_text_from_docx(file_path: str) -> str:
    """Извлечение текста из DOCX файла"""
    text = ""
    try:
        doc = Document(file_path)
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text += paragraph.text + "\n"
    except Exception as e:
        raise Exception(f"Ошибка чтения DOCX: {str(e)}")
    return text

def extract_text_from_txt(file_path: str) -> str:
    """Извлечение текста из TXT файла"""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except Exception as e:
        raise Exception(f"Ошибка чтения TXT: {str(e)}")

@app.post("/chat")
async def chat(request: ChatRequest):
    """Обработка текста нейросетью"""
    
    SYSTEM_PROMPT = """Ты — профессиональный редактор, аналитик и обработчик текста.

Твоя задача:
1. Преобразовать исходный текст в логичный, структурированный и легко читаемый материал.
2. Суммировать содержание, сохраняя ключевые смыслы и факты.
3. Удалить повторы, «воду» и второстепенные детали.
4. Структурировать результат:
   - используй заголовки,
   - подзаголовки,
   - маркированные или нумерованные списки.
5. Писать простым и понятным языком для обычного читателя.

Язык ответа:
- используй язык исходного текста;
- если текст смешанный — используй русский."""

    prompt = f"""{SYSTEM_PROMPT}

Исходный текст:
{request.message}"""
    try:
        response = giga.chat({
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": request.message}
            ]
        })

        return {
            "reply": response.choices[0].message.content
        }

    except Exception as e:
        return {"error": f"Ошибка GigaChat: {str(e)}"}
    

@app.post("/process-file")
async def process_file(file: UploadFile = File(...)):
    """Обработка загруженного файла"""
    
    filename_lower = file.filename.lower()
    
    # Определяем тип файла
    if filename_lower.endswith('.pdf'):
        file_type = 'pdf'
    elif filename_lower.endswith('.docx'):
        file_type = 'docx'
    elif filename_lower.endswith('.doc'):
        file_type = 'doc'
    elif filename_lower.endswith(('.txt', '.md', '.rtf')):
        file_type = 'txt'
    else:
        return {"error": f"Неподдерживаемый тип файла. Поддерживаются: PDF, DOC, DOCX, TXT, MD, RTF"}
    
    # Создаем временный файл
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp_file:
        content = await file.read()
        tmp_file.write(content)
        tmp_path = tmp_file.name
    
    try:
        # Читаем содержимое файла
        if file_type == 'pdf':
            file_content = extract_text_from_pdf(tmp_path)
        elif file_type in ['docx', 'doc']:
            file_content = extract_text_from_docx(tmp_path)
        else:
            file_content = extract_text_from_txt(tmp_path)
        
        if not file_content.strip():
            return {"error": "Файл пуст или не содержит извлекаемого текста"}
        

        if len(file_content) > 8000:
            preview = file_content[:8000] + "...\n\n[Текст обрезан]"
        else:
            preview = file_content
        
        return {
            "original_length": len(file_content),
            "reply": preview,
            "filename": file.filename,
            "file_type": file_type
        }
        
    except Exception as e:
        return {"error": f"Ошибка обработки файла: {str(e)}"}
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@app.get("/health")
async def health_check():
    """Проверка работоспособности"""
    try:
        # Проверяем доступность моделей GigaChat
        models = giga.get_models()
        return {"status": "healthy", "gigachat": "connected", "models": len(models.data)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/")
async def root():
    return {"message": "AI Document Analyzer API", "docs": "/docs"}

@app.post("/download-file")
async def download_file(request: DownloadRequest):
    return handle_download(request)
