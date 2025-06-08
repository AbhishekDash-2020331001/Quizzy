#!/usr/bin/env python3
"""
Test script for RAG Quiz System
Run this script to verify your system is working correctly.
"""

import requests
import json
import os
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test if the API is running and healthy"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                print("✅ Health check passed")
                return True
            else:
                print(f"❌ Health check failed: {data}")
                return False
        else:
            print(f"❌ Health check failed with status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to the API. Make sure the server is running on http://localhost:8000")
        return False
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_api_docs():
    """Test if API documentation is accessible"""
    print("📚 Testing API documentation...")
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=10)
        if response.status_code == 200:
            print("✅ API documentation is accessible at http://localhost:8000/docs")
            return True
        else:
            print(f"❌ API docs failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API docs test failed: {e}")
        return False

def test_root_endpoint():
    """Test the root endpoint"""
    print("🏠 Testing root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint working. Message: {data.get('message', 'No message')}")
            return True
        else:
            print(f"❌ Root endpoint failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Root endpoint test failed: {e}")
        return False

def test_environment_variables():
    """Test if required environment variables are set"""
    print("🔐 Testing environment variables...")
    
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key or openai_key == "your_openai_api_key_here":
        print("❌ OPENAI_API_KEY is not properly set in .env file")
        print("   Please set your actual OpenAI API key in the .env file")
        return False
    
    if openai_key.startswith("sk-"):
        print("✅ OpenAI API key appears to be properly formatted")
    else:
        print("⚠️  OpenAI API key doesn't start with 'sk-', please verify it's correct")
    
    chroma_path = os.getenv("CHROMA_DB_PATH", "./chroma_db")
    print(f"✅ Chroma DB path: {chroma_path}")
    
    return True

def test_sample_upload():
    """Test PDF upload with a sample URL (if provided)"""
    print("📄 Testing PDF upload functionality...")
    
    # You can replace this with a real uploadthing URL for testing
    sample_url = input("Enter a test uploadthing PDF URL (or press Enter to skip): ").strip()
    
    if not sample_url:
        print("⏭️  Skipping PDF upload test (no URL provided)")
        return True
    
    try:
        upload_data = {
            "uploadthing_url": sample_url,
            "pdf_name": "test-document.pdf"
        }
        
        print(f"📤 Uploading PDF from: {sample_url}")
        response = requests.post(f"{BASE_URL}/pdf/upload", json=upload_data, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            pdf_id = data.get("pdf_id")
            total_pages = data.get("total_pages")
            print(f"✅ PDF upload successful!")
            print(f"   PDF ID: {pdf_id}")
            print(f"   Total pages: {total_pages}")
            
            # Test chat with the uploaded PDF
            return test_sample_chat(pdf_id)
        else:
            print(f"❌ PDF upload failed with status code: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ PDF upload test failed: {e}")
        return False

def test_sample_chat(pdf_id):
    """Test chat functionality with uploaded PDF"""
    print("💬 Testing chat functionality...")
    
    try:
        chat_data = {
            "pdf_id": pdf_id,
            "message": "What is this document about?",
            "conversation_history": []
        }
        
        response = requests.post(f"{BASE_URL}/pdf/chat", json=chat_data, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            response_text = data.get("response", "")
            sources = data.get("sources", [])
            print(f"✅ Chat test successful!")
            print(f"   Response: {response_text[:100]}{'...' if len(response_text) > 100 else ''}")
            print(f"   Sources: {len(sources)} chunks")
            
            # Test quiz generation
            return test_sample_quiz(pdf_id)
        else:
            print(f"❌ Chat test failed with status code: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Chat test failed: {e}")
        return False

def test_sample_quiz(pdf_id):
    """Test quiz generation with uploaded PDF"""
    print("🧠 Testing quiz generation...")
    
    try:
        quiz_data = {
            "quiz_type": "topic",
            "pdf_ids": [pdf_id],
            "topic": "main concepts",
            "num_questions": 2,
            "difficulty": "medium"
        }
        
        response = requests.post(f"{BASE_URL}/pdf/generate-quiz", json=quiz_data, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            questions = data.get("questions", [])
            quiz_id = data.get("quiz_id")
            print(f"✅ Quiz generation successful!")
            print(f"   Quiz ID: {quiz_id}")
            print(f"   Generated {len(questions)} questions")
            
            if questions:
                print(f"   Sample question: {questions[0].get('question', 'No question')}")
            
            return True
        else:
            print(f"❌ Quiz generation failed with status code: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('detail', 'Unknown error')}")
            except:
                print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Quiz generation test failed: {e}")
        return False

def test_list_pdfs():
    """Test listing stored PDFs"""
    print("📋 Testing PDF listing...")
    
    try:
        response = requests.get(f"{BASE_URL}/pdf/list", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            pdfs = data.get("pdfs", [])
            total = data.get("total", 0)
            print(f"✅ PDF listing successful!")
            print(f"   Total stored PDFs: {total}")
            
            if pdfs:
                for pdf in pdfs[:3]:  # Show first 3
                    print(f"   - {pdf.get('pdf_name', 'Unknown')} (ID: {pdf.get('pdf_id', 'Unknown')[:8]}...)")
            
            return True
        else:
            print(f"❌ PDF listing failed with status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ PDF listing test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting RAG Quiz System Test Suite")
    print("=" * 50)
    
    tests = [
        ("Environment Variables", test_environment_variables),
        ("Health Check", test_health_check),
        ("Root Endpoint", test_root_endpoint),
        ("API Documentation", test_api_docs),
        ("List PDFs", test_list_pdfs),
        ("Sample Upload & Full Flow", test_sample_upload),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📝 Running: {test_name}")
        try:
            if test_func():
                passed += 1
            time.sleep(1)  # Brief pause between tests
        except KeyboardInterrupt:
            print("\n⏹️  Tests interrupted by user")
            break
        except Exception as e:
            print(f"❌ Unexpected error in {test_name}: {e}")
    
    print("\n" + "=" * 50)
    print(f"🏁 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your RAG Quiz System is working correctly.")
        print("\n🌐 Next steps:")
        print("   1. Visit http://localhost:8000/docs to explore the API")
        print("   2. Upload your own PDFs using uploadthing URLs")
        print("   3. Start chatting and generating quizzes!")
    else:
        print("⚠️  Some tests failed. Please check the errors above and:")
        print("   1. Ensure the server is running: uvicorn app.main:app --reload")
        print("   2. Check your .env file has the correct OPENAI_API_KEY")
        print("   3. Verify all dependencies are installed")

if __name__ == "__main__":
    main() 