import asyncio
import httpx
import uuid
import logging
from typing import Dict, Any, Optional
from .pdf_service import PDFService
from .vector_service import VectorService
import os

logger = logging.getLogger(__name__)

def process_pdf_upload(upload_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Background worker function to process PDF upload
    
    Args:
        upload_data: Dictionary containing:
            - uploadthing_url: str
            - upload_id: int  
            - pdf_name: Optional[str]
            - pdf_id: str
    
    Returns:
        Dict containing processing results
    """
    try:
        logger.info(f"Starting PDF processing for upload_id {upload_data.get('upload_id')}")
        
        # Initialize services
        pdf_service = PDFService()
        vector_service = VectorService()
        
        # Extract data
        uploadthing_url = upload_data["uploadthing_url"]
        upload_id = upload_data["upload_id"]
        pdf_name = upload_data.get("pdf_name")
        pdf_id = upload_data["pdf_id"]
        
        # Run the async processing in a synchronous context
        result = asyncio.run(_process_pdf_async(
            pdf_service=pdf_service,
            vector_service=vector_service,
            uploadthing_url=uploadthing_url,
            upload_id=upload_id,
            pdf_name=pdf_name,
            pdf_id=pdf_id
        ))
        
        logger.info(f"Successfully processed PDF upload_id {upload_id}")
        return result
        
    except Exception as e:
        logger.error(f"Error processing PDF upload_id {upload_data.get('upload_id')}: {e}")
        
        # Send failure webhook
        try:
            asyncio.run(_send_webhook_notification(upload_data.get("upload_id"), False, str(e)))
        except Exception as webhook_error:
            logger.error(f"Failed to send failure webhook: {webhook_error}")
        
        raise

async def _process_pdf_async(
    pdf_service: PDFService,
    vector_service: VectorService, 
    uploadthing_url: str,
    upload_id: int,
    pdf_name: Optional[str],
    pdf_id: str
) -> Dict[str, Any]:
    """
    Async function to handle the actual PDF processing
    """
    try:
        # Download PDF
        logger.info(f"Downloading PDF from {uploadthing_url}")
        pdf_content = await pdf_service.download_pdf(uploadthing_url)
        
        # Extract text
        logger.info(f"Extracting text from PDF {pdf_id}")
        pages_text = pdf_service.extract_text_from_pdf(pdf_content)
        
        # Create documents
        logger.info(f"Creating documents for PDF {pdf_id}")
        documents = pdf_service.create_documents(pages_text, pdf_id, pdf_name)
        
        # Add to vector store
        logger.info(f"Adding documents to vector store for PDF {pdf_id}")
        vector_service.add_documents(documents, pdf_id)
        
        result = {
            "pdf_id": pdf_id,
            "upload_id": upload_id,
            "total_pages": len(pages_text),
            "pdf_name": pdf_name,
            "status": "success",
            "message": "PDF processed successfully"
        }
        
        # Send success webhook
        await _send_webhook_notification(upload_id, True, None, result)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in async PDF processing: {e}")
        raise

async def _send_webhook_notification(
    upload_id: int, 
    success: bool, 
    error_message: Optional[str] = None,
    result_data: Optional[Dict[str, Any]] = None
) -> None:
    """
    Send webhook notification to the configured endpoint
    
    Args:
        upload_id: The upload ID
        success: Whether the processing was successful
        error_message: Error message if failed
        result_data: Processing result data if successful
    """
    try:
        webhook_url = f"http://localhost:8000/webhook/upload-processed/{upload_id}"
        
        # Prepare webhook payload
        payload = {
            "upload_id": upload_id,
            "success": success,
            "timestamp": _get_current_timestamp()
        }
        
        if success and result_data:
            payload.update({
                "pdf_id": result_data["pdf_id"],
                "total_pages": result_data["total_pages"],
                "pdf_name": result_data["pdf_name"],
                "message": result_data["message"]
            })
        else:
            payload["error"] = error_message
        
        # Send webhook with timeout and retries
        timeout = httpx.Timeout(30.0)  # 30 seconds timeout
        
        async with httpx.AsyncClient(timeout=timeout) as client:
            logger.info(f"Sending webhook notification to {webhook_url}")
            
            # Try sending webhook with retries
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    response = await client.post(
                        webhook_url,
                        json=payload,
                        headers={"Content-Type": "application/json"}
                    )
                    
                    if response.status_code == 200:
                        logger.info(f"Successfully sent webhook for upload_id {upload_id}")
                        return
                    else:
                        logger.warning(f"Webhook returned status {response.status_code} for upload_id {upload_id}")
                        
                except httpx.TimeoutException:
                    logger.warning(f"Webhook timeout for upload_id {upload_id} (attempt {attempt + 1})")
                except httpx.ConnectError:
                    logger.warning(f"Webhook connection error for upload_id {upload_id} (attempt {attempt + 1})")
                except Exception as e:
                    logger.warning(f"Webhook error for upload_id {upload_id} (attempt {attempt + 1}): {e}")
                
                # Wait before retry (exponential backoff)
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # 1s, 2s, 4s
                    await asyncio.sleep(wait_time)
            
            logger.error(f"Failed to send webhook after {max_retries} attempts for upload_id {upload_id}")
            
    except Exception as e:
        logger.error(f"Error sending webhook notification for upload_id {upload_id}: {e}")

def _get_current_timestamp() -> str:
    """Get current timestamp in ISO format"""
    from datetime import datetime
    return datetime.utcnow().isoformat() + "Z" 