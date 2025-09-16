# Academic Summarizer - Backend Integration Contracts

## API Endpoints

### 1. PDF Processing & Storage
```
POST /api/papers/upload
- Multipart file upload for PDF
- Returns: paper_id, status, original_filename
- Stores PDF file and metadata in database

GET /api/papers/{paper_id}/status
- Returns processing status and progress
- Status: 'uploaded', 'processing', 'completed', 'failed'
```

### 2. Summarization Endpoints
```
POST /api/papers/{paper_id}/summarize
- Triggers AI summarization process
- Returns: job_id for tracking progress

GET /api/papers/{paper_id}/summary
- Returns accessible summary data
- Structure matches mockPdfData.accessibleSummary

GET /api/papers/{paper_id}/html
- Returns generated HTML blog post
- Structure matches mockPdfData.htmlBlogPost
```

### 3. File Management
```
GET /api/papers/{paper_id}/download/{format}
- format: 'summary', 'html', 'original'
- Returns file download

GET /api/papers
- Lists user's processed papers
- Pagination support
```

## Database Models

### Paper Document
```python
{
    "id": "ObjectId",
    "filename": "string",
    "original_title": "string", 
    "author": "string",
    "upload_date": "datetime",
    "file_path": "string",
    "file_size": "int",
    "status": "enum",
    "processing_progress": "int"
}
```

### Summary Document
```python
{
    "id": "ObjectId",
    "paper_id": "ObjectId",
    "title": "string",
    "introduction": "string",
    "key_points": [
        {
            "heading": "string",
            "content": "string"
        }
    ],
    "conclusion": "string",
    "implications": ["string"],
    "created_date": "datetime"
}
```

### HTML Blog Document
```python
{
    "id": "ObjectId", 
    "paper_id": "ObjectId",
    "html_content": "string",
    "created_date": "datetime"
}
```

## Mock Data Replacement Plan

### Frontend Changes Required:
1. **SummarizerPage.jsx**: Replace mock processing with real API calls
2. **Remove mock.js**: Replace with actual API service calls
3. **Add API service layer**: Create services/api.js for backend communication
4. **Add error handling**: Proper error states and user feedback
5. **Real file upload**: Replace mock upload with actual multipart upload

### Integration Points:
1. File upload → POST /api/papers/upload
2. Processing simulation → Real status polling from GET /api/papers/{id}/status
3. Mock summary display → GET /api/papers/{id}/summary
4. Mock HTML display → GET /api/papers/{id}/html
5. Download functions → GET /api/papers/{id}/download/{format}

## AI Integration Requirements

### PDF Processing:
- Extract text content from uploaded PDF
- Parse academic paper structure (title, abstract, sections)
- Store extracted content for summarization

### Summarization Logic:
- Use Emergent LLM key for AI summarization
- Convert academic language to accessible language
- Generate structured key points and implications
- Create engaging introduction and conclusion

### HTML Generation:
- Template-based HTML generation with embedded CSS
- Responsive design matching frontend preview
- SEO-friendly meta tags and structure

## Error Handling Strategy
- File validation (PDF only, size limits)
- Processing timeouts and retries
- AI service error fallbacks
- Clear user error messages
- Proper HTTP status codes

## Security Considerations
- File upload validation and sanitization
- Rate limiting on API endpoints
- Proper error message sanitization
- File storage security (temp cleanup)