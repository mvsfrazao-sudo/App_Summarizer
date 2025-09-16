import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API,
  timeout: 60000, // 60 seconds for file uploads
});

export const paperService = {
  // Upload PDF paper
  uploadPaper: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/papers/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get paper processing status
  getPaperStatus: async (paperId) => {
    const response = await apiClient.get(`/papers/${paperId}/status`);
    return response.data;
  },

  // Get paper summary
  getPaperSummary: async (paperId) => {
    const response = await apiClient.get(`/papers/${paperId}/summary`);
    return response.data;
  },

  // Get HTML blog post
  getPaperHtml: async (paperId) => {
    const response = await apiClient.get(`/papers/${paperId}/html`);
    return response.data;
  },

  // Download paper content
  downloadPaperContent: async (paperId, format) => {
    const response = await apiClient.get(`/papers/${paperId}/download/${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // List all papers
  listPapers: async () => {
    const response = await apiClient.get('/papers');
    return response.data;
  },
};

export default apiClient;