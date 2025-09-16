// Mock data for PDF summarizer application
export const mockPdfData = {
  originalPaper: {
    title: "AI Agents for Economic Research",
    author: "Anton Korinek",
    pages: 25,
    uploadDate: "2024-12-19",
    status: "processed"
  },
  
  accessibleSummary: {
    title: "How AI Agents Are Revolutionizing Economic Research",
    introduction: "Imagine having a research assistant that never sleeps, can read hundreds of papers in minutes, and write code to analyze economic data. That's exactly what AI agents are becoming for economists today.",
    
    keyPoints: [
      {
        heading: "What Are AI Agents?",
        content: "AI agents are like super-smart computer assistants that can work independently on complex research tasks. Unlike simple chatbots that just answer questions, these agents can actually DO things - they can search for information, write code, analyze data, and even manage entire research projects."
      },
      {
        heading: "The Evolution of AI for Research",
        content: "We've moved through three major stages: First came basic chatbots that could only respond to direct questions. Then came reasoning models that could think through problems step-by-step. Now we have autonomous agents that can work independently on multi-step research tasks."
      },
      {
        heading: "Real-World Applications",
        content: "These AI agents can automate literature reviews (reading and summarizing hundreds of research papers), write econometric models and code, analyze complex datasets, and manage entire research workflows from start to finish."
      },
      {
        heading: "The 'Vibe Coding' Revolution",
        content: "Perhaps most exciting is 'vibe coding' - the ability to create sophisticated programs using plain English. Economists no longer need to be programming experts to build powerful research tools."
      },
      {
        heading: "Current Limitations",
        content: "While powerful, AI agents aren't perfect. They still require human oversight to ensure accuracy, can make mistakes with complex reasoning, and need guidance on ethical considerations in research."
      }
    ],
    
    conclusion: "AI agents represent a fundamental shift in how economic research can be conducted. They democratize access to sophisticated research tools and can dramatically increase productivity. However, they work best as powerful assistants rather than replacements for human researchers.",
    
    implications: [
      "Researchers without programming skills can now build sophisticated analysis tools",
      "Literature reviews that took weeks can now be completed in hours",
      "Complex data analysis becomes accessible to more economists",
      "Research workflows can be automated and standardized"
    ]
  },
  
  htmlBlogPost: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>How AI Agents Are Revolutionizing Economic Research</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #f7fafc;
        }
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
        }
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        .meta {
            opacity: 0.9;
            font-size: 0.9rem;
        }
        .content {
            background: white;
            padding: 2.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        .intro {
            font-size: 1.2rem;
            font-style: italic;
            color: #4a5568;
            margin-bottom: 2rem;
            padding: 1.5rem;
            background: #edf2f7;
            border-left: 4px solid #667eea;
            border-radius: 0 8px 8px 0;
        }
        .section {
            margin-bottom: 2.5rem;
        }
        .section h2 {
            color: #2d3748;
            font-size: 1.5rem;
            margin-bottom: 1rem;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 0.5rem;
        }
        .section p {
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }
        .implications {
            background: #f0fff4;
            border: 1px solid #9ae6b4;
            padding: 1.5rem;
            border-radius: 8px;
            margin-top: 2rem;
        }
        .implications h3 {
            color: #22543d;
            margin-bottom: 1rem;
        }
        .implications ul {
            list-style-type: none;
            padding: 0;
        }
        .implications li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #c6f6d5;
        }
        .implications li:before {
            content: "✓ ";
            color: #38a169;
            font-weight: bold;
            margin-right: 0.5rem;
        }
        .footer {
            text-align: center;
            margin-top: 3rem;
            padding: 2rem;
            background: #2d3748;
            color: white;
            border-radius: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>How AI Agents Are Revolutionizing Economic Research</h1>
        <div class="meta">
            <p>Based on "AI Agents for Economic Research" by Anton Korinek</p>
            <p>Published: December 2024 | Reading time: 8 minutes</p>
        </div>
    </div>

    <div class="content">
        <div class="intro">
            Imagine having a research assistant that never sleeps, can read hundreds of papers in minutes, and write code to analyze economic data. That's exactly what AI agents are becoming for economists today.
        </div>

        <div class="section">
            <h2>What Are AI Agents?</h2>
            <p>AI agents are like super-smart computer assistants that can work independently on complex research tasks. Unlike simple chatbots that just answer questions, these agents can actually DO things - they can search for information, write code, analyze data, and even manage entire research projects.</p>
        </div>

        <div class="section">
            <h2>The Evolution of AI for Research</h2>
            <p>We've moved through three major stages: First came basic chatbots that could only respond to direct questions. Then came reasoning models that could think through problems step-by-step. Now we have autonomous agents that can work independently on multi-step research tasks.</p>
        </div>

        <div class="section">
            <h2>Real-World Applications</h2>
            <p>These AI agents can automate literature reviews (reading and summarizing hundreds of research papers), write econometric models and code, analyze complex datasets, and manage entire research workflows from start to finish.</p>
        </div>

        <div class="section">
            <h2>The 'Vibe Coding' Revolution</h2>
            <p>Perhaps most exciting is 'vibe coding' - the ability to create sophisticated programs using plain English. Economists no longer need to be programming experts to build powerful research tools.</p>
        </div>

        <div class="section">
            <h2>Current Limitations</h2>
            <p>While powerful, AI agents aren't perfect. They still require human oversight to ensure accuracy, can make mistakes with complex reasoning, and need guidance on ethical considerations in research.</p>
        </div>

        <div class="implications">
            <h3>Key Implications for Researchers</h3>
            <ul>
                <li>Researchers without programming skills can now build sophisticated analysis tools</li>
                <li>Literature reviews that took weeks can now be completed in hours</li>
                <li>Complex data analysis becomes accessible to more economists</li>
                <li>Research workflows can be automated and standardized</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p><strong>Conclusion:</strong> AI agents represent a fundamental shift in how economic research can be conducted. They democratize access to sophisticated research tools and can dramatically increase productivity. However, they work best as powerful assistants rather than replacements for human researchers.</p>
    </div>
</body>
</html>`
};

export const mockFeatures = [
  {
    icon: "FileText",
    title: "Smart PDF Analysis",
    description: "Upload academic papers and get instant intelligent analysis of content, structure, and key findings."
  },
  {
    icon: "Users",
    title: "Accessible Summaries",
    description: "Transform complex academic language into clear, user-friendly summaries that anyone can understand."
  },
  {
    icon: "Code",
    title: "HTML Blog Generation",
    description: "Automatically generate beautiful, publish-ready HTML blog posts from your summaries."
  },
  {
    icon: "Download",
    title: "Multiple Formats",
    description: "Export your summaries as PDF, HTML, or Markdown - perfect for any publishing platform."
  },
  {
    icon: "Zap",
    title: "AI-Powered",
    description: "Leverage advanced AI to understand context, extract key insights, and maintain academic accuracy."
  },
  {
    icon: "Share2",
    title: "Easy Sharing",
    description: "Share your accessible summaries and blog posts with colleagues, students, or a broader audience."
  }
];

export const mockStats = [
  { number: "10,000+", label: "Papers Processed" },
  { number: "95%", label: "Accuracy Rate" },
  { number: "2min", label: "Average Processing Time" },
  { number: "500+", label: "Happy Researchers" }
];