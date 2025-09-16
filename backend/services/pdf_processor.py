import PyPDF2
import io
import re
from typing import Dict, Optional, List

class PDFProcessor:
    def __init__(self):
        pass
    
    def extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """Extract all text content from PDF"""
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_content))
            text = ""
            
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
        except Exception as e:
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
    
    def parse_academic_paper(self, text: str) -> Dict[str, str]:
        """Parse academic paper structure to extract key components"""
        try:
            # Clean the text
            text = re.sub(r'\s+', ' ', text)
            
            # Extract title (usually first significant line)
            lines = text.split('\n')
            title = None
            for line in lines[:10]:  # Check first 10 lines
                line = line.strip()
                if len(line) > 10 and not line.isupper():
                    title = line
                    break
            
            # Extract author (look for common patterns)
            author = None
            author_patterns = [
                r'by\s+([A-Z][a-z]+\s+[A-Z][a-z]+)',
                r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s*\n',
                r'Author[s]?:\s*([^\n]+)'
            ]
            
            for pattern in author_patterns:
                match = re.search(pattern, text[:1000], re.IGNORECASE)
                if match:
                    author = match.group(1).strip()
                    break
            
            # Extract abstract
            abstract_match = re.search(
                r'(?:abstract|summary)[\s:]*(.+?)(?:\n\s*\n|\n(?:1\.|introduction|keywords))',
                text, re.IGNORECASE | re.DOTALL
            )
            abstract = abstract_match.group(1).strip() if abstract_match else None
            
            # Extract introduction
            intro_match = re.search(
                r'(?:introduction|1\.\s*introduction)[\s:]*(.+?)(?:\n\s*\n|\n(?:2\.|method|literature))',
                text, re.IGNORECASE | re.DOTALL
            )
            introduction = intro_match.group(1).strip() if intro_match else None
            
            # Extract conclusion
            conclusion_match = re.search(
                r'(?:conclusion|discussion)[\s:]*(.+?)(?:\n\s*\n|references|\Z)',
                text, re.IGNORECASE | re.DOTALL
            )
            conclusion = conclusion_match.group(1).strip() if conclusion_match else None
            
            return {
                'title': title or 'Academic Paper',
                'author': author or 'Unknown Author',
                'abstract': abstract or '',
                'introduction': introduction or '',
                'conclusion': conclusion or '',
                'full_text': text
            }
            
        except Exception as e:
            # If parsing fails, return basic structure
            return {
                'title': 'Academic Paper',
                'author': 'Unknown Author', 
                'abstract': '',
                'introduction': '',
                'conclusion': '',
                'full_text': text
            }
    
    def get_key_sections(self, text: str) -> List[str]:
        """Extract key sections from the paper"""
        sections = []
        
        # Look for numbered sections
        section_matches = re.finditer(
            r'(\d+\.?\s*[A-Z][^.]*?)\.?\s*\n(.+?)(?=\n\d+\.|\Z)',
            text, re.DOTALL
        )
        
        for match in list(section_matches)[:5]:  # Limit to first 5 sections
            section_title = match.group(1).strip()
            section_content = match.group(2).strip()[:500]  # Limit content length
            if len(section_content) > 50:
                sections.append(f"{section_title}: {section_content}")
        
        return sections