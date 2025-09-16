#!/usr/bin/env python3
"""
Academic Summarizer Backend API Test Suite
Tests all backend endpoints and functionality
"""

import requests
import json
import time
import os
import tempfile
from pathlib import Path
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

# Get backend URL from environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://econ-ai-blog.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.paper_id = None
        
    def log_result(self, test_name, success, message="", details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            'test': test_name,
            'status': status,
            'success': success,
            'message': message,
            'details': details
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if message:
            print(f"   {message}")
        if details:
            print(f"   Details: {details}")
        print()

    def create_test_pdf(self):
        """Create a test PDF file for upload testing"""
        try:
            # Create a temporary PDF file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            
            # Create PDF content using reportlab
            c = canvas.Canvas(temp_file.name, pagesize=letter)
            
            # Add title
            c.setFont("Helvetica-Bold", 16)
            c.drawString(100, 750, "Machine Learning in Healthcare: A Comprehensive Review")
            
            # Add author
            c.setFont("Helvetica", 12)
            c.drawString(100, 720, "by Dr. Sarah Johnson")
            
            # Add abstract section
            c.setFont("Helvetica-Bold", 14)
            c.drawString(100, 680, "Abstract")
            
            c.setFont("Helvetica", 10)
            abstract_text = """This paper presents a comprehensive review of machine learning applications in healthcare.
We examine various algorithms and their effectiveness in medical diagnosis, treatment planning,
and patient outcome prediction. Our analysis covers supervised learning, unsupervised learning,
and deep learning approaches across different medical domains."""
            
            # Split text into lines
            lines = abstract_text.split('\n')
            y_position = 660
            for line in lines:
                c.drawString(100, y_position, line.strip())
                y_position -= 15
            
            # Add introduction section
            c.setFont("Helvetica-Bold", 14)
            c.drawString(100, 580, "1. Introduction")
            
            c.setFont("Helvetica", 10)
            intro_text = """Machine learning has revolutionized healthcare by providing powerful tools for data analysis
and pattern recognition. This technology enables healthcare professionals to make more accurate
diagnoses, predict patient outcomes, and personalize treatment plans. The integration of ML
algorithms with electronic health records has opened new possibilities for improving patient care."""
            
            lines = intro_text.split('\n')
            y_position = 560
            for line in lines:
                c.drawString(100, y_position, line.strip())
                y_position -= 15
            
            # Add conclusion section
            c.setFont("Helvetica-Bold", 14)
            c.drawString(100, 480, "Conclusion")
            
            c.setFont("Helvetica", 10)
            conclusion_text = """Our review demonstrates that machine learning techniques show significant promise
in healthcare applications. The technology has the potential to transform medical practice
by improving diagnostic accuracy, reducing costs, and enhancing patient outcomes.
Future research should focus on addressing ethical considerations and ensuring
the reliability of ML systems in clinical settings."""
            
            lines = conclusion_text.split('\n')
            y_position = 460
            for line in lines:
                c.drawString(100, y_position, line.strip())
                y_position -= 15
            
            c.save()
            temp_file.close()
            
            return temp_file.name
            
        except Exception as e:
            self.log_result("Create Test PDF", False, f"Failed to create test PDF: {str(e)}")
            return None

    def test_health_check(self):
        """Test GET /api/ endpoint"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "running" in data["message"].lower():
                    self.log_result("Health Check", True, "API is running successfully")
                    return True
                else:
                    self.log_result("Health Check", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
            return False

    def test_file_upload(self):
        """Test POST /api/papers/upload endpoint"""
        try:
            # Create test PDF
            pdf_path = self.create_test_pdf()
            if not pdf_path:
                return False
            
            # Upload the PDF
            with open(pdf_path, 'rb') as pdf_file:
                files = {'file': ('test_paper.pdf', pdf_file, 'application/pdf')}
                response = requests.post(f"{API_BASE}/papers/upload", files=files, timeout=30)
            
            # Clean up test file
            os.unlink(pdf_path)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['id', 'filename', 'status', 'processing_progress']
                
                if all(field in data for field in required_fields):
                    self.paper_id = data['id']
                    if data['status'] == 'uploaded' and data['filename'] == 'test_paper.pdf':
                        self.log_result("File Upload", True, f"PDF uploaded successfully, Paper ID: {self.paper_id}")
                        return True
                    else:
                        self.log_result("File Upload", False, f"Unexpected status or filename: {data}")
                        return False
                else:
                    self.log_result("File Upload", False, f"Missing required fields in response: {data}")
                    return False
            else:
                self.log_result("File Upload", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("File Upload", False, f"Upload error: {str(e)}")
            return False

    def test_invalid_file_upload(self):
        """Test upload with invalid file type"""
        try:
            # Create a text file instead of PDF
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.txt')
            temp_file.write(b"This is not a PDF file")
            temp_file.close()
            
            with open(temp_file.name, 'rb') as txt_file:
                files = {'file': ('test.txt', txt_file, 'text/plain')}
                response = requests.post(f"{API_BASE}/papers/upload", files=files, timeout=10)
            
            os.unlink(temp_file.name)
            
            if response.status_code == 400:
                self.log_result("Invalid File Upload", True, "Correctly rejected non-PDF file")
                return True
            else:
                self.log_result("Invalid File Upload", False, f"Should have rejected non-PDF file, got HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Invalid File Upload", False, f"Error testing invalid upload: {str(e)}")
            return False

    def test_status_polling(self):
        """Test GET /api/papers/{id}/status endpoint"""
        if not self.paper_id:
            self.log_result("Status Polling", False, "No paper ID available for testing")
            return False
        
        try:
            response = requests.get(f"{API_BASE}/papers/{self.paper_id}/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['status', 'progress']
                
                if all(field in data for field in required_fields):
                    status = data['status']
                    progress = data['progress']
                    
                    if status in ['uploaded', 'processing', 'completed', 'failed'] and isinstance(progress, int):
                        self.log_result("Status Polling", True, f"Status: {status}, Progress: {progress}%")
                        return True
                    else:
                        self.log_result("Status Polling", False, f"Invalid status or progress values: {data}")
                        return False
                else:
                    self.log_result("Status Polling", False, f"Missing required fields: {data}")
                    return False
            else:
                self.log_result("Status Polling", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Status Polling", False, f"Status polling error: {str(e)}")
            return False

    def test_nonexistent_paper_status(self):
        """Test status endpoint with non-existent paper ID"""
        try:
            fake_id = "non-existent-paper-id"
            response = requests.get(f"{API_BASE}/papers/{fake_id}/status", timeout=10)
            
            if response.status_code == 404:
                self.log_result("Non-existent Paper Status", True, "Correctly returned 404 for non-existent paper")
                return True
            else:
                self.log_result("Non-existent Paper Status", False, f"Should return 404, got HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Non-existent Paper Status", False, f"Error: {str(e)}")
            return False

    def wait_for_processing(self, max_wait_time=120):
        """Wait for paper processing to complete"""
        if not self.paper_id:
            return False
        
        print(f"Waiting for paper {self.paper_id} to complete processing (max {max_wait_time}s)...")
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            try:
                response = requests.get(f"{API_BASE}/papers/{self.paper_id}/status", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    status = data.get('status')
                    progress = data.get('progress', 0)
                    
                    print(f"Status: {status}, Progress: {progress}%")
                    
                    if status == 'completed':
                        self.log_result("AI Processing", True, f"Paper processing completed successfully in {int(time.time() - start_time)}s")
                        return True
                    elif status == 'failed':
                        self.log_result("AI Processing", False, "Paper processing failed")
                        return False
                    
                    time.sleep(5)  # Wait 5 seconds before next check
                else:
                    print(f"Status check failed: HTTP {response.status_code}")
                    time.sleep(5)
                    
            except Exception as e:
                print(f"Error checking status: {str(e)}")
                time.sleep(5)
        
        self.log_result("AI Processing", False, f"Processing did not complete within {max_wait_time} seconds")
        return False

    def test_summary_retrieval(self):
        """Test GET /api/papers/{id}/summary endpoint"""
        if not self.paper_id:
            self.log_result("Summary Retrieval", False, "No paper ID available for testing")
            return False
        
        try:
            response = requests.get(f"{API_BASE}/papers/{self.paper_id}/summary", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ['title', 'introduction', 'key_points', 'conclusion', 'implications']
                
                if all(field in data for field in required_fields):
                    # Validate key_points structure
                    key_points = data['key_points']
                    if isinstance(key_points, list) and len(key_points) > 0:
                        # Check first key point has required structure
                        if isinstance(key_points[0], dict) and 'heading' in key_points[0] and 'content' in key_points[0]:
                            self.log_result("Summary Retrieval", True, f"Summary retrieved with {len(key_points)} key points")
                            return True
                        else:
                            self.log_result("Summary Retrieval", False, "Key points have invalid structure")
                            return False
                    else:
                        self.log_result("Summary Retrieval", False, "Key points is not a valid list")
                        return False
                else:
                    self.log_result("Summary Retrieval", False, f"Missing required fields: {data}")
                    return False
            elif response.status_code == 404:
                self.log_result("Summary Retrieval", False, "Summary not found - processing may not be complete")
                return False
            else:
                self.log_result("Summary Retrieval", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Summary Retrieval", False, f"Summary retrieval error: {str(e)}")
            return False

    def test_html_retrieval(self):
        """Test GET /api/papers/{id}/html endpoint"""
        if not self.paper_id:
            self.log_result("HTML Retrieval", False, "No paper ID available for testing")
            return False
        
        try:
            response = requests.get(f"{API_BASE}/papers/{self.paper_id}/html", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'html_content' in data and isinstance(data['html_content'], str):
                    html_content = data['html_content']
                    # Basic HTML validation
                    if '<html' in html_content and '</html>' in html_content and '<body' in html_content:
                        self.log_result("HTML Retrieval", True, f"HTML blog retrieved ({len(html_content)} characters)")
                        return True
                    else:
                        self.log_result("HTML Retrieval", False, "HTML content appears to be invalid")
                        return False
                else:
                    self.log_result("HTML Retrieval", False, f"Invalid response format: {data}")
                    return False
            elif response.status_code == 404:
                self.log_result("HTML Retrieval", False, "HTML blog not found - processing may not be complete")
                return False
            else:
                self.log_result("HTML Retrieval", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("HTML Retrieval", False, f"HTML retrieval error: {str(e)}")
            return False

    def test_file_downloads(self):
        """Test GET /api/papers/{id}/download/{format} endpoints"""
        if not self.paper_id:
            self.log_result("File Downloads", False, "No paper ID available for testing")
            return False
        
        formats_to_test = ['original', 'summary', 'html']
        all_passed = True
        
        for format_type in formats_to_test:
            try:
                response = requests.get(f"{API_BASE}/papers/{self.paper_id}/download/{format_type}", timeout=15)
                
                if response.status_code == 200:
                    # Check content type and size
                    content_length = len(response.content)
                    if content_length > 0:
                        self.log_result(f"Download {format_type.title()}", True, f"Downloaded {content_length} bytes")
                    else:
                        self.log_result(f"Download {format_type.title()}", False, "Empty file downloaded")
                        all_passed = False
                elif response.status_code == 404:
                    self.log_result(f"Download {format_type.title()}", False, f"{format_type.title()} file not found")
                    all_passed = False
                else:
                    self.log_result(f"Download {format_type.title()}", False, f"HTTP {response.status_code}: {response.text}")
                    all_passed = False
                    
            except Exception as e:
                self.log_result(f"Download {format_type.title()}", False, f"Download error: {str(e)}")
                all_passed = False
        
        return all_passed

    def test_invalid_download_format(self):
        """Test download with invalid format"""
        if not self.paper_id:
            self.log_result("Invalid Download Format", False, "No paper ID available for testing")
            return False
        
        try:
            response = requests.get(f"{API_BASE}/papers/{self.paper_id}/download/invalid_format", timeout=10)
            
            if response.status_code == 400:
                self.log_result("Invalid Download Format", True, "Correctly rejected invalid format")
                return True
            else:
                self.log_result("Invalid Download Format", False, f"Should return 400, got HTTP {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Invalid Download Format", False, f"Error: {str(e)}")
            return False

    def test_list_papers(self):
        """Test GET /api/papers endpoint"""
        try:
            response = requests.get(f"{API_BASE}/papers", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if our uploaded paper is in the list
                        paper_found = any(paper.get('id') == self.paper_id for paper in data)
                        if paper_found:
                            self.log_result("List Papers", True, f"Found {len(data)} papers including our test paper")
                        else:
                            self.log_result("List Papers", True, f"Found {len(data)} papers (test paper may not be visible yet)")
                    else:
                        self.log_result("List Papers", True, "No papers found (empty list)")
                    return True
                else:
                    self.log_result("List Papers", False, f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_result("List Papers", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("List Papers", False, f"List papers error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("=" * 60)
        print("ACADEMIC SUMMARIZER BACKEND API TEST SUITE")
        print("=" * 60)
        print(f"Testing API at: {API_BASE}")
        print()
        
        # Test sequence
        tests_passed = 0
        total_tests = 0
        
        # Basic connectivity tests
        if self.test_health_check():
            tests_passed += 1
        total_tests += 1
        
        # File upload tests
        if self.test_file_upload():
            tests_passed += 1
        total_tests += 1
        
        if self.test_invalid_file_upload():
            tests_passed += 1
        total_tests += 1
        
        # Status polling tests
        if self.test_status_polling():
            tests_passed += 1
        total_tests += 1
        
        if self.test_nonexistent_paper_status():
            tests_passed += 1
        total_tests += 1
        
        # Wait for processing to complete
        processing_completed = self.wait_for_processing()
        if processing_completed:
            tests_passed += 1
        total_tests += 1
        
        # Only test retrieval endpoints if processing completed
        if processing_completed:
            if self.test_summary_retrieval():
                tests_passed += 1
            total_tests += 1
            
            if self.test_html_retrieval():
                tests_passed += 1
            total_tests += 1
            
            if self.test_file_downloads():
                tests_passed += 1
            total_tests += 1
        else:
            print("Skipping retrieval tests due to processing failure")
            total_tests += 3  # Account for skipped tests
        
        # Additional tests
        if self.test_invalid_download_format():
            tests_passed += 1
        total_tests += 1
        
        if self.test_list_papers():
            tests_passed += 1
        total_tests += 1
        
        # Print summary
        print("=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            if result['message']:
                print(f"   {result['message']}")
        
        print()
        print(f"OVERALL RESULT: {tests_passed}/{total_tests} tests passed")
        
        if tests_passed == total_tests:
            print("🎉 ALL TESTS PASSED! Backend API is working correctly.")
        else:
            print(f"⚠️  {total_tests - tests_passed} tests failed. Please check the issues above.")
        
        return tests_passed == total_tests

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)