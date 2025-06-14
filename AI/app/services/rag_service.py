from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, AIMessage
from typing import List, Dict, Tuple, Optional, AsyncGenerator
import json
import uuid
import logging
from .vector_service import VectorService
from .pdf_service import PDFService
from ..models.schemas import QuizQuestion, QuizType

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.llm = ChatOpenAI(temperature=0.7, model="gpt-o4-mini", streaming=True)
        self.quiz_llm = ChatOpenAI(temperature=0.3, model="gpt-o4-mini")  # Lower temp for consistent quiz generation
        self.vector_service = VectorService()
        self.pdf_service = PDFService()
        
    async def chat_with_pdf(self, pdf_id: str, message: str, 
                           conversation_history: List[dict]) -> Tuple[str, List[str]]:
        """Chat with PDF using RAG (backward compatibility)"""
        return await self.chat_with_pdfs([pdf_id], message, conversation_history)
    
    async def chat_with_pdfs_stream(self, pdf_ids: List[str], message: str, 
                                   conversation_history: List[dict]) -> AsyncGenerator[Dict, None]:
        """Stream chat with multiple PDFs using RAG"""
        try:
            if not pdf_ids:
                yield {
                    "type": "error", 
                    "data": "No PDFs specified. Please select at least one PDF to chat with."
                }
                return
            
            # First, yield the sources information
            yield {"type": "status", "data": "Searching relevant documents..."}
            
            # Retrieve relevant documents from multiple PDFs
            if len(pdf_ids) == 1:
                # Single PDF - use existing method for better performance
                relevant_docs = self.vector_service.search_documents(message, pdf_ids[0], k=4)
            else:
                # Multiple PDFs - use multi-PDF search
                relevant_docs = self.vector_service.search_multiple_pdfs(message, pdf_ids, k=8)
            
            if not relevant_docs:
                pdf_count = len(pdf_ids)
                pdf_text = "PDF" if pdf_count == 1 else f"{pdf_count} PDFs"
                yield {
                    "type": "error",
                    "data": f"I couldn't find any relevant information in the {pdf_text} to answer your question. Please make sure the PDFs have been uploaded and processed correctly."
                }
                return
            
            context = "\n\n".join([doc.page_content for doc in relevant_docs])
            
            # Create more informative sources that include PDF names when available
            sources = []
            for doc in relevant_docs:
                chunk_id = doc.metadata.get('chunk_id', 'unknown')
                pdf_name = doc.metadata.get('pdf_name', 'Unknown PDF')
                if len(pdf_ids) > 1:
                    sources.append(f"{pdf_name} - Chunk {chunk_id}")
                else:
                    sources.append(f"Chunk {chunk_id}")
            
            # Send sources first
            yield {"type": "sources", "data": sources}
            yield {"type": "status", "data": "Generating response..."}
            
            # Build conversation history
            history_text = ""
            for msg in conversation_history[-5:]:  # Last 5 messages
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                history_text += f"{role.capitalize()}: {content}\n"
            
            # Create appropriate prompt based on number of PDFs
            pdf_count = len(pdf_ids)
            if pdf_count == 1:
                pdf_context_text = "the provided PDF content"
                source_text = "the PDF content"
            else:
                pdf_context_text = f"the provided content from {pdf_count} PDF documents"
                source_text = "the PDF documents"
            
            prompt = ChatPromptTemplate.from_template("""
You are a helpful AI assistant that answers questions based on {pdf_context}. 
You should be informative, accurate, and helpful while staying grounded in the provided context.

Conversation History:
{history}

Relevant Content from PDF Documents:
{context}

User Question: {question}

Instructions:
1. Answer the question based primarily on {source_text} provided
2. If the answer is not fully contained in {source_text}, clearly state what information is missing
3. Be specific and cite relevant parts of the content when possible
4. If you cannot answer the question based on {source_text}, say so clearly
5. Keep your response focused and relevant to the question
6. When drawing from multiple documents, synthesize the information coherently

Answer:""")
            
            formatted_prompt = prompt.format(
                pdf_context=pdf_context_text,
                source_text=source_text,
                history=history_text, 
                context=context, 
                question=message
            )
            
            # Stream the response
            full_response = ""
            async for chunk in self.llm.astream(formatted_prompt):
                if hasattr(chunk, 'content') and chunk.content:
                    full_response += chunk.content
                    yield {"type": "content", "data": chunk.content}
            
            # Send completion signal
            yield {"type": "done", "data": "Response completed"}
            
        except Exception as e:
            logger.error(f"Error in chat_with_pdfs_stream: {e}")
            yield {
                "type": "error", 
                "data": f"I'm sorry, I encountered an error while processing your question: {str(e)}"
            }
    
    async def chat_with_pdfs(self, pdf_ids: List[str], message: str, 
                            conversation_history: List[dict]) -> Tuple[str, List[str]]:
        """Chat with multiple PDFs using RAG"""
        try:
            if not pdf_ids:
                return "No PDFs specified. Please select at least one PDF to chat with.", []
            
            # Retrieve relevant documents from multiple PDFs
            if len(pdf_ids) == 1:
                # Single PDF - use existing method for better performance
                relevant_docs = self.vector_service.search_documents(message, pdf_ids[0], k=4)
            else:
                # Multiple PDFs - use multi-PDF search
                relevant_docs = self.vector_service.search_multiple_pdfs(message, pdf_ids, k=8)
            
            if not relevant_docs:
                pdf_count = len(pdf_ids)
                pdf_text = "PDF" if pdf_count == 1 else f"{pdf_count} PDFs"
                return f"I couldn't find any relevant information in the {pdf_text} to answer your question. Please make sure the PDFs have been uploaded and processed correctly.", []
            
            context = "\n\n".join([doc.page_content for doc in relevant_docs])
            
            # Create more informative sources that include PDF names when available
            sources = []
            for doc in relevant_docs:
                chunk_id = doc.metadata.get('chunk_id', 'unknown')
                pdf_name = doc.metadata.get('pdf_name', 'Unknown PDF')
                if len(pdf_ids) > 1:
                    sources.append(f"{pdf_name} - Chunk {chunk_id}")
                else:
                    sources.append(f"Chunk {chunk_id}")
            
            # Build conversation history
            history_text = ""
            for msg in conversation_history[-5:]:  # Last 5 messages
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                history_text += f"{role.capitalize()}: {content}\n"
            
            # Create appropriate prompt based on number of PDFs
            pdf_count = len(pdf_ids)
            if pdf_count == 1:
                pdf_context_text = "the provided PDF content"
                source_text = "the PDF content"
            else:
                pdf_context_text = f"the provided content from {pdf_count} PDF documents"
                source_text = "the PDF documents"
            
            prompt = ChatPromptTemplate.from_template("""
You are a helpful AI assistant that answers questions based on {pdf_context}. 
You should be informative, accurate, and helpful while staying grounded in the provided context.

Conversation History:
{history}

Relevant Content from PDF Documents:
{context}

User Question: {question}

Instructions:
1. Answer the question based primarily on {source_text} provided
2. If the answer is not fully contained in {source_text}, clearly state what information is missing
3. Be specific and cite relevant parts of the content when possible
4. If you cannot answer the question based on {source_text}, say so clearly
5. Keep your response focused and relevant to the question
6. When drawing from multiple documents, synthesize the information coherently

Answer:""")
            
            response = await self.llm.ainvoke(
                prompt.format(
                    pdf_context=pdf_context_text,
                    source_text=source_text,
                    history=history_text, 
                    context=context, 
                    question=message
                )
            )
            
            return response.content, sources
            
        except Exception as e:
            logger.error(f"Error in chat_with_pdfs: {e}")
            return f"I'm sorry, I encountered an error while processing your question: {str(e)}", []
    
    async def generate_quiz(self, quiz_type: QuizType, pdf_ids: List[str],
                           topic: str = None, page_start: int = None,
                           page_end: int = None, num_questions: int = 5,
                           difficulty: str = "medium") -> List[QuizQuestion]:
        """Generate quiz based on the specified parameters"""
        try:
            if quiz_type == QuizType.MULTI_PDF_TOPIC:
                context = await self._get_multi_pdf_context(pdf_ids, topic)
                quiz_prompt = self._create_multi_pdf_quiz_prompt(context, topic, num_questions, difficulty)
            elif quiz_type == QuizType.TOPIC:
                context = await self._get_topic_context(pdf_ids[0], topic)
                quiz_prompt = self._create_topic_quiz_prompt(context, topic, num_questions, difficulty)
            else:  # PAGE_RANGE
                context = await self._get_page_range_context(pdf_ids[0], page_start, page_end)
                quiz_prompt = self._create_page_range_quiz_prompt(context, page_start, page_end, num_questions, difficulty)
            
            if not context.strip():
                raise ValueError("No relevant content found for quiz generation")
            
            response = await self.quiz_llm.ainvoke(quiz_prompt)
            
            try:
                # Try to parse as JSON
                quiz_data = json.loads(response.content)
                questions = [QuizQuestion(**q) for q in quiz_data.get("questions", [])]
                
                if not questions:
                    raise ValueError("No questions generated")
                    
                return questions
                
            except (json.JSONDecodeError, KeyError, TypeError) as e:
                logger.warning(f"Failed to parse JSON response, trying fallback: {e}")
                # Fallback to text parsing
                return self._parse_fallback_quiz(response.content, num_questions)
                
        except Exception as e:
            logger.error(f"Error generating quiz: {e}")
            raise Exception(f"Failed to generate quiz: {str(e)}")
    
    async def _get_multi_pdf_context(self, pdf_ids: List[str], topic: str) -> str:
        """Get context from multiple PDFs for a specific topic"""
        relevant_docs = self.vector_service.search_multiple_pdfs(topic, pdf_ids, k=12)
        if not relevant_docs:
            return ""
        return "\n\n".join([doc.page_content for doc in relevant_docs])
    
    async def _get_topic_context(self, pdf_id: str, topic: str) -> str:
        """Get context for a specific topic from one PDF"""
        relevant_docs = self.vector_service.search_documents(topic, pdf_id, k=8)
        if not relevant_docs:
            return ""
        return "\n\n".join([doc.page_content for doc in relevant_docs])
    
    async def _get_page_range_context(self, pdf_id: str, page_start: int, page_end: int) -> str:
        """Get context from specific page range"""
        try:
            # First try to get page range documents that strictly belong to those pages
            filtered_docs = self._get_documents_by_page_range(pdf_id, page_start, page_end)
            
            if not filtered_docs:
                logger.warning(f"No documents found for page range {page_start}-{page_end} in PDF {pdf_id}")
                raise ValueError(f"No content found in pages {page_start}-{page_end}")
            
            # Sort documents by page number to maintain logical order
            def get_min_page(doc):
                # Use the new page_number field if available
                if 'page_number' in doc.metadata:
                    try:
                        return int(doc.metadata['page_number'])
                    except (ValueError, TypeError):
                        pass
                
                # Fallback to old pages field
                doc_pages_str = doc.metadata.get('pages', '')
                try:
                    if doc_pages_str:
                        if ',' in doc_pages_str:
                            doc_pages = [int(p.strip()) for p in doc_pages_str.split(',') if p.strip().isdigit()]
                            return min(doc_pages) if doc_pages else 999
                        else:
                            return int(doc_pages_str.strip())
                    return 999
                except (ValueError, AttributeError):
                    return 999
            
            filtered_docs.sort(key=get_min_page)
            
            logger.info(f"Found {len(filtered_docs)} documents within page range {page_start}-{page_end}")
            return "\n\n".join([doc.page_content for doc in filtered_docs])
            
        except ValueError:
            raise  # Re-raise ValueError to maintain error handling in the calling function
        except Exception as e:
            logger.error(f"Error getting page range context: {e}")
            raise ValueError(f"Failed to retrieve content from pages {page_start}-{page_end}")
    
    def _get_documents_by_page_range(self, pdf_id: str, page_start: int, page_end: int) -> List:
        """Get all documents that overlap with the specified page range"""
        try:
            collection_name = f"pdf_{pdf_id}"
            
            # Check if collection exists
            if not self.vector_service._collection_exists(collection_name):
                logger.warning(f"Collection {collection_name} does not exist")
                return []
            
            # Get all documents from the collection using the vector service's client
            collection = self.vector_service.client.get_collection(collection_name)
            
            # Get all documents with their metadata
            results = collection.get(include=['documents', 'metadatas'])
            
            if not results['documents']:
                return []
            
            filtered_docs = []
            for i, (doc_content, metadata) in enumerate(zip(results['documents'], results['metadatas'])):
                # Check both old and new metadata formats for backward compatibility
                page_number = None
                
                # New format: direct page_number field
                if 'page_number' in metadata:
                    try:
                        page_number = int(metadata['page_number'])
                    except (ValueError, TypeError):
                        pass
                
                # Fallback to old format: comma-separated pages string
                if page_number is None:
                    doc_pages_str = metadata.get('pages', '')
                    try:
                        if doc_pages_str:
                            # Handle both single page numbers and comma-separated lists
                            if ',' in doc_pages_str:
                                doc_pages = [int(p.strip()) for p in doc_pages_str.split(',') if p.strip().isdigit()]
                                # Use the first page for backward compatibility
                                page_number = doc_pages[0] if doc_pages else None
                            else:
                                page_number = int(doc_pages_str.strip())
                    except (ValueError, AttributeError):
                        pass
                
                # Check if the document's page falls within the requested range
                if page_number is not None and page_start <= page_number <= page_end:
                    # Create Document object
                    from langchain.schema import Document
                    doc = Document(
                        page_content=doc_content,
                        metadata=metadata
                    )
                    filtered_docs.append(doc)
                    logger.debug(f"Including document from page {page_number}")
            
            logger.info(f"Found {len(filtered_docs)} documents in page range {page_start}-{page_end}")
            return filtered_docs
            
        except Exception as e:
            logger.error(f"Error retrieving documents by page range: {e}")
            return []
    
    def _create_topic_quiz_prompt(self, context: str, topic: str, 
                                 num_questions: int, difficulty: str) -> str:
        return f"""
Create a {difficulty} level quiz with {num_questions} multiple choice questions about "{topic}" based on the following content. Multiple topics are colon separated. Make sure you create questions for all the topics if there are multiple topics. You must return the response in the given json format.

Content:
{context}

Requirements:
1. Each question should have exactly 4 options (A, B, C, D)
2. Questions should test understanding of the content, not just memorization
3. For {difficulty} difficulty: {"Make questions straightforward and factual" if difficulty == "easy" else "Include some analytical and application-based questions" if difficulty == "medium" else "Focus on complex analysis and synthesis"}
4. If you can include mathemetical questions then try to include them more and more.
5. Questions should be based on the content provided and not on the user's knowledge or experience. Only include a question if you think it is answerable based on the knowledge gained from the content.
6. It is preferred that you make mathematical and analytical questions which are not directly in the content provided but the knowledge gained from the content should be enough to answer the questions.
7. If a question is theoretical then it must be directly from the provided content.
8. Ensure all information needed to answer is in the provided content
9. Question or answer should not include any sort of graphical illustration.
10. Provide clear explanations for correct answers. The explanation itself should be enough to understand the full concept behind the question.
11. DO NOT include any text outside the JSON structure
12. DO NOT include any comments or explanations in the response
13. The response must be parseable JSON


Return the response in this exact JSON format:
{{
    "questions": [
        {{
            "question": "Question text here?",
            "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
            "correct_answer": "A) Option 1",
            "explanation": "Brief explanation of why this is correct and why others are wrong"
        }}
    ]
}}

Generate {num_questions} questions following this format exactly. Do not add any additional text or explanations outside the JSON format.
"""
    
    def _create_page_range_quiz_prompt(self, context: str, page_start: int, page_end: int,
                                      num_questions: int, difficulty: str) -> str:
        return f"""
Create a {difficulty} level quiz with {num_questions} multiple choice questions based on content from pages {page_start} to {page_end}. You must return the response in the given json format.
Content:
{context}

Requirements:
1. Each question should have exactly 4 options (A, B, C, D)
2. Questions should focus specifically on content from the specified page range
3. For {difficulty} difficulty: {"Make questions straightforward and factual" if difficulty == "easy" else "Include some analytical and application-based questions" if difficulty == "medium" else "Focus on complex analysis and synthesis"}
4. If you can include mathemetical questions then try to include them more and more.
5. Questions should be based on the content provided and not on the user's knowledge or experience. Only include a question if you think it is answerable based on the knowledge gained from the content.
6. It is preferred that you make mathematical and analytical questions which are not directly in the content provided but the knowledge gained from the content should be enough to answer the questions.
7. If a question is theoretical then it must be directly from the provided content.
8. Question or answer should not include any sort of graphical illustration.
9. Provide clear explanations for correct answers. The explanation itself should be enough to understand the full concept behind the question
10. Reference the page range when relevant
11. DO NOT include any text outside the JSON structure
12. DO NOT include any comments or explanations in the response
13. The response must be parseable JSON


Return the response in this exact JSON format:
{{
    "questions": [
        {{
            "question": "Question text here?",
            "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
            "correct_answer": "A) Option 1",
            "explanation": "Brief explanation of why this is correct (from pages {page_start}-{page_end})"
        }}
    ]
}}

Generate {num_questions} questions following this format exactly. Do not add any additional text or explanations outside the JSON format.
"""
    
    def _create_multi_pdf_quiz_prompt(self, context: str, topic: str,
                                     num_questions: int, difficulty: str) -> str:
        return f"""
Create a {difficulty} level quiz with {num_questions} multiple choice questions about "{topic}" based on content from multiple PDF documents. Multiple topics are colon separated. Make sure you create questions for all the topics if there are multiple topics. You must return the response in the given json format.
Content from multiple sources:
{context}

Requirements:
1. Each question should have exactly 4 options (A, B, C, D)
2. Questions should synthesize information across the different sources
3. For {difficulty} difficulty: {"Make questions straightforward and factual" if difficulty == "easy" else "Include some comparative and analytical questions" if difficulty == "medium" else "Focus on synthesis and complex analysis across sources"}
4. If you can include mathemetical questions then try to include them more and more.
5. Questions should be based on the content provided and not on the user's knowledge or experience. Only include a question if you think it is answerable based on the knowledge gained from the content.
6. It is preferred that you make mathematical and analytical questions which are not directly in the content provided but the knowledge gained from the content should be enough to answer the questions.
7. If a question is theoretical then it must be directly from the provided content.
8. Question or answer should not include any sort of graphical illustration.
9. Ensure all information needed to answer is in the provided content
10. Provide clear explanations for correct answers. The explanation itself should be enough to understand the full concept behind the question
11. When possible, note if information comes from multiple sources
12. DO NOT include any text outside the JSON structure
13. DO NOT include any comments or explanations in the response
14. The response must be parseable JSON

Return the response in this exact JSON format:
{{
    "questions": [
        {{
            "question": "Question text here?",
            "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
            "correct_answer": "A) Option 1",
            "explanation": "Brief explanation of why this is correct, drawing from the multiple sources"
        }}
    ]
}}

Generate {num_questions} questions following this format exactly. Do not add any additional text or explanations outside the JSON format. Don not include other topics or unrelated content in the questions.
"""
    
    def _parse_fallback_quiz(self, response_content: str, num_questions: int) -> List[QuizQuestion]:
        """Fallback parser for when JSON parsing fails"""
        try:
            questions = []
            lines = response_content.strip().split('\n')
            current_question = None
            current_options = []
            current_answer = None
            current_explanation = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                # Look for question patterns
                if line.endswith('?') and not line.startswith(('A)', 'B)', 'C)', 'D)')):
                    if current_question and current_options and current_answer:
                        questions.append(QuizQuestion(
                            question=current_question,
                            options=current_options,
                            correct_answer=current_answer,
                            explanation=current_explanation or "No explanation provided"
                        ))
                    
                    current_question = line
                    current_options = []
                    current_answer = None
                    current_explanation = None
                    
                # Look for options
                elif line.startswith(('A)', 'B)', 'C)', 'D)')):
                    current_options.append(line)
                    
                # Look for correct answer
                elif line.lower().startswith(('correct:', 'answer:', 'correct answer:')):
                    current_answer = line.split(':', 1)[1].strip()
                    
                # Look for explanation
                elif line.lower().startswith(('explanation:', 'because:')):
                    current_explanation = line.split(':', 1)[1].strip()
            
            # Add the last question
            if current_question and current_options and current_answer:
                questions.append(QuizQuestion(
                    question=current_question,
                    options=current_options,
                    correct_answer=current_answer,
                    explanation=current_explanation or "No explanation provided"
                ))
            
            # If we couldn't parse properly, create a simple fallback
            if not questions:
                questions = [QuizQuestion(
                    question="What is the main topic discussed in the provided content?",
                    options=["A) Topic A", "B) Topic B", "C) Topic C", "D) Topic D"],
                    correct_answer="A) Topic A",
                    explanation="This is a fallback question due to parsing issues."
                )]
            
            return questions[:num_questions]
             
        except Exception as e:
            logger.error(f"Fallback parsing failed: {e}")
            # Return a single fallback question
            return [QuizQuestion(
                question="What information can be found in the provided content?",
                options=["A) Various topics", "B) No information", "C) Specific details", "D) General concepts"],
                correct_answer="A) Various topics",
                explanation="This is a fallback question due to processing issues."
            )] 