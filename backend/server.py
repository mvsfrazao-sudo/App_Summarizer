from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from models import *
from services.pdf_processor import PDFProcessor
from services.ai_summarizer import AISummarizer
import asyncio
import shutil
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_env_path = ROOT_DIR / '.env'

# Load environment variables
if load_env_path.exists():
    from dotenv import load_dotenv
    load_dotenv(load_env_path)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'academic_summarizer')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Initialize services
pdf_processor = PDFProcessor()
ai_summarizer = AISummarizer()

# Create upload directory
upload_folder = Path(os.environ.get('UPLOAD_FOLDER', '/app/uploads'))
upload_folder.mkdir(exist_ok=True)

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_paper_async(paper_id: str):
    """Background task to process uploaded paper"""
    try:
        # Update status to processing
        await db.papers.update_one(
            {"id": paper_id},
            {"$set": {"status": ProcessingStatus.PROCESSING, "processing_progress": 10}}
        )
        
        # Get paper from database
        paper_doc = await db.papers.find_one({"id": paper_id})
        if not paper_doc:
            raise Exception("Paper not found")
        
        # Read PDF file
        file_path = Path(paper_doc['file_path'])
        if not file_path.exists():
            raise Exception("PDF file not found")
        
        # Update progress
        await db.papers.update_one(
            {"id": paper_id},
            {"$set": {"processing_progress": 30}}
        )
        
        # Extract text from PDF
        with open(file_path, 'rb') as pdf_file:
            pdf_content = pdf_file.read()
        
        text_content = pdf_processor.extract_text_from_pdf(pdf_content)
        
        # Update progress
        await db.papers.update_one(
            {"id": paper_id},
            {"$set": {"processing_progress": 50}}
        )
        
        # Parse academic paper structure
        paper_data = pdf_processor.parse_academic_paper(text_content)
        
        # Update paper with extracted metadata
        await db.papers.update_one(
            {"id": paper_id},
            {"$set": {
                "original_title": paper_data['title'],
                "author": paper_data['author'],
                "processing_progress": 70
            }}
        )
        
        # Generate accessible summary using AI
        summary_data = await ai_summarizer.create_accessible_summary(paper_data)
        
        # Update progress
        await db.papers.update_one(
            {"id": paper_id},
            {"$set": {"processing_progress": 85}}
        )
        
        # Create and store summary
        summary = Summary(
            paper_id=paper_id,
            title=summary_data['title'],
            introduction=summary_data['introduction'],
            key_points=[KeyPoint(**point) for point in summary_data['key_points']],
            conclusion=summary_data['conclusion'],
            implications=summary_data['implications']
        )
        
        await db.summaries.insert_one(summary.dict())
        
        # Generate HTML blog post
        html_content = ai_summarizer.generate_html_blog(summary_data, paper_data)
        
        # Store HTML blog
        html_blog = HtmlBlog(
            paper_id=paper_id,
            html_content=html_content
        )
        
        await db.html_blogs.insert_one(html_blog.dict())
        
        # Update status to completed
        await db.papers.update_one(
            {"id": paper_id},
            {"$set": {"status": ProcessingStatus.COMPLETED, "processing_progress": 100}}
        )
        
        logger.info(f"Successfully processed paper {paper_id}")
        
    except Exception as e:
        logger.error(f"Error processing paper {paper_id}: {str(e)}")
        await db.papers.update_one(
            {"id": paper_id},
            {"$set": {"status": ProcessingStatus.FAILED, "processing_progress": 0}}
        )

@api_router.post("/papers/upload", response_model=PaperResponse)
async def upload_paper(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Upload and store PDF paper"""
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
        # Validate file size (50MB limit)
        if not file.size or file.size > 50 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size must be less than 50MB")
        
        # Create paper record
        paper = Paper(
            filename=file.filename,
            file_size=file.size,
            file_path=""  # Will be set after saving file
        )
        
        # Save file to disk
        file_path = upload_folder / f"{paper.id}_{file.filename}"
        paper.file_path = str(file_path)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Store in database
        await db.papers.insert_one(paper.dict())
        
        # Start background processing
        background_tasks.add_task(process_paper_async, paper.id)
        
        return PaperResponse(**paper.dict())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload file")

@api_router.get("/papers/{paper_id}/status", response_model=ProcessingStatusResponse)
async def get_paper_status(paper_id: str):
    """Get processing status of a paper"""
    paper = await db.papers.find_one({"id": paper_id})
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    
    return ProcessingStatusResponse(
        status=paper['status'],
        progress=paper['processing_progress']
    )

@api_router.get("/papers/{paper_id}/summary", response_model=SummaryResponse)
async def get_paper_summary(paper_id: str):
    """Get accessible summary for a paper"""
    summary = await db.summaries.find_one({"paper_id": paper_id})
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    
    return SummaryResponse(**summary)

@api_router.get("/papers/{paper_id}/html")
async def get_paper_html(paper_id: str):
    """Get HTML blog post for a paper"""
    html_blog = await db.html_blogs.find_one({"paper_id": paper_id})
    if not html_blog:
        raise HTTPException(status_code=404, detail="HTML blog not found")
    
    return {"html_content": html_blog['html_content']}

@api_router.get("/papers/{paper_id}/download/{format}")
async def download_paper_content(paper_id: str, format: str):
    """Download paper content in specified format"""
    if format == "original":
        paper = await db.papers.find_one({"id": paper_id})
        if not paper:
            raise HTTPException(status_code=404, detail="Paper not found")
        
        file_path = Path(paper['file_path'])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Original file not found")
        
        return FileResponse(file_path, filename=paper['filename'])
    
    elif format == "summary":
        summary = await db.summaries.find_one({"paper_id": paper_id})
        if not summary:
            raise HTTPException(status_code=404, detail="Summary not found")
        
        # Create temporary JSON file
        import json
        import tempfile
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as tmp:
            json.dump(summary, tmp, indent=2, default=str)
            tmp_path = tmp.name
        
        return FileResponse(tmp_path, filename="summary.json")
    
    elif format == "html":
        html_blog = await db.html_blogs.find_one({"paper_id": paper_id})
        if not html_blog:
            raise HTTPException(status_code=404, detail="HTML blog not found")
        
        # Create temporary HTML file
        import tempfile
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as tmp:
            tmp.write(html_blog['html_content'])
            tmp_path = tmp.name
        
        return FileResponse(tmp_path, filename="blog-post.html")
    
    else:
        raise HTTPException(status_code=400, detail="Invalid format")

@api_router.get("/papers", response_model=List[PaperResponse])
async def list_papers():
    """List all papers"""
    papers = await db.papers.find().sort("upload_date", -1).to_list(100)
    return [PaperResponse(**paper) for paper in papers]

# Health check endpoint
@api_router.get("/")
async def root():
    return {"message": "Academic Summarizer API is running"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()