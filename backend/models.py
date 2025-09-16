from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid

class ProcessingStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing" 
    COMPLETED = "completed"
    FAILED = "failed"

class KeyPoint(BaseModel):
    heading: str
    content: str

class Paper(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    original_title: Optional[str] = None
    author: Optional[str] = None
    upload_date: datetime = Field(default_factory=datetime.utcnow)
    file_path: str
    file_size: int
    status: ProcessingStatus = ProcessingStatus.UPLOADED
    processing_progress: int = 0

class PaperCreate(BaseModel):
    filename: str
    file_size: int

class PaperResponse(BaseModel):
    id: str
    filename: str
    original_title: Optional[str]
    author: Optional[str]
    upload_date: datetime
    status: ProcessingStatus
    processing_progress: int

class Summary(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    paper_id: str
    title: str
    introduction: str
    key_points: List[KeyPoint]
    conclusion: str
    implications: List[str]
    created_date: datetime = Field(default_factory=datetime.utcnow)

class SummaryResponse(BaseModel):
    title: str
    introduction: str
    key_points: List[KeyPoint]
    conclusion: str
    implications: List[str]

class HtmlBlog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    paper_id: str
    html_content: str
    created_date: datetime = Field(default_factory=datetime.utcnow)

class ProcessingStatusResponse(BaseModel):
    status: ProcessingStatus
    progress: int
    message: Optional[str] = None