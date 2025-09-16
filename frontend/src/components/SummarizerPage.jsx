import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Upload, 
  FileText, 
  Download, 
  Eye, 
  Copy, 
  Check, 
  ArrowLeft,
  Loader2,
  BookOpen,
  Globe,
  Code,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { paperService } from '../services/api';
import { mockPdfData } from '../data/mock';

const SummarizerPage = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [summaryData, setSummaryData] = useState(null);
  const [htmlData, setHtmlData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setError(null);
      toast.success('PDF uploaded successfully!');
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setError(null);
      toast.success('PDF uploaded successfully!');
    } else {
      toast.error('Please upload a valid PDF file');
    }
  };

  const startProcessing = async () => {
    if (!uploadedFile) return;

    try {
      setIsProcessing(true);
      setProgress(0);
      setError(null);

      // Upload the file
      const paperResponse = await paperService.uploadPaper(uploadedFile);
      setCurrentPaper(paperResponse);
      toast.success('File uploaded! Processing started...');

      // Poll for status updates
      const pollStatus = async () => {
        try {
          const statusResponse = await paperService.getPaperStatus(paperResponse.id);
          setProgress(statusResponse.progress);

          if (statusResponse.status === 'completed') {
            setIsProcessing(false);
            setShowResults(true);
            await loadResults(paperResponse.id);
            toast.success('Paper processed successfully!');
          } else if (statusResponse.status === 'failed') {
            setIsProcessing(false);
            setError('Processing failed. Please try again.');
            toast.error('Processing failed');
          } else {
            // Continue polling
            setTimeout(pollStatus, 2000);
          }
        } catch (err) {
          console.error('Status polling error:', err);
          setTimeout(pollStatus, 3000); // Retry in 3 seconds
        }
      };

      // Start polling
      setTimeout(pollStatus, 1000);

    } catch (err) {
      console.error('Processing error:', err);
      setIsProcessing(false);
      setError(err.response?.data?.detail || 'Failed to process file');
      toast.error('Failed to process file');
    }
  };

  const loadResults = async (paperId) => {
    try {
      setIsLoadingResults(true);
      
      // Load summary and HTML data
      const [summaryResponse, htmlResponse] = await Promise.all([
        paperService.getPaperSummary(paperId),
        paperService.getPaperHtml(paperId)
      ]);

      setSummaryData(summaryResponse);
      setHtmlData(htmlResponse);
    } catch (err) {
      console.error('Error loading results:', err);
      toast.error('Error loading results');
    } finally {
      setIsLoadingResults(false);
    }
  };

  const showExampleResults = () => {
    setShowResults(true);
    setSummaryData(mockPdfData.accessibleSummary);
    setHtmlData({ html_content: mockPdfData.htmlBlogPost });
    setCurrentPaper(mockPdfData.originalPaper);
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'summary') {
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2000);
      } else {
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 2000);
      }
      toast.success(`${type === 'summary' ? 'Summary' : 'HTML'} copied to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadFile = async (format) => {
    if (!currentPaper?.id) {
      // Fallback for mock data
      const content = format === 'html' ? htmlData?.html_content : JSON.stringify(summaryData, null, 2);
      const contentType = format === 'html' ? 'text/html' : 'application/json';
      const filename = format === 'html' ? 'blog-post.html' : 'summary.json';
      
      const blob = new Blob([content], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`${filename} downloaded successfully!`);
      return;
    }

    try {
      const blob = await paperService.downloadPaperContent(currentPaper.id, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'html' ? 'blog-post.html' : 'summary.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('File downloaded successfully!');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Failed to download file');
    }
  };

  const renderSummaryContent = () => {
    if (!summaryData) return <div>Loading summary...</div>;
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">{summaryData.title}</h2>
          <p className="text-lg text-gray-600 italic mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            {summaryData.introduction}
          </p>
        </div>

        {summaryData.key_points?.map((point, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">{point.heading}</h3>
            <p className="text-gray-700 leading-relaxed">{point.content}</p>
          </div>
        ))}

        {summaryData.implications && summaryData.implications.length > 0 && (
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-semibold mb-3 text-green-800">Key Implications</h3>
            <ul className="space-y-2">
              {summaryData.implications.map((implication, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-green-700">{implication}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Conclusion</h3>
          <p className="text-gray-700 leading-relaxed">{summaryData.conclusion}</p>
        </div>
      </div>
    );
  };

  const resetState = () => {
    setShowResults(false);
    setUploadedFile(null);
    setCurrentPaper(null);
    setProgress(0);
    setSummaryData(null);
    setHtmlData(null);
    setError(null);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Academic Summarizer</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!showResults ? (
          <div className="space-y-8">
            {/* Error Display */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900">Upload Your Academic Paper</CardTitle>
                <CardDescription className="text-base">
                  Upload a PDF file to get started with intelligent summarization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-emerald-500 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">
                    Drop your PDF here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF files up to 50MB
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {uploadedFile && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">{uploadedFile.name}</p>
                          <p className="text-sm text-green-600">Ready to process</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        PDF
                      </Badge>
                    </div>
                  </div>
                )}

                {uploadedFile && !isProcessing && (
                  <div className="text-center">
                    <Button
                      onClick={startProcessing}
                      size="lg"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      Start Processing
                    </Button>
                  </div>
                )}

                {isProcessing && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                      <span className="text-gray-600">Processing your paper...</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <p className="text-center text-sm text-gray-500">
                      Analyzing content and generating summaries ({Math.round(progress)}%)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Demo Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Want to see an example?</CardTitle>
                <CardDescription>
                  Check out how we processed "AI Agents for Economic Research" by Anton Korinek
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={showExampleResults}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Example Results
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {isLoadingResults ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
                  <p className="text-gray-600">Loading results...</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Results Header */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-teal-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl text-gray-900">Processing Complete!</CardTitle>
                        <CardDescription className="text-base mt-2">
                          Paper: {currentPaper?.original_title || currentPaper?.title || 'Academic Paper'} 
                          {currentPaper?.author && ` by ${currentPaper.author}`}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Check className="mr-1 h-3 w-3" />
                        Processed
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Results Tabs */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <div className="border-b">
                        <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0">
                          <TabsTrigger 
                            value="summary" 
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 py-4 text-base font-medium border-b-2 border-transparent data-[state=active]:border-emerald-500 rounded-none"
                          >
                            <FileText className="mr-2 h-5 w-5" />
                            Accessible Summary
                          </TabsTrigger>
                          <TabsTrigger 
                            value="html" 
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 py-4 text-base font-medium border-b-2 border-transparent data-[state=active]:border-emerald-500 rounded-none"
                          >
                            <Code className="mr-2 h-5 w-5" />
                            HTML Blog Post
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="summary" className="p-6 mt-0">
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">Accessible Summary</h3>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(JSON.stringify(summaryData, null, 2), 'summary')}
                              >
                                {copiedSummary ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copiedSummary ? 'Copied!' : 'Copy'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile('summary')}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                          {renderSummaryContent()}
                        </div>
                      </TabsContent>

                      <TabsContent value="html" className="p-6 mt-0">
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900">HTML Blog Post</h3>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newWindow = window.open();
                                  newWindow.document.write(htmlData?.html_content || '');
                                  newWindow.document.close();
                                }}
                              >
                                <Globe className="h-4 w-4 mr-1" />
                                Preview
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(htmlData?.html_content || '', 'html')}
                              >
                                {copiedHtml ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                {copiedHtml ? 'Copied!' : 'Copy'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadFile('html')}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4 border">
                            <p className="text-sm text-gray-600 mb-3">HTML Preview:</p>
                            <div className="bg-white rounded border p-4 max-h-96 overflow-y-auto">
                              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                {htmlData?.html_content?.substring(0, 1000) || 'Loading...'}...
                              </pre>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Process Another Paper */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="flex justify-center py-6">
                    <Button
                      onClick={resetState}
                      size="lg"
                      variant="outline"
                      className="text-base px-8"
                    >
                      Process Another Paper
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummarizerPage;