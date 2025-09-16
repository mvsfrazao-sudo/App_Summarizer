import os
import json
import asyncio
from typing import Dict, List
from models import KeyPoint
from emergentintegrations.llm.chat import LlmChat, UserMessage

class AISummarizer:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY', 'sk-emergent-6Fe62898991Ec31C79')
    
    async def create_accessible_summary(self, paper_data: Dict[str, str]) -> Dict:
        """Create an accessible summary from academic paper data"""
        
        # Prepare the prompt for AI summarization
        prompt = f"""
        You are an expert at making academic research accessible to general audiences. 
        Transform this academic paper into an engaging, easy-to-understand summary.

        PAPER DETAILS:
        Title: {paper_data.get('title', 'Academic Paper')}
        Author: {paper_data.get('author', 'Unknown Author')}
        Abstract: {paper_data.get('abstract', '')}
        Introduction: {paper_data.get('introduction', '')}
        Conclusion: {paper_data.get('conclusion', '')}

        FULL TEXT (excerpt): {paper_data.get('full_text', '')[:3000]}

        Please create:
        1. An engaging title that makes the research accessible
        2. A compelling introduction paragraph that hooks the reader
        3. 4-5 key points that explain the main concepts in simple terms
        4. A clear conclusion paragraph
        5. 3-4 practical implications or takeaways

        Format your response as JSON with this exact structure:
        {{
            "title": "Engaging accessible title",
            "introduction": "Hook paragraph in simple language",
            "key_points": [
                {{"heading": "Point 1 Title", "content": "Explanation in simple terms"}},
                {{"heading": "Point 2 Title", "content": "Explanation in simple terms"}},
                {{"heading": "Point 3 Title", "content": "Explanation in simple terms"}},
                {{"heading": "Point 4 Title", "content": "Explanation in simple terms"}}
            ],
            "conclusion": "Clear concluding paragraph",
            "implications": ["Implication 1", "Implication 2", "Implication 3"]
        }}

        Use conversational language, avoid jargon, and make it engaging for non-experts.
        """

        try:
            # Initialize LlmChat with the API key and system message
            llm_chat = LlmChat(
                api_key=self.api_key,
                session_id="summarizer_session",
                system_message="You are an expert academic communication specialist who excels at making complex research accessible to general audiences."
            ).with_model("openai", "gpt-4o")
            
            # Create user message
            user_message = UserMessage(text=prompt)
            
            # Send the message and get response
            response = await llm_chat.send_message(user_message)
            
            # Try to parse JSON response
            try:
                summary_data = json.loads(response)
                return summary_data
            except json.JSONDecodeError:
                # If JSON parsing fails, return a fallback summary
                return self._create_fallback_summary(paper_data)
                
        except Exception as e:
            print(f"AI Summarization error: {str(e)}")
            import traceback
            traceback.print_exc()
            return self._create_fallback_summary(paper_data)

    def _create_fallback_summary(self, paper_data: Dict[str, str]) -> Dict:
        """Create a basic fallback summary if AI processing fails"""
        title = paper_data.get('title', 'Academic Research Summary')
        
        return {
            "title": f"Understanding: {title}",
            "introduction": f"This research paper explores important concepts and findings that contribute to our understanding of the field. The work by {paper_data.get('author', 'the researcher')} provides valuable insights worth exploring.",
            "key_points": [
                {"heading": "Research Focus", "content": "This study examines key aspects of the topic with systematic methodology and analysis."},
                {"heading": "Key Findings", "content": "The research reveals significant patterns and relationships that advance our knowledge in this area."},
                {"heading": "Methodology", "content": "The authors employed rigorous research methods to ensure reliable and valid results."},
                {"heading": "Implications", "content": "The findings have important implications for both theory and practical applications in the field."}
            ],
            "conclusion": "This research contributes meaningfully to the academic discourse and provides a foundation for future studies in this important area.",
            "implications": [
                "Advances theoretical understanding in the field",
                "Provides practical insights for practitioners", 
                "Opens new avenues for future research",
                "Contributes to evidence-based decision making"
            ]
        }

    def generate_html_blog(self, summary_data: Dict, paper_data: Dict[str, str]) -> str:
        """Generate a complete HTML blog post from summary data"""
        
        title = summary_data.get('title', 'Academic Research Summary')
        author = paper_data.get('author', 'Unknown Author')
        
        # Generate key points HTML
        key_points_html = ""
        for point in summary_data.get('key_points', []):
            key_points_html += f"""
        <div class="section">
            <h2>{point.get('heading', 'Key Point')}</h2>
            <p>{point.get('content', 'Content not available')}</p>
        </div>
"""

        # Generate implications HTML
        implications_html = ""
        for implication in summary_data.get('implications', []):
            implications_html += f'                <li>{implication}</li>\n'

        html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #f7fafc;
        }}
        .header {{
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border-radius: 12px;
        }}
        .header h1 {{
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }}
        .meta {{
            opacity: 0.9;
            font-size: 0.9rem;
        }}
        .content {{
            background: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }}
        .intro {{
            font-size: 1.2rem;
            font-style: italic;
            color: #4a5568;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #edf2f7;
            border-left: 4px solid #10b981;
            border-radius: 0 8px 8px 0;
        }}
        .section {{
            margin-bottom: 2.5rem;
        }}
        .section h2 {{
            color: #2d3748;
            font-size: 1.5rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.5rem;
        }}
        .section p {{
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }}
        .implications {{
            background: #f0fff4;
            border: 1px solid #9ae6b4;
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 2rem;
        }}
        .implications h3 {{
            color: #22543d;
            margin-bottom: 1rem;
        }}
        .implications ul {{
            list-style-type: none;
            padding: 0;
        }}
        .implications li {{
            padding: 0.5rem 0;
            border-bottom: 1px solid #c6f6d5;
        }}
        .implications li:before {{
            content: "✓ ";
            color: #38a169;
            font-weight: bold;
            margin-right: 0.5rem;
        }}
        .footer {{
            text-align: center;
            margin-top: 3rem;
            padding: 2rem;
            background: #2d3748;
            color: white;
            border-radius: 12px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>{title}</h1>
        <div class="meta">
            <p>Based on research by {author}</p>
            <p>Published: {paper_data.get('upload_date', 'Recent')} | Reading time: 6-8 minutes</p>
        </div>
    </div>

    <div class="content">
        <div class="intro">
            {summary_data.get('introduction', 'This research provides valuable insights into important academic concepts.')}
        </div>

{key_points_html}

        <div class="implications">
            <h3>Key Implications and Takeaways</h3>
            <ul>
{implications_html}
            </ul>
        </div>
    </div>

    <div class="footer">
        <p><strong>Conclusion:</strong> {summary_data.get('conclusion', 'This research contributes valuable knowledge to the field and opens new avenues for understanding.')}</p>
    </div>
</body>
</html>"""

        return html_template