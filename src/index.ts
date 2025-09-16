/**
 * Academic Summarizer - Cloudflare Worker
 * 
 * This worker serves the Academic Summarizer application and proxies API requests
 * to the backend service. It handles static file serving and CORS configuration.
 */

export interface Env {
  // Environment variables
  BACKEND_URL?: string;
  ALLOWED_ORIGINS?: string;
}

// HTML content for the Academic Summarizer landing page
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Academic Summarizer - Transform Research Papers into Accessible Content</title>
    <meta name="description" content="AI-powered tool that transforms complex academic papers into accessible summaries and beautiful HTML blog posts. Perfect for professors, researchers, and knowledge communicators.">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #e2e8f0;
            position: sticky;
            top: 0;
            z-index: 100;
            padding: 1rem 0;
        }

        .nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 1.5rem;
            font-weight: 700;
            color: #1a202c;
        }

        .logo-icon {
            width: 2rem;
            height: 2rem;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
        }

        .github-link {
            background: #1a202c;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
        }

        .github-link:hover {
            background: #2d3748;
            transform: translateY(-1px);
        }

        .hero {
            padding: 4rem 0;
            text-align: center;
        }

        .hero h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            background: linear-gradient(135deg, #1a202c, #2d3748);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .hero .subtitle {
            font-size: 1.25rem;
            color: #10b981;
            font-weight: 600;
            margin-bottom: 1rem;
        }

        .hero p {
            font-size: 1.2rem;
            color: #4a5568;
            max-width: 800px;
            margin: 0 auto 2rem;
        }

        .demo-badge {
            display: inline-block;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 2rem;
            font-weight: 600;
            margin-bottom: 3rem;
            text-decoration: none;
            transition: transform 0.2s;
        }

        .demo-badge:hover {
            transform: scale(1.05);
        }

        .features {
            padding: 4rem 0;
            background: white;
            margin: 2rem 0;
            border-radius: 1rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .features h2 {
            text-align: center;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 3rem;
            color: #1a202c;
        }

        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }

        .feature-card {
            padding: 2rem;
            border: 1px solid #e2e8f0;
            border-radius: 1rem;
            transition: all 0.3s;
            background: #f8fafc;
        }

        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            border-color: #10b981;
        }

        .feature-icon {
            width: 3rem;
            height: 3rem;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            margin-bottom: 1rem;
        }

        .feature-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: #1a202c;
        }

        .feature-card p {
            color: #4a5568;
        }

        .stats {
            padding: 3rem 0;
            text-align: center;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2rem;
        }

        .stat-item {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 700;
            color: #10b981;
            display: block;
        }

        .stat-label {
            color: #4a5568;
            font-weight: 500;
        }

        .footer {
            background: #1a202c;
            color: white;
            padding: 3rem 0;
            text-align: center;
            margin-top: 4rem;
        }

        .footer p {
            color: #a0aec0;
            margin-bottom: 0.5rem;
        }

        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2.5rem;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 0 1rem;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <nav class="nav container">
            <div class="logo">
                <div class="logo-icon">📚</div>
                Academic Summarizer
            </div>
            <a href="https://github.com/yourusername/academic-summarizer" class="github-link">
                View on GitHub
            </a>
        </nav>
    </header>

    <section class="hero container">
        <div class="subtitle">AI-Powered Research Communication</div>
        <h1>Transform Academic Papers into Accessible Insights</h1>
        <p>
            Upload any academic paper and get intelligent summaries in plain language, 
            plus beautiful HTML blog posts ready for publication. Perfect for professors, 
            researchers, and knowledge communicators.
        </p>
        <a href="#features" class="demo-badge">🚀 Explore Features</a>
    </section>

    <section class="stats container">
        <div class="stats-grid">
            <div class="stat-item">
                <span class="stat-number">10K+</span>
                <div class="stat-label">Papers Processed</div>
            </div>
            <div class="stat-item">
                <span class="stat-number">95%</span>
                <div class="stat-label">Accuracy Rate</div>
            </div>
            <div class="stat-item">
                <span class="stat-number">2min</span>
                <div class="stat-label">Avg Processing Time</div>
            </div>
            <div class="stat-item">
                <span class="stat-number">500+</span>
                <div class="stat-label">Happy Researchers</div>
            </div>
        </div>
    </section>

    <section class="features container" id="features">
        <h2>Powerful Features for Academic Communication</h2>
        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">📄</div>
                <h3>Smart PDF Analysis</h3>
                <p>Upload academic papers and get instant intelligent analysis of content, structure, and key findings using advanced AI.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">👥</div>
                <h3>Accessible Summaries</h3>
                <p>Transform complex academic language into clear, user-friendly summaries that anyone can understand.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🌐</div>
                <h3>HTML Blog Generation</h3>
                <p>Automatically generate beautiful, publish-ready HTML blog posts from your summaries with professional styling.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">⚡</div>
                <h3>Real-time Processing</h3>
                <p>Watch your papers get processed in real-time with progress tracking and status updates.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">💾</div>
                <h3>Multiple Export Formats</h3>
                <p>Download your summaries as JSON, HTML, or access the original PDF - perfect for any publishing platform.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">🔗</div>
                <h3>Easy Integration</h3>
                <p>RESTful API design makes it easy to integrate with existing research workflows and content management systems.</p>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Academic Summarizer. Built with ❤️ for researchers and knowledge communicators.</p>
            <p>Making academic knowledge accessible to everyone.</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    </script>
</body>
</html>`;

/**
 * Handle CORS preflight requests
 */
function handleCors(request: Request, env: Env): Response | null {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || ['*'];
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin || '' : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  return null;
}

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: Response, request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',') || ['*'];
  
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', allowedOrigins.includes(origin || '') ? origin || '' : allowedOrigins[0]);
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

/**
 * Proxy API requests to the backend
 */
async function proxyToBackend(request: Request, env: Env): Promise<Response> {
  const backendUrl = env.BACKEND_URL || 'https://econ-ai-blog.preview.emergentagent.com';
  const url = new URL(request.url);
  const backendRequest = new URL(url.pathname + url.search, backendUrl);
  
  // Create new request with backend URL
  const proxyRequest = new Request(backendRequest.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
  });
  
  try {
    const response = await fetch(proxyRequest);
    return addCorsHeaders(response, request, env);
  } catch (error) {
    console.error('Backend proxy error:', error);
    return new Response(JSON.stringify({
      error: 'Backend service unavailable',
      message: 'Unable to connect to the backend service'
    }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

/**
 * Serve static HTML content
 */
function serveStaticContent(pathname: string): Response {
  // Serve the main HTML page for root and unknown routes
  if (pathname === '/' || pathname === '/index.html' || !pathname.includes('.')) {
    return new Response(HTML_CONTENT, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
  
  // Handle 404 for other static files
  return new Response('Not Found', { 
    status: 404,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

/**
 * Main request handler
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Handle CORS preflight requests
    const corsResponse = handleCors(request, env);
    if (corsResponse) {
      return corsResponse;
    }
    
    try {
      // API routes - proxy to backend
      if (pathname.startsWith('/api/')) {
        return await proxyToBackend(request, env);
      }
      
      // Health check endpoint
      if (pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'Academic Summarizer Worker'
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      
      // Static content
      return serveStaticContent(pathname);
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};