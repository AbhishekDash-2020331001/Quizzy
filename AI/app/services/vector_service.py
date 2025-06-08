import chromadb
from chromadb.config import Settings
from langchain.vectorstores import Chroma
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.schema import Document
from typing import List, Dict, Optional
import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        if not self.embeddings:
            raise ValueError("OpenAI embeddings not initialized. Check your API key.")
        # Set up persistent storage directory
        # Default to "./chroma_db" if CHROMA_DB_PATH is not set
        self.persist_directory = os.getenv("CHROMA_DB_PATH", "./chroma_db")
        
        # Ensure the directory exists
        os.makedirs(self.persist_directory, exist_ok=True)
        
        # Initialize Chroma client
        try:
            self.client = chromadb.PersistentClient(path=self.persist_directory)
            logger.info(f"Initialized Chroma client with persist directory: {self.persist_directory}")
        except Exception as e:
            logger.error(f"Failed to initialize Chroma client: {e}")
            raise
        
    def add_documents(self, documents: List[Document], pdf_id: str) -> bool:
        """Add documents to vector store for a specific PDF"""
        try:
            collection_name = f"pdf_{pdf_id}"
            logger.info(f"Adding {len(documents)} documents to collection: {collection_name}")
            
            vectorstore = Chroma(
                collection_name=collection_name,
                embedding_function=self.embeddings,
                persist_directory=self.persist_directory
            )
            
            # Add documents in batches to avoid memory issues
            batch_size = 10
            for i in range(0, len(documents), batch_size):
                batch = documents[i:i + batch_size]
                vectorstore.add_documents(batch)
            
            vectorstore.persist()
            logger.info(f"Successfully added documents to collection: {collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add documents for PDF {pdf_id}: {e}")
            raise Exception(f"Failed to store documents: {e}")
        
    def search_documents(self, query: str, pdf_id: str, k: int = 4) -> List[Document]:
        """Search for relevant documents in a specific PDF"""
        try:
            collection_name = f"pdf_{pdf_id}"
            
            # Check if collection exists
            if not self._collection_exists(collection_name):
                logger.warning(f"Collection {collection_name} does not exist")
                return []
            
            vectorstore = Chroma(
                collection_name=collection_name,
                embedding_function=self.embeddings,
                persist_directory=self.persist_directory
            )
            
            docs = vectorstore.similarity_search(query, k=k)
            logger.info(f"Found {len(docs)} relevant documents for query in PDF {pdf_id}")
            return docs
            
        except Exception as e:
            logger.error(f"Failed to search documents for PDF {pdf_id}: {e}")
            return []
    
    def search_multiple_pdfs(self, query: str, pdf_ids: List[str], k: int = 4) -> List[Document]:
        """Search across multiple PDFs"""
        all_docs = []
        docs_per_pdf = max(1, k // len(pdf_ids)) if pdf_ids else k
        
        for pdf_id in pdf_ids:
            try:
                docs = self.search_documents(query, pdf_id, k=docs_per_pdf + 1)
                all_docs.extend(docs)
            except Exception as e:
                logger.warning(f"Failed to search PDF {pdf_id}: {e}")
                continue
        
        # Sort by relevance and limit to k documents
        # Note: This is a simple approach; more sophisticated ranking could be implemented
        return all_docs[:k]
    
    def get_pdf_info(self, pdf_id: str) -> Optional[Dict]:
        """Get information about a stored PDF"""
        try:
            collection_name = f"pdf_{pdf_id}"
            
            if not self._collection_exists(collection_name):
                return None
                
            collection = self.client.get_collection(collection_name)
            count = collection.count()
            
            # Get a sample document to extract metadata
            results = collection.get(limit=1, include=['metadatas'])
            metadata = results['metadatas'][0] if results['metadatas'] else {}
            
            return {
                "pdf_id": pdf_id,
                "document_count": count,
                "pdf_name": metadata.get("pdf_name", f"document_{pdf_id}"),
                "total_pages": metadata.get("total_pages", "unknown")
            }
            
        except Exception as e:
            logger.error(f"Failed to get PDF info for {pdf_id}: {e}")
            return None
    
    def delete_pdf(self, pdf_id: str) -> bool:
        """Delete all documents for a specific PDF"""
        try:
            collection_name = f"pdf_{pdf_id}"
            
            if self._collection_exists(collection_name):
                self.client.delete_collection(collection_name)
                logger.info(f"Deleted collection: {collection_name}")
                return True
            else:
                logger.warning(f"Collection {collection_name} does not exist")
                return False
                
        except Exception as e:
            logger.error(f"Failed to delete PDF {pdf_id}: {e}")
            return False
    
    def list_stored_pdfs(self) -> List[Dict]:
        """List all stored PDFs"""
        try:
            collections = self.client.list_collections()
            pdf_info = []
            
            for collection in collections:
                if collection.name.startswith("pdf_"):
                    pdf_id = collection.name[4:]  # Remove "pdf_" prefix
                    info = self.get_pdf_info(pdf_id)
                    if info:
                        pdf_info.append(info)
            
            return pdf_info
            
        except Exception as e:
            logger.error(f"Failed to list stored PDFs: {e}")
            return []
    
    def _collection_exists(self, collection_name: str) -> bool:
        """Check if a collection exists"""
        try:
            collections = self.client.list_collections()
            return any(col.name == collection_name for col in collections)
        except Exception as e:
            logger.error(f"Failed to check if collection exists: {e}")
            return False 