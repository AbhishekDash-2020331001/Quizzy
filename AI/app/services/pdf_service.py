import requests
import PyPDF2
from io import BytesIO
from typing import List, Dict
import uuid
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
import logging

logger = logging.getLogger(__name__)

class PDFService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
    
    async def download_pdf(self, uploadthing_url: str) -> bytes:
        """Download PDF from uploadthing URL"""
        try:
            logger.info(f"Downloading PDF from: {uploadthing_url}")
            response = requests.get(uploadthing_url, timeout=30)
            response.raise_for_status()
            
            # Verify it's a PDF by checking content type or magic bytes
            content_type = response.headers.get('content-type', '')
            if 'application/pdf' not in content_type:
                # Check magic bytes for PDF
                if not response.content.startswith(b'%PDF'):
                    raise ValueError("URL does not point to a valid PDF file")
            
            return response.content
        except requests.RequestException as e:
            logger.error(f"Failed to download PDF: {e}")
            raise Exception(f"Failed to download PDF from URL: {e}")
        except Exception as e:
            logger.error(f"Error processing PDF download: {e}")
            raise
    
    def extract_text_from_pdf(self, pdf_content: bytes) -> Dict[int, str]:
        """Extract text from PDF, returning page-wise content"""
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_content))
            pages_text = {}
            
            for page_num, page in enumerate(pdf_reader.pages, 1):
                try:
                    text = page.extract_text()
                    if text.strip():  # Only add pages with content
                        pages_text[page_num] = text
                    else:
                        pages_text[page_num] = f"[Page {page_num} - No extractable text]"
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_num}: {e}")
                    pages_text[page_num] = f"[Page {page_num} - Text extraction failed]"
            
            if not pages_text:
                raise ValueError("No text could be extracted from the PDF")
            
            return pages_text
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {e}")
            raise Exception(f"Failed to process PDF: {e}")
    
    def get_page_range_text(self, pages_text: Dict[int, str], 
                           start_page: int, end_page: int) -> str:
        """Get text from specific page range"""
        if start_page < 1 or end_page < start_page:
            raise ValueError("Invalid page range")
        
        text = ""
        found_pages = 0
        for page_num in range(start_page, end_page + 1):
            if page_num in pages_text:
                text += f"\n--- Page {page_num} ---\n{pages_text[page_num]}"
                found_pages += 1
        
        if found_pages == 0:
            raise ValueError(f"No content found in page range {start_page}-{end_page}")
        
        return text
    
    def create_documents(self, pages_text: Dict[int, str], 
                        pdf_id: str, pdf_name: str = None) -> List[Document]:
        """Create LangChain documents with accurate page metadata"""
        documents = []
        
        if not pages_text:
            raise ValueError("No text content to create documents from")
        
        # Process each page separately to maintain accurate page mapping
        for page_num, page_text in pages_text.items():
            if not page_text.strip():
                continue
                
            # Chunk this page's text
            page_chunks = self.text_splitter.split_text(page_text)
            
            for i, chunk in enumerate(page_chunks):
                doc = Document(
                    page_content=chunk,
                    metadata={
                        "pdf_id": pdf_id,
                        "chunk_id": f"{page_num}_{i}",  # Include page number in chunk ID
                        "source": "pdf",
                        "pdf_name": pdf_name or f"document_{pdf_id}",
                        "pages": str(page_num),  # Exact page number for this chunk
                        "page_number": page_num,  # Additional field for easier filtering
                        "total_pages": len(pages_text),
                        "chunk_index_on_page": i
                    }
                )
                documents.append(doc)
        
        logger.info(f"Created {len(documents)} documents from {len(pages_text)} pages")
        return documents
    
    def create_page_range_documents(self, pages_text: Dict[int, str], 
                                  pdf_id: str, page_start: int, page_end: int,
                                  pdf_name: str = None) -> List[Document]:
        """Create documents specifically for a page range"""
        if page_start < 1 or page_end < page_start:
            raise ValueError("Invalid page range")
            
        # Filter pages to only include the requested range
        filtered_pages = {
            page_num: text for page_num, text in pages_text.items()
            if page_start <= page_num <= page_end
        }
        
        if not filtered_pages:
            raise ValueError(f"No content found in page range {page_start}-{page_end}")
            
        return self.create_documents(filtered_pages, pdf_id, pdf_name)

    def _find_chunk_pages(self, chunk: str, pages_text: Dict[int, str]) -> List[int]:
        """Try to determine which pages a chunk might belong to (legacy method)"""
        # This method is kept for backward compatibility but is no longer used
        # in the new create_documents implementation
        relevant_pages = []
        chunk_words = set(chunk.lower().split())
        
        for page_num, page_text in pages_text.items():
            page_words = set(page_text.lower().split())
            # If chunk shares significant words with page, consider it relevant
            common_words = chunk_words.intersection(page_words)
            if len(common_words) > len(chunk_words) * 0.3:  # 30% overlap threshold
                relevant_pages.append(page_num)
        
        return relevant_pages or [1]  # Default to page 1 if no match found
    
    def get_page_info_for_debugging(self, pages_text: Dict[int, str]) -> Dict:
        """Get debugging information about page structure"""
        page_info = {}
        total_chars = 0
        
        for page_num, text in pages_text.items():
            char_count = len(text)
            word_count = len(text.split())
            total_chars += char_count
            
            page_info[page_num] = {
                "char_count": char_count,
                "word_count": word_count,
                "has_content": bool(text.strip()),
                "preview": text[:100] + "..." if len(text) > 100 else text
            }
        
        return {
            "total_pages": len(pages_text),
            "total_characters": total_chars,
            "pages": page_info
        } 