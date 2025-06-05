#!/usr/bin/env python3
"""
Quick setup script for RAG Quiz System
This script helps you set up the environment and verify installation.
"""

import os
import sys
import subprocess
import venv
from pathlib import Path

def create_env_file():
    """Create .env file with template"""
    env_content = """# Copy this file to .env and replace with your actual values

# OpenAI API Key - Get this from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Vector Database Settings
CHROMA_DB_PATH=./chroma_db

# Logging Level (DEBUG, INFO, WARNING, ERROR)
LOG_LEVEL=INFO

# Server Settings (optional)
HOST=0.0.0.0
PORT=8000
"""
    
    if not os.path.exists(".env"):
        with open(".env", "w") as f:
            f.write(env_content)
        print("✅ Created .env file template")
        print("⚠️  Please edit .env and add your actual OpenAI API key!")
        return False
    else:
        print("✅ .env file already exists")
        return True

def install_dependencies():
    """Install required dependencies"""
    print("📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} is not compatible")
        print("   Please install Python 3.8 or higher")
        return False

def create_directories():
    """Create necessary directories"""
    directories = ["chroma_db", "logs"]
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    print("✅ Created necessary directories")

def main():
    """Main setup function"""
    print("🚀 RAG Quiz System Setup")
    print("=" * 40)
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Create directories
    create_directories()
    
    # Install dependencies
    if not install_dependencies():
        return False
    
    # Create .env file
    env_exists = create_env_file()
    
    print("\n" + "=" * 40)
    print("🎉 Setup completed!")
    
    if not env_exists:
        print("\n⚠️  IMPORTANT: Edit the .env file and add your OpenAI API key")
        print("   1. Get your API key from: https://platform.openai.com/api-keys")
        print("   2. Replace 'your_openai_api_key_here' with your actual key")
    
    print("\n🚀 To start the server:")
    print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    
    print("\n🧪 To test the system:")
    print("   python test_system.py")
    
    print("\n📚 API Documentation:")
    print("   http://localhost:8000/docs")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 