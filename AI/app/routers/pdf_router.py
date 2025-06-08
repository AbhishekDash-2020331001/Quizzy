from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import Dict, List
import uuid
import logging
import json
from ..models.schemas import (
    PDFUploadRequest, PDFUploadResponse, PDFUploadQueuedResponse, JobStatusResponse,
    ChatRequest, ChatResponse,
    QuizRequest, QuizResponse, QuizQueuedResponse
)
from ..services.pdf_service import PDFService
from ..services.vector_service import VectorService
from ..services.rag_service import RAGService
from ..services.queue_service import QueueService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/pdf", tags=["PDF"])

# Initialize services
pdf_service = PDFService()
vector_service = VectorService()
rag_service = RAGService()

# Initialize queue service (with error handling)
try:
    queue_service = QueueService()
    queue_enabled = True
    logger.info("Queue service initialized successfully")
except Exception as e:
    logger.warning(f"Queue service initialization failed: {e}")
    logger.warning("Falling back to synchronous processing")
    queue_service = None
    queue_enabled = False

@router.post("/upload", response_model=PDFUploadQueuedResponse)
async def upload_pdf(request: PDFUploadRequest):
    """Queue PDF for processing from uploadthing URL"""
    try:
        pdf_id = str(uuid.uuid4())
        logger.info(f"Queueing PDF upload with ID: {pdf_id} for upload_id: {request.upload_id}")
        
        if not queue_enabled or queue_service is None:
            # Fallback to synchronous processing if queue is not available
            return await _upload_pdf_sync(request, pdf_id)
        
        # Prepare upload data for queue
        upload_data = {
            "uploadthing_url": request.uploadthing_url,
            "upload_id": request.upload_id,
            "pdf_name": request.pdf_name,
            "pdf_id": pdf_id
        }
        
        # Enqueue the processing task
        job_id = queue_service.enqueue_pdf_processing(upload_data)
        
        logger.info(f"Successfully queued PDF {pdf_id} with job ID: {job_id}")
        
        return PDFUploadQueuedResponse(
            job_id=job_id,
            pdf_id=pdf_id,
            message="PDF upload queued for processing",
            upload_id=request.upload_id,
            status="queued"
        )
        
    except ValueError as e:
        logger.error(f"Validation error in PDF upload: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in PDF upload queueing: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to queue PDF: {str(e)}")

async def _upload_pdf_sync(request: PDFUploadRequest, pdf_id: str) -> PDFUploadQueuedResponse:
    """Fallback synchronous PDF processing when queue is not available"""
    try:
        logger.info(f"Processing PDF upload synchronously with ID: {pdf_id}")
        
        # Download PDF
        pdf_content = await pdf_service.download_pdf(request.uploadthing_url)
        
        # Extract text
        pages_text = pdf_service.extract_text_from_pdf(pdf_content)
        
        # Create documents
        documents = pdf_service.create_documents(pages_text, pdf_id, request.pdf_name)
        
        # Add to vector store
        vector_service.add_documents(documents, pdf_id)
        
        logger.info(f"Successfully processed PDF {pdf_id} with {len(pages_text)} pages")
        
        # Return in the queued format but mark as completed
        return PDFUploadQueuedResponse(
            job_id="sync-" + pdf_id,  # Fake job ID for sync processing
            pdf_id=pdf_id,
            message="PDF processed successfully (synchronous mode)",
            upload_id=request.upload_id,
            status="completed"
        )
        
    except Exception as e:
        logger.error(f"Error in synchronous PDF processing: {e}")
        raise

@router.post("/chat", response_model=ChatResponse)
async def chat_with_pdfs(request: ChatRequest):
    """Chat with one or multiple PDFs using RAG"""
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if not request.pdf_ids:
            raise HTTPException(status_code=400, detail="At least one PDF ID is required")
        
        # Validate that all PDFs exist
        for pdf_id in request.pdf_ids:
            pdf_info = vector_service.get_pdf_info(pdf_id)
            if not pdf_info:
                raise HTTPException(status_code=404, detail=f"PDF with ID {pdf_id} not found")
        
        pdf_count = len(request.pdf_ids)
        logger.info(f"Processing chat request for {pdf_count} PDF{'s' if pdf_count > 1 else ''}: {request.pdf_ids}")
        
        response_text, sources = await rag_service.chat_with_pdfs(
            request.pdf_ids,
            request.message,
            request.conversation_history
        )
        
        return ChatResponse(
            response=response_text,
            sources=sources
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat with PDFs {request.pdf_ids}: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.post("/chat/stream")
async def chat_with_pdfs_stream(request: ChatRequest):
    """Stream chat with one or multiple PDFs using RAG"""
    try:
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if not request.pdf_ids:
            raise HTTPException(status_code=400, detail="At least one PDF ID is required")
        
        # Validate that all PDFs exist
        for pdf_id in request.pdf_ids:
            pdf_info = vector_service.get_pdf_info(pdf_id)
            if not pdf_info:
                raise HTTPException(status_code=404, detail=f"PDF with ID {pdf_id} not found")
        
        pdf_count = len(request.pdf_ids)
        logger.info(f"Processing streaming chat request for {pdf_count} PDF{'s' if pdf_count > 1 else ''}: {request.pdf_ids}")
        
        async def generate_stream():
            try:
                async for chunk in rag_service.chat_with_pdfs_stream(
                    request.pdf_ids,
                    request.message,
                    request.conversation_history
                ):
                    # Format as Server-Sent Events
                    yield f"data: {json.dumps(chunk)}\n\n"
                    
            except Exception as e:
                logger.error(f"Error in streaming chat: {e}")
                error_chunk = {
                    "type": "error",
                    "data": f"Streaming error: {str(e)}"
                }
                yield f"data: {json.dumps(error_chunk)}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/plain; charset=utf-8"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up streaming chat with PDFs {request.pdf_ids}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to setup streaming chat: {str(e)}")

@router.get("/job/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Get the status of a queued PDF processing job"""
    try:
        if not queue_enabled or queue_service is None:
            raise HTTPException(status_code=503, detail="Queue service is not available")
        
        status_info = queue_service.get_job_status(job_id)
        if not status_info:
            raise HTTPException(status_code=404, detail="Job not found")
        
        return JobStatusResponse(**status_info)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting job status for {job_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get job status: {str(e)}")

@router.delete("/job/{job_id}")
async def cancel_job(job_id: str):
    """Cancel a queued PDF processing job"""
    try:
        if not queue_enabled or queue_service is None:
            raise HTTPException(status_code=503, detail="Queue service is not available")
        
        success = queue_service.cancel_job(job_id)
        if not success:
            return {"message": f"Job {job_id} could not be cancelled (may already be started or completed)"}
        
        return {"message": f"Job {job_id} cancelled successfully"}
        
    except Exception as e:
        logger.error(f"Error cancelling job {job_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to cancel job: {str(e)}")

@router.get("/queue/info")
async def get_queue_info():
    """Get information about the processing queue"""
    try:
        if not queue_enabled or queue_service is None:
            return {"queue_enabled": False, "message": "Queue service is not available"}
        
        queue_info = queue_service.get_queue_info()
        queue_info["queue_enabled"] = True
        return queue_info
        
    except Exception as e:
        logger.error(f"Error getting queue info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get queue info: {str(e)}")

@router.post("/generate-quiz", response_model=QuizQueuedResponse)
async def generate_quiz(request: QuizRequest):
    """Queue quiz generation based on specified parameters"""
    try:
        # Validate request
        if not request.pdf_ids:
            raise HTTPException(status_code=400, detail="At least one PDF ID is required")
        
        if not request.exam_id:
            raise HTTPException(status_code=400, detail="exam_id is required for queued quiz generation")
        
        if request.quiz_type.value == "topic" and not request.topic:
            raise HTTPException(status_code=400, detail="Topic is required for topic-based quiz")
        
        if request.quiz_type.value == "multi_pdf_topic" and not request.topic:
            raise HTTPException(status_code=400, detail="Topic is required for multi-PDF topic quiz")
        
        if request.quiz_type.value == "page_range":
            if not request.page_start or not request.page_end:
                raise HTTPException(status_code=400, detail="Page start and end are required for page range quiz")
            if request.page_start > request.page_end:
                raise HTTPException(status_code=400, detail="Page start cannot be greater than page end")
            if request.page_start < 1:
                raise HTTPException(status_code=400, detail="Page numbers must be positive")
            
            # Validate that the page range exists in the PDF
            pdf_info = vector_service.get_pdf_info(request.pdf_ids[0])
            if pdf_info:
                total_pages = pdf_info.get("total_pages", 0)
                if isinstance(total_pages, str):
                    try:
                        total_pages = int(total_pages)
                    except ValueError:
                        total_pages = 0
                
                if total_pages > 0 and request.page_end > total_pages:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Page range {request.page_start}-{request.page_end} exceeds PDF length ({total_pages} pages)"
                    )
        
        if request.num_questions < 1 or request.num_questions > 20:
            raise HTTPException(status_code=400, detail="Number of questions must be between 1 and 20")
        
        if not queue_enabled or queue_service is None:
            # Fallback to synchronous processing if queue is not available
            return await _generate_quiz_sync(request)
        
        quiz_id = str(uuid.uuid4())
        logger.info(f"Queueing quiz generation with ID: {quiz_id} for exam_id: {request.exam_id}")
        
        # Prepare quiz data for queue
        quiz_data = {
            "quiz_type": request.quiz_type.value,
            "pdf_ids": request.pdf_ids,
            "topic": request.topic,
            "page_start": request.page_start,
            "page_end": request.page_end,
            "num_questions": request.num_questions,
            "difficulty": request.difficulty,
            "exam_id": request.exam_id,
            "quiz_id": quiz_id
        }
        
        # Enqueue the processing task
        job_id = queue_service.enqueue_quiz_processing(quiz_data)
        
        logger.info(f"Successfully queued quiz generation {quiz_id} with job ID: {job_id}")
        
        return QuizQueuedResponse(
            job_id=job_id,
            quiz_id=quiz_id,
            message="Quiz generation queued for processing",
            exam_id=request.exam_id,
            status="queued"
        )
        
    except ValueError as e:
        logger.error(f"Validation error in quiz generation: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error queueing quiz generation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to queue quiz generation: {str(e)}")

async def _generate_quiz_sync(request: QuizRequest) -> QuizQueuedResponse:
    """Fallback synchronous quiz generation when queue is not available"""
    try:
        quiz_id = str(uuid.uuid4())
        logger.info(f"Processing quiz generation synchronously with ID: {quiz_id}")
        
        questions = await rag_service.generate_quiz(
            quiz_type=request.quiz_type,
            pdf_ids=request.pdf_ids,
            topic=request.topic,
            page_start=request.page_start,
            page_end=request.page_end,
            num_questions=request.num_questions,
            difficulty=request.difficulty
        )
        
        logger.info(f"Successfully generated quiz {quiz_id} with {len(questions)} questions (sync mode)")
        
        # Return in the queued format but mark as completed
        return QuizQueuedResponse(
            job_id="sync-" + quiz_id,  # Fake job ID for sync processing
            quiz_id=quiz_id,
            message="Quiz generated successfully (synchronous mode)",
            exam_id=request.exam_id,
            status="completed"
        )
        
    except Exception as e:
        logger.error(f"Error in synchronous quiz generation: {e}")
        raise

@router.get("/list")
async def list_stored_pdfs():
    """List all stored PDFs"""
    try:
        pdfs = vector_service.list_stored_pdfs()
        return {"pdfs": pdfs, "total": len(pdfs)}
    except Exception as e:
        logger.error(f"Error listing PDFs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to list PDFs: {str(e)}")

@router.get("/{pdf_id}/info")
async def get_pdf_info(pdf_id: str):
    """Get information about a specific PDF"""
    try:
        info = vector_service.get_pdf_info(pdf_id)
        if not info:
            raise HTTPException(status_code=404, detail="PDF not found")
        return info
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting PDF info for {pdf_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get PDF info: {str(e)}")

@router.delete("/{pdf_id}")
async def delete_pdf(pdf_id: str):
    """Delete a PDF and all its associated data"""
    try:
        success = vector_service.delete_pdf(pdf_id)
        if not success:
            raise HTTPException(status_code=404, detail="PDF not found")
        
        logger.info(f"Successfully deleted PDF {pdf_id}")
        return {"message": f"PDF {pdf_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting PDF {pdf_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete PDF: {str(e)}")

@router.get("/health")
async def health_check():
    """Health check endpoint for the PDF service"""
    try:
        # Test vector service connection
        vector_service.list_stored_pdfs()
        return {
            "status": "healthy",
            "services": {
                "vector_service": "operational",
                "pdf_service": "operational",
                "rag_service": "operational"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail=f"Service unhealthy: {str(e)}")

@router.get("/{pdf_id}/debug-pages")
async def debug_pdf_pages(pdf_id: str):
    """Debug endpoint to inspect page structure and document mapping"""
    try:
        # Get basic PDF info
        pdf_info = vector_service.get_pdf_info(pdf_id)
        if not pdf_info:
            raise HTTPException(status_code=404, detail="PDF not found")
        
        # Get all documents for this PDF
        collection_name = f"pdf_{pdf_id}"
        if not vector_service._collection_exists(collection_name):
            raise HTTPException(status_code=404, detail="PDF collection not found")
        
        collection = vector_service.client.get_collection(collection_name)
        results = collection.get(include=['metadatas'])
        
        # Analyze page distribution
        page_distribution = {}
        old_format_count = 0
        new_format_count = 0
        
        for metadata in results.get('metadatas', []):
            # Check format
            if 'page_number' in metadata:
                new_format_count += 1
                page_num = metadata.get('page_number')
                if page_num not in page_distribution:
                    page_distribution[page_num] = 0
                page_distribution[page_num] += 1
            else:
                old_format_count += 1
                pages_str = metadata.get('pages', '')
                if pages_str:
                    try:
                        if ',' in pages_str:
                            pages = [int(p.strip()) for p in pages_str.split(',') if p.strip().isdigit()]
                            for page_num in pages:
                                if page_num not in page_distribution:
                                    page_distribution[page_num] = 0
                                page_distribution[page_num] += 1
                        else:
                            page_num = int(pages_str.strip())
                            if page_num not in page_distribution:
                                page_distribution[page_num] = 0
                            page_distribution[page_num] += 1
                    except ValueError:
                        pass
        
        return {
            "pdf_info": pdf_info,
            "total_documents": len(results.get('metadatas', [])),
            "page_distribution": dict(sorted(page_distribution.items())),
            "metadata_format": {
                "new_format_documents": new_format_count,
                "old_format_documents": old_format_count
            },
            "available_page_range": {
                "min_page": min(page_distribution.keys()) if page_distribution else None,
                "max_page": max(page_distribution.keys()) if page_distribution else None
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error debugging PDF pages for {pdf_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to debug PDF pages: {str(e)}") 