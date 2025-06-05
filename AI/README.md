# RAG Quiz System

A powerful RAG-based system for PDF interaction and quiz generation using FastAPI, OpenAI, LangChain, and Chroma vector database. Upload PDFs via uploadthing URLs, chat with them, and generate customized quizzes.

## Features

- **PDF Processing**: Upload PDFs from uploadthing URLs and extract text content
- **RAG Chat**: Interactive conversations with PDF content using retrieval-augmented generation
- **Quiz Generation**: Three types of quiz generation:
  1. **Page Range Quiz**: Generate quizzes from specific page ranges
  2. **Topic Quiz**: Generate quizzes focused on specific topics within a PDF
  3. **Multi-PDF Topic Quiz**: Generate quizzes from topics across multiple PDFs
- **Vector Search**: Efficient semantic search using Chroma vector database
- **OpenAI Integration**: Powered by GPT-3.5-turbo for intelligent responses and quiz generation