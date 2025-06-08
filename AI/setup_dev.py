#!/usr/bin/env python3
"""
Development Setup Script for RAG Quiz System with Queue Processing

This script helps set up the development environment and provides commands 
to start the system with background processing.
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_redis():
    """Check if Redis is running"""
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis is running")
        return True
    except Exception as e:
        print(f"❌ Redis is not running: {e}")
        print("Please start Redis server:")
        print("  Ubuntu/Debian: sudo systemctl start redis-server")
        print("  macOS: brew services start redis")
        print("  Windows: Start Redis from installation directory")
        return False

def check_env_file():
    """Check if .env file exists and has required variables"""
    env_file = Path('.env')
    if not env_file.exists():
        print("❌ .env file not found")
        print("Creating example .env file...")
        
        env_content = """# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Vector Database Configuration  
CHROMA_DB_PATH=./chroma_db

# Logging Configuration
LOG_LEVEL=INFO

# Server Configuration
HOST=0.0.0.0
PORT=8000

# Redis Configuration (for queue processing)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
# REDIS_PASSWORD=your_redis_password_here  # Uncomment if Redis requires auth

# Worker Configuration
WORKER_NAME=pdf-worker
WORKER_BURST=false
"""
        
        with open('.env', 'w') as f:
            f.write(env_content)
        
        print("✅ Created .env file")
        print("⚠️  Please edit .env file and add your OpenAI API key")
        return False
    
    # Check if OpenAI API key is set
    from dotenv import load_dotenv
    load_dotenv()
    
    openai_key = os.getenv("OPENAI_API_KEY")
    if not openai_key or openai_key == "your_openai_api_key_here":
        print("❌ OpenAI API key not configured in .env file")
        return False
    
    print("✅ Environment configuration looks good")
    return True

def install_dependencies():
    """Install Python dependencies"""
    print("Installing dependencies...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                      check=True, capture_output=True)
        print("✅ Dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def start_server():
    """Start the FastAPI server"""
    print("Starting FastAPI server...")
    try:
        subprocess.Popen([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--reload", 
            "--host", "0.0.0.0", 
            "--port", "8001"
        ])
        print("✅ Server starting at http://localhost:8001")
        return True
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return False

def start_worker():
    """Start the background worker"""
    print("Starting background worker...")
    try:
        subprocess.Popen([sys.executable, "worker.py", "--queue", "pdf_processing"])
        print("✅ Background worker started")
        return True
    except Exception as e:
        print(f"❌ Failed to start worker: {e}")
        return False

def main():
    """Main setup function"""
    print("🚀 RAG Quiz System Development Setup")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Check Redis
    if not check_redis():
        sys.exit(1)
    
    # Check environment
    if not check_env_file():
        sys.exit(1)
    
    print("\n🎯 Starting services...")
    print("=" * 30)
    
    # Start server
    if not start_server():
        sys.exit(1)
    
    # Wait a moment for server to start
    time.sleep(2)
    
    # Start worker
    if not start_worker():
        sys.exit(1)
    
    print("\n🎉 Setup complete!")
    print("=" * 20)
    print("📝 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("📊 Queue Info: http://localhost:8000/pdf/queue/info")
    print("\n⏹️  Press Ctrl+C to stop all services")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")

if __name__ == "__main__":
    main() 