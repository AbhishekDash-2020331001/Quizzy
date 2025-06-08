#!/usr/bin/env python3
"""
Test script for Quiz Queue System
Run this script to verify your quiz queueing system is working correctly.
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_quiz_queue():
    """Test the quiz generation queue functionality"""
    print("🧠 Testing Quiz Queue System")
    print("=" * 50)
    
    # First, we need a PDF to work with
    # This assumes you have already uploaded a PDF and have its ID
    # You can get PDF IDs from /pdf/list endpoint
    
    try:
        # Get list of available PDFs
        response = requests.get(f"{BASE_URL}/pdf/list")
        if response.status_code == 200:
            pdfs = response.json()
            if not pdfs:
                print("❌ No PDFs found. Please upload a PDF first using /pdf/upload")
                return False
            
            pdf_id = pdfs[0]["pdf_id"]  # Use the first available PDF
            print(f"✅ Using PDF ID: {pdf_id}")
        else:
            print("❌ Failed to get PDF list")
            return False
            
    except Exception as e:
        print(f"❌ Error getting PDF list: {e}")
        return False
    
    # Test quiz generation with queue
    try:
        exam_id = 12345  # Test exam ID
        quiz_request = {
            "quiz_type": "topic",
            "pdf_ids": [pdf_id],
            "topic": "main concepts",
            "num_questions": 2,
            "difficulty": "medium",
            "exam_id": exam_id
        }
        
        print(f"\n📝 Submitting quiz generation request for exam_id {exam_id}...")
        response = requests.post(f"{BASE_URL}/pdf/generate-quiz", json=quiz_request)
        
        if response.status_code == 200:
            data = response.json()
            job_id = data["job_id"]
            quiz_id = data["quiz_id"]
            print(f"✅ Quiz generation queued successfully!")
            print(f"   Job ID: {job_id}")
            print(f"   Quiz ID: {quiz_id}")
            print(f"   Exam ID: {data['exam_id']}")
            print(f"   Status: {data['status']}")
            
            # Monitor job status
            print(f"\n⏳ Monitoring job status...")
            for i in range(30):  # Check for up to 30 seconds
                try:
                    status_response = requests.get(f"{BASE_URL}/pdf/job/{job_id}/status")
                    if status_response.status_code == 200:
                        status_data = status_response.json()
                        status = status_data["status"]
                        print(f"   Job status: {status}")
                        
                        if status == "finished":
                            print("✅ Job completed successfully!")
                            if status_data.get("result"):
                                result = status_data["result"]
                                print(f"   Quiz ID: {result.get('quiz_id')}")
                                print(f"   Questions: {len(result.get('questions', []))}")
                            break
                        elif status == "failed":
                            print("❌ Job failed!")
                            print(f"   Error: {status_data.get('error', 'Unknown error')}")
                            break
                            
                    time.sleep(2)  # Wait 2 seconds before checking again
                    
                except Exception as e:
                    print(f"   Error checking status: {e}")
                    break
            else:
                print("⏰ Timeout waiting for job completion")
                
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

def test_queue_info():
    """Test the queue information endpoint"""
    print("\n📊 Testing Queue Information...")
    try:
        response = requests.get(f"{BASE_URL}/pdf/queue/info")
        if response.status_code == 200:
            data = response.json()
            print("✅ Queue info retrieved successfully!")
            
            if "pdf_queue" in data:
                pdf_queue = data["pdf_queue"]
                print(f"   PDF Queue - Pending: {pdf_queue['pending_jobs']}, Finished: {pdf_queue['finished_jobs']}")
                
            if "quiz_queue" in data:
                quiz_queue = data["quiz_queue"]
                print(f"   Quiz Queue - Pending: {quiz_queue['pending_jobs']}, Finished: {quiz_queue['finished_jobs']}")
                
            return True
        else:
            print(f"❌ Failed to get queue info: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Queue info test failed: {e}")
        return False

def test_webhook_endpoint():
    """Test the quiz webhook endpoint"""
    print("\n🔗 Testing Quiz Webhook Endpoint...")
    try:
        exam_id = 99999  # Test exam ID
        response = requests.get(f"{BASE_URL}/webhook/test-quiz/{exam_id}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Quiz webhook test successful!")
            print(f"   Message: {data.get('message')}")
            return True
        else:
            print(f"❌ Quiz webhook test failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Quiz webhook test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Quiz Queue System Test Suite")
    print("=" * 50)
    
    tests = [
        ("Queue Information", test_queue_info),
        ("Quiz Webhook Endpoint", test_webhook_endpoint),
        ("Quiz Generation Queue", test_quiz_queue),
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
        print("🎉 All tests passed! Your Quiz Queue System is working correctly.")
        print("\n🌐 Next steps:")
        print("   1. Visit http://localhost:8000/docs to explore the API")
        print("   2. Generate quizzes with exam_id tracking")
        print("   3. Set up webhook handling for quiz completion notifications!")
    else:
        print("⚠️  Some tests failed. Please check the errors above and:")
        print("   1. Ensure the server is running: uvicorn app.main:app --reload")
        print("   2. Ensure the worker is running: python worker.py")
        print("   3. Check that Redis is running and accessible")
        print("   4. Verify you have PDFs uploaded in the system")

if __name__ == "__main__":
    main() 