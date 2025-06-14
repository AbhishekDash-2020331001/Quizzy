from datetime import datetime, timezone, timedelta
from . import schemas
from . import models
from fastapi import FastAPI, Depends, HTTPException, status, Path, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from passlib.context import CryptContext
from .database import Base, engine, SessionLocal
from .auth_bearer import JWTBearer
from .utils import create_access_token, create_refresh_token, verify_password, get_hashed_password
from jose import JWTError, jwt
from typing import List
import os
import httpx
import asyncio
import stripe
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from zoneinfo import ZoneInfo  # For Python 3.9+, else use pytz

bd_tz = ZoneInfo("Asia/Dhaka")

# Define UTC+6 timezone (Bangladesh Standard Time)
UTC_PLUS_6 = timezone(timedelta(hours=6))

load_dotenv()

ACCESS_TOKEN_EXPIRE_MINUTES = 10800
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
ALGORITHM = "HS256"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "example_key")
JWT_REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", "example_key")

# Stripe configuration
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "example_key") 

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "example_key")
stripe.api_key = STRIPE_SECRET_KEY

if not STRIPE_SECRET_KEY:
    print("WARNING: STRIPE_SECRET_KEY is not set!")
else:
    stripe.api_key = STRIPE_SECRET_KEY

models.Base.metadata.create_all(bind=engine)

def get_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://quizzy350.vercel.app", "http://localhost:3000", "http://quizzy350.vercel.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    return pwd_context.hash(password)

def get_current_user_id(token: str = Depends(JWTBearer())):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if user_id_str is None:
            raise HTTPException(status_code=401, detail="Invalid token: user_id missing")
        user_id = int(user_id_str)
        return user_id
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")

def calculate_credits_needed(questions_count: int) -> float:
    """Calculate credits needed based on number of questions. 1 credit per 10 questions."""
    return questions_count / 10.0

async def send_to_processing_server(uploadthing_url: str, pdf_name: str, upload_id: int):
    """Send upload details to the processing server"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8001/pdf/upload",
                json={
                    "uploadthing_url": uploadthing_url,
                    "pdf_name": pdf_name,
                    "upload_id": upload_id  # Include upload_id so the other server can reference it
                },
                timeout=10.0
            )
            response.raise_for_status()
    except Exception as e:
        # Log the error but don't raise it to avoid blocking the upload creation
        print(f"Error sending to processing server: {e}")

async def send_exam_to_processing_server(exam_id: int, quiz_type: str, pdf_ids: List[str], topic: str, num_questions: int, difficulty: str, start_page: int, end_page: int):
    """Send exam details to the processing server for quiz generation"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8001/pdf/generate-quiz",
                json={
                    "exam_id": exam_id,  # Include exam_id so the other server can reference it
                    "quiz_type": quiz_type,
                    "pdf_ids": pdf_ids,
                    "topic": topic,
                    "num_questions": num_questions,
                    "difficulty": difficulty,
                    "page_start": start_page,
                    "page_end": end_page
                },
                timeout=30.0  # Longer timeout for quiz generation
            )
            response.raise_for_status()
    except Exception as e:
        # Log the error but don't raise it to avoid blocking the exam creation
        print(f"Error sending exam to processing server: {e}")

@app.post("/register")
def register_user(user: schemas.UserCreate, session: Session = Depends(get_session)):
    existing_user = session.query(models.User).filter_by(email=user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    encrypted_password = get_hashed_password(user.password)

    # Create new user with created_at timestamp
    new_user = models.User(username=user.username, email=user.email, password=encrypted_password, teacher=user.teacher)

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"message": "user created successfully"}

@app.post('/login', response_model=schemas.TokenSchema)
def login(request: schemas.requestdetails, db: Session = Depends(get_session)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email")

    if not verify_password(request.password, user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect password")

    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id)

    token_db = models.TokenTable(user_id=user.id, access_token=access, refresh_token=refresh, status=True)
    db.add(token_db)
    db.commit()
    db.refresh(token_db)

    return {
        "message": "Login successful",
        "access_token": access,
        "refresh_token": refresh,
    }

@app.get('/getusers/{id}', response_model=list[schemas.UserResponse])
def getusers(id,dependencies=Depends(JWTBearer()), session: Session = Depends(get_session)):
    users = session.query(models.User).filter(models.User.id==id).all()
    return users

@app.delete("/delete-user/{user_id}")
def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = session.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Set the deleted_at field to the current time when user deletes their account
    user.deleted_at = datetime.now(UTC_PLUS_6)
    session.commit()

    return {"message": "User account deleted successfully"}


@app.post('/change-password')
def change_password(request: schemas.changepassword, db: Session = Depends(get_session)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User not found")
    
    if not verify_password(request.old_password, user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid old password")
    
    encrypted_password = get_hashed_password(request.new_password)
    user.password = encrypted_password
    db.commit()
    
    return {"message": "Password changed successfully"}

@app.post("/exams", dependencies=[Depends(JWTBearer())])
async def create_exam(
    exam: schemas.ExamCreate, 
    session: Session = Depends(get_session), 
    user_id: int = Depends(get_current_user_id)
):
    if exam.quiz_type == "topic" and not exam.topic:
        raise HTTPException(status_code=400, detail="Topic is required for topic-based exams")
    if exam.quiz_type == "page_range" and (not exam.start_page or not exam.end_page):
        raise HTTPException(status_code=400, detail="Start page and end page are required for page range-based exams")
    
        # Check user credits before proceeding
    user = session.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    credits_needed = calculate_credits_needed(exam.questions_count)
    if user.credits < credits_needed:
        raise HTTPException(
            status_code=402, 
            detail=f"Insufficient credits. Required: {credits_needed}, Available: {user.credits}"
        )

    uploads = session.query(models.Uploads).filter(
        models.Uploads.id.in_(exam.upload_ids),
        models.Uploads.deleted_at.is_(None)  # Filter out soft-deleted uploads
    ).all()
    
    if not uploads or len(uploads) != len(exam.upload_ids):
        raise HTTPException(status_code=404, detail="One or more uploads not found or already deleted")

    # Check if all uploads have been processed (have pdf_id)
    for upload in uploads:
        if not upload.pdf_id:
            raise HTTPException(status_code=400, detail=f"Upload {upload.id} has not been processed yet")

    new_exam = models.Exam(
        user_id=user_id,
        retake=exam.retake,
        name=exam.name,
        start_time=exam.start_time,
        end_time=exam.end_time,
        quiz_type=exam.quiz_type,
        topic=exam.topic,
        start_page=exam.start_page,
        end_page=exam.end_page,
        quiz_difficulty=exam.quiz_difficulty,
        questions_count=exam.questions_count,
        processing_state=0
    )
    new_exam.uploads = uploads
    
    # Deduct credits from user
    user.credits -= credits_needed

    session.add(new_exam)
    session.commit()
    session.refresh(new_exam)

    # Prepare data for processing server
    pdf_ids = [upload.pdf_id for upload in uploads]
    
    # Determine quiz_type for processing server
    if len(uploads) > 1:
        processing_quiz_type = "multi_pdf_topic"
    else:
        processing_quiz_type = exam.quiz_type
    
    # Send request to processing server in background
    asyncio.create_task(send_exam_to_processing_server(
        exam_id=new_exam.id,
        quiz_type=processing_quiz_type,
        pdf_ids=pdf_ids,
        topic=exam.topic or "",  # Provide empty string if None
        start_page=exam.start_page or None,
        end_page=exam.end_page or None,
        num_questions=exam.questions_count,
        difficulty=exam.quiz_difficulty
    ))

    return {"message": "Exam created", "exam": new_exam.id}

@app.get("/exams", response_model=List[schemas.ExamResponse], dependencies=[Depends(JWTBearer())])
def get_exams(user_id: int = Depends(get_current_user_id),session: Session = Depends(get_session)):
    exams = session.query(models.Exam).order_by(models.Exam.created_at.desc()).filter(models.Exam.deleted_at == None, models.Exam.user_id == user_id).all()
    
    exam_responses = []
    for exam in exams:        
        # Count participants (unique users who took this exam)
        participants_count = session.query(models.Takes).filter(
            models.Takes.exam_id == exam.id,
            models.Takes.deleted_at.is_(None)
        ).count()
        
        # Get full upload objects
        uploads = [schemas.UploadResponse(
            id=upload.id,
            user_id=upload.user_id,
            url=upload.url,
            processing_state=upload.processing_state,
            pdf_id=upload.pdf_id,
            pages=upload.pages,
            pdf_name=upload.pdf_name,
            created_at=upload.created_at,
            deleted_at=upload.deleted_at
        ) for upload in exam.uploads if upload.deleted_at is None]
        
        exam_response = schemas.ExamResponse(
            id=exam.id,
            user_id=exam.user_id,
            name=exam.name,
            retake=exam.retake,
            uploads=uploads,
            start_time=exam.start_time,
            end_time=exam.end_time,
            quiz_type=exam.quiz_type,
            topic=exam.topic,
            start_page=exam.start_page,
            end_page=exam.end_page,
            processing_state=exam.processing_state,
            created_at=exam.created_at,
            deleted_at=exam.deleted_at,
            questions_count=exam.questions_count,
            participants_count=participants_count,
            quiz_difficulty=exam.quiz_difficulty
        )
        exam_responses.append(exam_response)
    
    return exam_responses

@app.get("/exams/{exam_id}", response_model=schemas.ExamDetailResponse, dependencies=[Depends(JWTBearer())])
def read_exam(exam_id: int = Path(...), session: Session = Depends(get_session)):
    exam = session.query(models.Exam).filter(models.Exam.id == exam_id, models.Exam.deleted_at == None).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Count participants (unique users who took this exam)
    participants_count = session.query(models.Takes).filter(
        models.Takes.exam_id == exam.id,
        models.Takes.deleted_at.is_(None)
    ).count()
    
    # Get full upload objects (filter out soft-deleted uploads)
    uploads = [schemas.UploadResponse(
        id=upload.id,
        user_id=upload.user_id,
        url=upload.url,
        processing_state=upload.processing_state,
        pdf_id=upload.pdf_id,
        pages=upload.pages,
        pdf_name=upload.pdf_name,
        created_at=upload.created_at,
        deleted_at=upload.deleted_at
    ) for upload in exam.uploads if upload.deleted_at is None]
    
    # Get questions without correct answers and explanations
    questions = session.query(models.Question).filter(
        models.Question.exam_id == exam_id,
        models.Question.deleted_at == None
    ).all()
    
    exam_response = schemas.ExamDetailResponse(
        id=exam.id,
        user_id=exam.user_id,
        name=exam.name,
        retake=exam.retake,
        uploads=uploads,
        questions=questions,
        start_time=exam.start_time,
        end_time=exam.end_time,
        quiz_type=exam.quiz_type,
        topic=exam.topic,
        start_page=exam.start_page,
        end_page=exam.end_page,
        processing_state=exam.processing_state,
        created_at=exam.created_at,
        deleted_at=exam.deleted_at,
        questions_count=exam.questions_count,
        participants_count=participants_count,
        quiz_difficulty=exam.quiz_difficulty
    )
    
    return exam_response



@app.put("/exams/{exam_id}", dependencies=[Depends(JWTBearer())])
def update_exam(
    exam_id: int, 
    exam_update: schemas.ExamUpdate, 
    session: Session = Depends(get_session),
    user_id: int = Depends(get_current_user_id)
):
    exam = session.query(models.Exam).filter(
        models.Exam.id == exam_id, 
        models.Exam.deleted_at == None
    ).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Check if user owns this exam or is authorized to edit it
    if exam.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this exam")
    
    # Convert to UTC+6 and validate time constraints - cannot set times earlier than current time
    current_time = datetime.now(UTC_PLUS_6)

    if exam_update.start_time:
        exam_update.start_time = exam_update.start_time.replace(tzinfo=bd_tz)
    if exam_update.end_time:
        exam_update.end_time = exam_update.end_time.replace(tzinfo=bd_tz)

    if exam_update.start_time and exam_update.start_time < current_time:
        raise HTTPException(status_code=400, detail="Start time cannot be earlier than current time")
    if exam_update.end_time and exam_update.end_time < current_time:
        raise HTTPException(status_code=400, detail="End time cannot be earlier than current time")

    # Validate that end_time is after start_time
    start_time = exam_update.start_time or exam.start_time
    end_time = exam_update.end_time or exam.end_time

    if end_time <= start_time:
        raise HTTPException(status_code=400, detail="End time must be after start time")
    
    # Update exam fields
    for field, value in exam_update.dict(exclude_unset=True, exclude={'questions'}).items():
        if value is not None:
            setattr(exam, field, value)
    
    # Handle questions if provided
    if exam_update.questions is not None:
        # Get all existing questions for this exam
        existing_questions = session.query(models.Question).filter(
            models.Question.exam_id == exam_id,
            models.Question.deleted_at == None
        ).all()
        
        existing_question_ids = {q.id for q in existing_questions}
        updated_question_ids = set()
        
        for question_data in exam_update.questions:
            if question_data.id is None:
                # New question - create it
                new_question = models.Question(
                    exam_id=exam_id,
                    text=question_data.text,
                    option_1=question_data.option_1,
                    option_2=question_data.option_2,
                    option_3=question_data.option_3,
                    option_4=question_data.option_4,
                    correct_answer=question_data.correct_answer,
                    explanation=question_data.explanation,
                    created_at=datetime.now(UTC_PLUS_6)
                )
                session.add(new_question)
            else:
                # Existing question - update it
                question = session.query(models.Question).filter(
                    models.Question.id == question_data.id,
                    models.Question.exam_id == exam_id,
                    models.Question.deleted_at == None
                ).first()
                
                if not question:
                    raise HTTPException(status_code=404, detail=f"Question with ID {question_data.id} not found")
                
                # Update question fields
                question.text = question_data.text
                question.option_1 = question_data.option_1
                question.option_2 = question_data.option_2
                question.option_3 = question_data.option_3
                question.option_4 = question_data.option_4
                question.correct_answer = question_data.correct_answer
                question.explanation = question_data.explanation
                
                updated_question_ids.add(question_data.id)
        
        # Soft delete questions that were not included in the update
        questions_to_delete = existing_question_ids - updated_question_ids
        for question_id in questions_to_delete:
            question_to_delete = session.query(models.Question).filter(
                models.Question.id == question_id
            ).first()
            if question_to_delete:
                question_to_delete.deleted_at = datetime.now(UTC_PLUS_6)
        
        # Update questions_count based on the number of questions provided
        exam.questions_count = len(exam_update.questions)
    
    session.commit()
    session.refresh(exam)
    
    return {"message": "Exam updated successfully", "exam_id": exam.id}

@app.delete("/exams/{exam_id}", dependencies=[Depends(JWTBearer())])
def delete_exam(exam_id: int, session: Session = Depends(get_session)):
    exam = session.query(models.Exam).filter(models.Exam.id == exam_id).first()
    if not exam or exam.deleted_at:
        raise HTTPException(status_code=404, detail="Exam not found")
    exam.deleted_at = datetime.now(UTC_PLUS_6)
    session.commit()
    return {"message": "Exam deleted"}



@app.post("/uploads", dependencies=[Depends(JWTBearer())])
async def create_upload(upload: schemas.UploadCreate, session: Session = Depends(get_session), user_id: int = Depends(get_current_user_id)):
    # Create the upload record in database
    new_upload = models.Uploads(user_id=user_id, url=upload.url, pdf_name=upload.pdf_name, processing_state=0)
    session.add(new_upload)
    session.commit()
    session.refresh(new_upload)

    # Send request to processing server in background
    asyncio.create_task(send_to_processing_server(upload.url, upload.pdf_name, new_upload.id))
    
    return {"message": "Upload created", "upload_id": new_upload.id}

@app.get("/uploads/myuploads", response_model=List[schemas.UploadResponse], dependencies=[Depends(JWTBearer())])
def get_my_uploads(
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    uploads = session.query(models.Uploads).filter(
        models.Uploads.user_id == user_id,
        models.Uploads.deleted_at == None
    ).order_by(models.Uploads.created_at.desc()).all()
    return uploads

@app.put("/uploads/{upload_id}", dependencies=[Depends(JWTBearer())])
def update_upload(upload_id: int, upload_update: schemas.UploadUpdate, session: Session = Depends(get_session)):
    upload = session.query(models.Uploads).filter(models.Uploads.id == upload_id).first()
    if not upload or upload.deleted_at:
        raise HTTPException(status_code=404, detail="Upload not found")

    upload.url = upload_update.url or upload.url
    session.commit()
    return {"message": "Upload updated"}

@app.delete("/uploads/{upload_id}", dependencies=[Depends(JWTBearer())])
def delete_upload(upload_id: int, session: Session = Depends(get_session)):
    upload = session.query(models.Uploads).filter(models.Uploads.id == upload_id).first()
    if not upload or upload.deleted_at:
        raise HTTPException(status_code=404, detail="Upload not found")
    upload.deleted_at = datetime.now(UTC_PLUS_6)
    session.commit()
    return {"message": "Upload deleted"}

@app.post("/webhook/upload-processed/{upload_id}")
def upload_processing_callback(
    upload_id: int, 
    callback_data: schemas.UploadProcessingCallback, 
    session: Session = Depends(get_session)
):
    """Webhook endpoint for the processing server to send back pdf_id and total_pages"""
    upload = session.query(models.Uploads).filter(
        models.Uploads.id == upload_id,
        models.Uploads.deleted_at.is_(None)
    ).first()
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    # Update the upload record with processing results
    upload.pdf_id = callback_data.pdf_id
    upload.pages = callback_data.total_pages
    upload.processing_state = 1  # Mark as processed
    
    session.commit()
    
    return {"message": "Upload processing data updated successfully"}

@app.post("/webhook/quiz-generated/{exam_id}")
def quiz_generation_callback(
    exam_id: int,
    callback_data: schemas.QuizGenerationCallback,
    session: Session = Depends(get_session)
):
    """Webhook endpoint for the processing server to send back generated questions"""
    exam = session.query(models.Exam).filter(
        models.Exam.id == exam_id,
        models.Exam.deleted_at.is_(None)
    ).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Helper function to find correct answer index
    def find_correct_answer_index(options: List[str], correct_answer: str) -> str:
        for i, option in enumerate(options):
            if option.strip() == correct_answer.strip():
                return str(i + 1)
        # If no exact match found, try to match without letter prefix (A), B), etc.)
        correct_text = correct_answer.strip()
        if len(correct_text) > 3 and correct_text[1:3] == ') ':
            correct_text = correct_text[3:].strip()
        
        for i, option in enumerate(options):
            option_text = option.strip()
            if len(option_text) > 3 and option_text[1:3] == ') ':
                option_text = option_text[3:].strip()
            if option_text == correct_text:
                return str(i + 1)
        
        # Default to option 1 if no match found
        return "1"
    
    # Create questions from the callback data
    for q in callback_data.questions:
        if len(q.options) != 4:
            continue  # Skip if not exactly 4 options
            
        correct_answer_index = find_correct_answer_index(q.options, q.correct_answer)
        
        new_question = models.Question(
            exam_id=exam_id,
            text=q.question,
            option_1=q.options[0],
            option_2=q.options[1],
            option_3=q.options[2],
            option_4=q.options[3],
            correct_answer=correct_answer_index,
            explanation=q.explanation,
            created_at=datetime.now(UTC_PLUS_6)
        )
        session.add(new_question)
    
    # Update exam processing state to completed
    exam.processing_state = 1
    session.commit()
    
    return {"message": f"Quiz questions generated and added to exam {exam_id}"}

@app.post("/questions", dependencies=[Depends(JWTBearer())])
def create_questions(
    payload: schemas.QuestionsCreateRequest,
    session: Session = Depends(get_session)
):
    exam = session.query(models.Exam).filter(models.Exam.id == payload.exam_id).first()

    if not exam or exam.deleted_at:
        raise HTTPException(status_code=404, detail="Exam not found")

    for q in payload.questions:
        new_question = models.Question(
            exam_id=payload.exam_id,
            text=q.text,
            option_1=q.option_1,
            option_2=q.option_2,
            option_3=q.option_3,
            option_4=q.option_4,
            correct_answer=q.correct_answer,
            explanation=q.explanation,
            created_at=datetime.now(UTC_PLUS_6)
        )
        session.add(new_question)

    session.commit()

    return {"message": f"{len(payload.questions)} questions added to exam {payload.exam_id}"}


@app.get("/questions/{question_id}", dependencies=[Depends(JWTBearer())])
def read_question(question_id: int, session: Session = Depends(get_session)):
    question = session.query(models.Question).filter(models.Question.id == question_id, models.Question.deleted_at == None).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@app.get("/exams/{exam_id}/questions", response_model=List[schemas.QuestionResponse], dependencies=[Depends(JWTBearer())])
def get_exam_questions(exam_id: int, session: Session = Depends(get_session)):
    """Get all questions for a specific exam"""
    exam = session.query(models.Exam).filter(models.Exam.id == exam_id, models.Exam.deleted_at == None).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    questions = session.query(models.Question).filter(
        models.Question.exam_id == exam_id,
        models.Question.deleted_at == None
    ).all()
    
    return questions

@app.put("/questions/{question_id}", dependencies=[Depends(JWTBearer())])
def update_question(question_id: int, question_update: schemas.QuestionUpdate, session: Session = Depends(get_session)):
    question = session.query(models.Question).filter(models.Question.id == question_id).first()
    if not question or question.deleted_at:
        raise HTTPException(status_code=404, detail="Question not found")

    for field, value in question_update.dict(exclude_unset=True).items():
        setattr(question, field, value)
    session.commit()
    return {"message": "Question updated"}

@app.delete("/questions/{question_id}", dependencies=[Depends(JWTBearer())])
def delete_question(question_id: int, session: Session = Depends(get_session)):
    question = session.query(models.Question).filter(models.Question.id == question_id).first()
    if not question or question.deleted_at:
        raise HTTPException(status_code=404, detail="Question not found")
    question.deleted_at = datetime.now(UTC_PLUS_6)
    session.commit()
    return {"message": "Question deleted"}



@app.get("/exams/{exam_id}/info", response_model=schemas.ExamPublicResponse, dependencies=[Depends(JWTBearer())])
def get_exam_info(exam_id: int, session: Session = Depends(get_session)):
    """Get basic exam information including start and end times"""
    exam = session.query(models.Exam).filter(models.Exam.id == exam_id, models.Exam.deleted_at == None).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    exam_info = schemas.ExamPublicResponse(
        id=exam.id,
        name=exam.name,
        start_time=exam.start_time,
        end_time=exam.end_time,
        retake=exam.retake
    )
    
    return exam_info

@app.post("/take_exam/{exam_id}", response_model=schemas.TakeExamResponse, dependencies=[Depends(JWTBearer())])
def take_exam(
    exam_id: int,
    take_create: schemas.TakeCreate,
    session: Session = Depends(get_session),
    user_id: int = Depends(get_current_user_id)
):
    # Check if exam exists
    exam = session.query(models.Exam).filter(models.Exam.id == exam_id, models.Exam.deleted_at == None).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    elif not take_create.device_id:
        raise HTTPException(status_code=400, detail="Device ID is required")
    
    start_time = exam.start_time.replace(tzinfo=bd_tz)
    end_time = exam.end_time.replace(tzinfo=bd_tz)

    # Check if exam is active
    if start_time > datetime.now(UTC_PLUS_6) or end_time < datetime.now(UTC_PLUS_6):
        raise HTTPException(status_code=400, detail="Exam is not active")


    # Check if user already took this exam
    previous_attempt = session.query(models.Takes).filter(
        models.Takes.exam_id == exam_id,
        models.Takes.user_id == user_id,
        models.Takes.deleted_at == None
    ).first()

    if previous_attempt and not exam.retake:
        raise HTTPException(status_code=400, detail="You have already taken this exam and retakes are not allowed")

    # Check if user is from different device
    if previous_attempt and previous_attempt.device_id != take_create.device_id:
        raise HTTPException(status_code=400, detail="You are using a different device from the one you used to take the exam")
    
    # Create a new attempt
    new_take = models.Takes(
        exam_id=exam_id,
        user_id=user_id,
        correct_answers=0,
        device_id=take_create.device_id,
        created_at=datetime.now(UTC_PLUS_6)
    )
    session.add(new_take)
    session.commit()
    session.refresh(new_take)

    # Get exam info
    exam_info = schemas.ExamInfoResponse(
        id=exam.id,
        name=exam.name,
        start_time=exam.start_time,
        end_time=exam.end_time,
        quiz_type=exam.quiz_type,
        topic=exam.topic,
        start_page=exam.start_page,
        end_page=exam.end_page,
        quiz_difficulty=exam.quiz_difficulty,
        questions_count=exam.questions_count,
        retake=exam.retake
    )

    # Get questions without correct answers and explanations
    questions = session.query(models.Question).filter(
        models.Question.exam_id == exam_id,
        models.Question.deleted_at == None
    ).all()
    
    questions_public = [schemas.QuestionPublicResponse(
        id=question.id,
        exam_id=question.exam_id,
        text=question.text,
        option_1=question.option_1,
        option_2=question.option_2,
        option_3=question.option_3,
        option_4=question.option_4,
        created_at=question.created_at,
        deleted_at=question.deleted_at
    ) for question in questions]

    return schemas.TakeExamResponse(
        message="Exam started",
        takes_id=new_take.id,
        exam_id=exam_id,
        exam=exam_info,
        questions=questions_public
    )

@app.get("/takes/me", response_model=List[schemas.TakeResponse])
def get_my_takes(
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
    ):
    takes = session.query(models.Takes).filter(
        models.Takes.user_id == user_id,
        models.Takes.deleted_at == None
    ).all()
    return takes

@app.put("/takes/{take_id}", dependencies=[Depends(JWTBearer())])
def update_take(take_id: int, take_update: schemas.TakeUpdate, session: Session = Depends(get_session)):
    take = session.query(models.Takes).filter(models.Takes.id == take_id).first()
    if not take or take.deleted_at:
        raise HTTPException(status_code=404, detail="Take record not found")

    for field, value in take_update.dict(exclude_unset=True).items():
        setattr(take, field, value)
    session.commit()
    return {"message": "Take record updated"}

@app.delete("/takes/{take_id}", dependencies=[Depends(JWTBearer())])
def delete_take(take_id: int, session: Session = Depends(get_session)):
    take = session.query(models.Takes).filter(models.Takes.id == take_id).first()
    if not take or take.deleted_at:
        raise HTTPException(status_code=404, detail="Take record not found")
    take.deleted_at = datetime.now(UTC_PLUS_6)
    session.commit()
    return {"message": "Take record deleted"}



@app.post("/answers", dependencies=[Depends(JWTBearer())])
def create_answer(answer: schemas.AnswerCreate, session: Session = Depends(get_session)):
    new_answer = models.Answers(question_id=answer.question_id, takes_id=answer.takes_id, answer=answer.answer)
    session.add(new_answer)
    session.commit()
    session.refresh(new_answer)
    return {"message": "Answer created", "answer_id": new_answer.id}

@app.post("/answers/bulk", response_model=schemas.BulkAnswerResponse, dependencies=[Depends(JWTBearer())])
def submit_bulk_answers(
    bulk_answers: schemas.BulkAnswerCreate, 
    session: Session = Depends(get_session),
    user_id: int = Depends(get_current_user_id)
):
    # Verify that the take record exists and belongs to the current user
    take = session.query(models.Takes).filter(
        models.Takes.id == bulk_answers.takes_id,
        models.Takes.user_id == user_id,
        models.Takes.deleted_at.is_(None)
    ).first()
    
    if not take:
        raise HTTPException(status_code=404, detail="Take record not found or does not belong to you")
    
    # Get all question IDs and their correct answers for this exam
    question_ids = [answer.question_id for answer in bulk_answers.answers]
    questions = session.query(models.Question).filter(
        models.Question.id.in_(question_ids),
        models.Question.exam_id == take.exam_id,
        models.Question.deleted_at.is_(None)
    ).all()
    
    if len(questions) != len(question_ids):
        raise HTTPException(status_code=404, detail="One or more questions not found")
    
    # Create a mapping of question_id to correct_answer for quick lookup
    correct_answers_map = {q.id: q.correct_answer for q in questions}
    
    # Calculate correct answers and store individual answers
    correct_count = 0
    for answer_item in bulk_answers.answers:
        # Create individual answer record
        new_answer = models.Answers(
            question_id=answer_item.question_id,
            takes_id=bulk_answers.takes_id,
            answer=answer_item.answer,
            created_at=datetime.now(UTC_PLUS_6)
        )
        session.add(new_answer)
        
        # Check if answer is correct
        if correct_answers_map.get(answer_item.question_id) == answer_item.answer:
            correct_count += 1
    
    # Update the take record with correct answers count
    take.correct_answers = correct_count
    
    session.commit()
    
    return schemas.BulkAnswerResponse(correct_answers=correct_count)

@app.get("/answers/{answer_id}", dependencies=[Depends(JWTBearer())])
def read_answer(answer_id: int, session: Session = Depends(get_session)):
    answer = session.query(models.Answers).filter(models.Answers.id == answer_id, models.Answers.deleted_at == None).first()
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    return answer

@app.put("/answers/{answer_id}", dependencies=[Depends(JWTBearer())])
def update_answer(answer_id: int, answer_update: schemas.AnswerUpdate, session: Session = Depends(get_session)):
    answer = session.query(models.Answers).filter(models.Answers.id == answer_id).first()
    if not answer or answer.deleted_at:
        raise HTTPException(status_code=404, detail="Answer not found")

    for field, value in answer_update.dict(exclude_unset=True).items():
        setattr(answer, field, value)
    session.commit()
    return {"message": "Answer updated"}

@app.delete("/answers/{answer_id}", dependencies=[Depends(JWTBearer())])
def delete_answer(answer_id: int, session: Session = Depends(get_session)):
    answer = session.query(models.Answers).filter(models.Answers.id == answer_id).first()
    if not answer or answer.deleted_at:
        raise HTTPException(status_code=404, detail="Answer not found")
    answer.deleted_at = datetime.now(UTC_PLUS_6)
    session.commit()
    return {"message": "Answer deleted"}

@app.get("/dashboard", response_model=schemas.DashboardResponse, dependencies=[Depends(JWTBearer())])
def get_dashboard(
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get dashboard information for the current user"""
    
    # Get total PDF count (uploads)
    total_pdf = session.query(models.Uploads).filter(
        models.Uploads.user_id == user_id,
        models.Uploads.deleted_at.is_(None)
    ).count()
    
    # Get total quiz count (exams created by user)
    total_quiz = session.query(models.Exam).filter(
        models.Exam.user_id == user_id,
        models.Exam.deleted_at.is_(None)
    ).count()
    
    # Get total exam participated count (takes by user)
    total_exam_participated = session.query(models.Takes).filter(
        models.Takes.user_id == user_id,
        models.Takes.deleted_at.is_(None)
    ).count()
    
    credits = session.query(models.User).filter(
        models.User.id == user_id
    ).first().credits

    # Get recent PDFs (top 5 in descending order)
    recent_pdfs = session.query(models.Uploads).filter(
        models.Uploads.user_id == user_id,
        models.Uploads.deleted_at.is_(None)
    ).order_by(models.Uploads.created_at.desc()).limit(5).all()
    
    # Get recent quizzes (top 5 exams in descending order)
    recent_exams = session.query(models.Exam).filter(
        models.Exam.user_id == user_id,
        models.Exam.deleted_at.is_(None)
    ).order_by(models.Exam.created_at.desc()).limit(5).all()
    
    # Transform recent exams to ExamResponse objects
    recent_quizzes = []
    for exam in recent_exams:
        # Count participants (unique users who took this exam)
        participants_count = session.query(models.Takes).filter(
            models.Takes.exam_id == exam.id,
            models.Takes.deleted_at.is_(None)
        ).count()
        
        # Get full upload objects
        uploads = [schemas.UploadResponse(
            id=upload.id,
            user_id=upload.user_id,
            url=upload.url,
            processing_state=upload.processing_state,
            pdf_id=upload.pdf_id,
            pages=upload.pages,
            pdf_name=upload.pdf_name,
            created_at=upload.created_at,
            deleted_at=upload.deleted_at
        ) for upload in exam.uploads if upload.deleted_at is None]
        
        exam_response = schemas.ExamResponse(
            id=exam.id,
            user_id=exam.user_id,
            name=exam.name,
            retake=exam.retake,
            uploads=uploads,
            start_time=exam.start_time,
            end_time=exam.end_time,
            quiz_type=exam.quiz_type,
            topic=exam.topic,
            start_page=exam.start_page,
            end_page=exam.end_page,
            processing_state=exam.processing_state,
            created_at=exam.created_at,
            deleted_at=exam.deleted_at,
            questions_count=exam.questions_count,
            participants_count=participants_count,
            quiz_difficulty=exam.quiz_difficulty
        )
        recent_quizzes.append(exam_response)
    
    return schemas.DashboardResponse(
        total_pdf=total_pdf,
        total_quiz=total_quiz,
        total_exam_participated=total_exam_participated,
        credits=credits,
        recent_pdfs=recent_pdfs,
        recent_quizzes=recent_quizzes
    )

@app.get("/rankings/{exam_id}", response_model=List[schemas.RankingResponse], dependencies=[Depends(JWTBearer())])
def get_exam_rankings(exam_id: int, session: Session = Depends(get_session)):
    """Get rankings for a specific exam"""
    # Verify exam exists
    exam = session.query(models.Exam).filter(
        models.Exam.id == exam_id,
        models.Exam.deleted_at.is_(None)
    ).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Get all users who took this specific exam with their scores
    rankings = session.query(
        models.User.id,
        models.User.username,
        models.Takes.correct_answers
    ).join(
        models.Takes, models.User.id == models.Takes.user_id
    ).filter(
        models.Takes.exam_id == exam_id,
        models.Takes.deleted_at.is_(None),
        models.User.deleted_at.is_(None),
        models.Takes.correct_answers.is_not(None)  # Only completed takes
    ).order_by(
        models.Takes.correct_answers.desc()
    ).all()
    
    return [schemas.RankingResponse(id=r.id, username=r.username, correct_answers=r.correct_answers) for r in rankings]

@app.get("/dashboard/takes", response_model=schemas.UserDashboardResponse, dependencies=[Depends(JWTBearer())])
def get_user_takes_dashboard(
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get user's exam takes information for dashboard"""
    
    # Get all takes by the user with exam information
    user_takes = session.query(models.Takes).join(
        models.Exam, models.Takes.exam_id == models.Exam.id
    ).filter(
        models.Takes.user_id == user_id,
        models.Takes.deleted_at.is_(None),
        models.Exam.deleted_at.is_(None)
    ).order_by(models.Takes.correct_answers.desc()).all()
    
    if not user_takes:
        return schemas.UserDashboardResponse(
            total_exams=0,
            avg_score=0.0,
            best_score=0.0,
            takes=[]
        )
    
    # Calculate total exams, avg score, and best score
    total_exams = len(user_takes)
    scores = []
    takes_details = []
    
    for take in user_takes:
        exam = take.exam
        
        # Get total questions for this exam to calculate percentage
        total_questions = exam.questions_count
        correct_answers = take.correct_answers or 0
        score_percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        scores.append(score_percentage)
        
        # Get ranking and total participants for this exam
        all_takes_for_exam = session.query(models.Takes).filter(
            models.Takes.exam_id == exam.id,
            models.Takes.deleted_at.is_(None),
            models.Takes.correct_answers.is_not(None)
        ).order_by(models.Takes.correct_answers.desc()).all()
        
        total_participants = len(all_takes_for_exam)
        
        # Find user's ranking (1-based)
        ranking = 1
        for idx, exam_take in enumerate(all_takes_for_exam):
            if exam_take.id == take.id:
                ranking = idx + 1
                break
        
        # Create take detail
        take_detail = schemas.UserTakeDetail(
            id=take.id,
            quiz_name=exam.name,
            quiz_difficulty=exam.quiz_difficulty,
            quiz_type=exam.quiz_type,
            quiz_created_at=exam.created_at,
            correct_answers=correct_answers,
            ranking=ranking,
            total_participants=total_participants,
            total_questions=exam.questions_count,
            start_time=exam.start_time,
            end_time=exam.end_time
        )
        takes_details.append(take_detail)
    
    # Calculate averages
    avg_score = sum(scores) / len(scores) if scores else 0.0
    best_score = max(scores) if scores else 0.0
    
    return schemas.UserDashboardResponse(
        total_exams=total_exams,
        avg_score=round(avg_score, 2),
        best_score=round(best_score, 2),
        takes=takes_details
    )

@app.get("/takes/{take_id}/details", response_model=schemas.DetailedTakeResponse, dependencies=[Depends(JWTBearer())])
def get_take_details(
    take_id: int,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    from datetime import timedelta
    """Get detailed information about a specific take including questions, answers, and results"""
    
    # Get the take record and verify it belongs to the current user
    take = session.query(models.Takes).join(
        models.Exam, models.Takes.exam_id == models.Exam.id
    ).filter(
        models.Takes.id == take_id,
        models.Takes.user_id == user_id,
        models.Takes.deleted_at.is_(None),
        models.Exam.deleted_at.is_(None)
    ).first()
    
    if not take:
        raise HTTPException(status_code=404, detail="Take record not found or does not belong to you")
    
    exam = take.exam
    
    if datetime.now(UTC_PLUS_6) < exam.end_time.replace(tzinfo=bd_tz) + timedelta(minutes=1):
        raise HTTPException(status_code=400, detail="The answers are not available yet")
    
    # Get all questions for this exam
    questions = session.query(models.Question).filter(
        models.Question.exam_id == exam.id,
        models.Question.deleted_at.is_(None)
    ).order_by(models.Question.id).all()
    
    # Get all user's answers for this take
    user_answers = session.query(models.Answers).filter(
        models.Answers.takes_id == take_id,
        models.Answers.deleted_at.is_(None)
    ).all()
    
    # Create a mapping of question_id to user_answer
    answers_map = {answer.question_id: answer.answer for answer in user_answers}
    
    # Build detailed questions with answers
    questions_with_answers = []
    for question in questions:
        user_answer = answers_map.get(question.id)
        is_correct = user_answer == question.correct_answer if user_answer else False
        
        question_detail = schemas.QuestionDetailWithAnswer(
            id=question.id,
            text=question.text,
            option_1=question.option_1,
            option_2=question.option_2,
            option_3=question.option_3,
            option_4=question.option_4,
            correct_answer=question.correct_answer,
            explanation=question.explanation,
            user_answer=user_answer,
            is_correct=is_correct
        )
        questions_with_answers.append(question_detail)
    
    # Calculate score percentage
    correct_answers = take.correct_answers or 0
    total_questions = exam.questions_count
    score_percentage = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    
    # Get ranking and total participants for this exam
    all_takes_for_exam = session.query(models.Takes).filter(
        models.Takes.exam_id == exam.id,
        models.Takes.deleted_at.is_(None),
        models.Takes.correct_answers.is_not(None)
    ).order_by(models.Takes.correct_answers.desc()).all()
    
    total_participants = len(all_takes_for_exam)
    
    # Find user's ranking (1-based)
    ranking = 1
    for idx, exam_take in enumerate(all_takes_for_exam):
        if exam_take.id == take.id:
            ranking = idx + 1
            break
    
    # Create exam detail
    exam_detail = schemas.ExamDetailForTake(
        id=exam.id,
        name=exam.name,
        quiz_difficulty=exam.quiz_difficulty,
        quiz_type=exam.quiz_type,
        topic=exam.topic,
        start_page=exam.start_page,
        end_page=exam.end_page,
        questions_count=exam.questions_count,
        created_at=exam.created_at
    )
    
    return schemas.DetailedTakeResponse(
        take_id=take.id,
        exam=exam_detail,
        user_id=take.user_id,
        correct_answers=correct_answers,
        total_questions=total_questions,
        score_percentage=round(score_percentage, 2),
        ranking=ranking,
        total_participants=total_participants,
        questions=questions_with_answers,
        created_at=take.created_at
    )

@app.get("/exams/{exam_id}/analytics", response_model=schemas.ExamAnalyticsResponse, dependencies=[Depends(JWTBearer())])
def get_exam_analytics(
    exam_id: int,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get comprehensive analytics for an exam (only accessible by exam creator)"""
    from collections import Counter
    import statistics
    from datetime import timedelta
    
    # Get the exam and verify user is the creator
    exam = session.query(models.Exam).filter(
        models.Exam.id == exam_id,
        models.Exam.user_id == user_id,
        models.Exam.deleted_at.is_(None)
    ).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found or you don't have permission to view its analytics")
    
    # Get exam creator info
    creator = session.query(models.User).filter(models.User.id == exam.user_id).first()
    
    # Get all takes for this exam
    takes = session.query(models.Takes).join(
        models.User, models.Takes.user_id == models.User.id
    ).filter(
        models.Takes.exam_id == exam_id,
        models.Takes.deleted_at.is_(None),
        models.User.deleted_at.is_(None)
    ).all()
    
    # Get completed takes (those with correct_answers populated)
    completed_takes = [take for take in takes if take.correct_answers is not None]
    
    total_participants = len(takes)
    total_completed = len(completed_takes)
    completion_rate = (total_completed / total_participants * 100) if total_participants > 0 else 0
    
    # Calculate score statistics
    if completed_takes:
        scores = [(take.correct_answers / exam.questions_count * 100) for take in completed_takes]
        average_score = statistics.mean(scores)
        median_score = statistics.median(scores)
        highest_score = max(scores)
        lowest_score = min(scores)
        std_deviation = statistics.stdev(scores) if len(scores) > 1 else 0
    else:
        average_score = median_score = highest_score = lowest_score = std_deviation = 0
    
    # Create participants analytics with ranking
    participants_data = []
    completed_takes_sorted = sorted(completed_takes, key=lambda x: x.correct_answers, reverse=True)
    
    for idx, take in enumerate(completed_takes_sorted):
        score_percentage = (take.correct_answers / exam.questions_count * 100) if exam.questions_count > 0 else 0
        
        participant = schemas.ParticipantAnalytics(
            user_id=take.user_id,
            username=take.user.username,
            correct_answers=take.correct_answers,
            total_questions=exam.questions_count,
            score_percentage=round(score_percentage, 2),
            ranking=idx + 1,
            completed_at=take.created_at
        )
        participants_data.append(participant)
    
    # Get all questions for this exam
    questions = session.query(models.Question).filter(
        models.Question.exam_id == exam_id,
        models.Question.deleted_at.is_(None)
    ).order_by(models.Question.id).all()
    
    # Get question analytics
    question_analytics_data = []
    for question in questions:
        # Get all answers for this question
        answers = session.query(models.Answers).join(
            models.Takes, models.Answers.takes_id == models.Takes.id
        ).filter(
            models.Answers.question_id == question.id,
            models.Takes.exam_id == exam_id,
            models.Answers.deleted_at.is_(None),
            models.Takes.deleted_at.is_(None)
        ).all()
        
        total_attempts = len(answers)
        correct_attempts = len([a for a in answers if a.answer == question.correct_answer])
        success_rate = (correct_attempts / total_attempts * 100) if total_attempts > 0 else 0
        
        # Count answers for each option
        answer_counts = Counter([a.answer for a in answers])
        option_1_count = answer_counts.get('1', 0)
        option_2_count = answer_counts.get('2', 0)
        option_3_count = answer_counts.get('3', 0)
        option_4_count = answer_counts.get('4', 0)
        
        question_analytics = schemas.QuestionAnalytics(
            question_id=question.id,
            question_text=question.text[:100] + "..." if len(question.text) > 100 else question.text,
            total_attempts=total_attempts,
            correct_attempts=correct_attempts,
            success_rate=round(success_rate, 2),
            option_1_count=option_1_count,
            option_2_count=option_2_count,
            option_3_count=option_3_count,
            option_4_count=option_4_count,
            correct_option=question.correct_answer
        )
        question_analytics_data.append(question_analytics)
    
    # Create score distribution (0-20, 21-40, 41-60, 61-80, 81-100)
    score_ranges = ["0-20", "21-40", "41-60", "61-80", "81-100"]
    score_distribution_data = []
    
    if completed_takes:
        scores = [(take.correct_answers / exam.questions_count * 100) for take in completed_takes]
        
        for score_range in score_ranges:
            range_parts = score_range.split('-')
            min_score = int(range_parts[0])
            max_score = int(range_parts[1])
            
            count = len([s for s in scores if min_score <= s <= max_score])
            percentage = (count / len(scores) * 100) if len(scores) > 0 else 0
            
            score_distribution_data.append(schemas.ScoreDistribution(
                score_range=score_range,
                count=count,
                percentage=round(percentage, 2)
            ))
    else:
        for score_range in score_ranges:
            score_distribution_data.append(schemas.ScoreDistribution(
                score_range=score_range,
                count=0,
                percentage=0
            ))
    
    # Daily participants analytics (last 30 days or since exam creation)
    daily_participants_data = []
    if takes:
        # Get date range
        start_date = max(exam.created_at.date(), (datetime.now(UTC_PLUS_6) - timedelta(days=30)).date())
        current_date = start_date
        end_date = datetime.now(UTC_PLUS_6).date()
        
        # Count participants by date
        takes_by_date = {}
        for take in takes:
            take_date = take.created_at.date()
            takes_by_date[take_date] = takes_by_date.get(take_date, 0) + 1
        
        # Fill in all dates
        while current_date <= end_date:
            count = takes_by_date.get(current_date, 0)
            daily_participants_data.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "count": count
            })
            current_date += timedelta(days=1)
    
    return schemas.ExamAnalyticsResponse(
        exam_id=exam.id,
        exam_name=exam.name,
        exam_creator=creator.username if creator else "Unknown",
        quiz_type=exam.quiz_type,
        quiz_difficulty=exam.quiz_difficulty,
        topic=exam.topic,
        start_page=exam.start_page,
        end_page=exam.end_page,
        questions_count=exam.questions_count,
        created_at=exam.created_at,
        start_time=exam.start_time,
        end_time=exam.end_time,
        
        # Participation Statistics
        total_participants=total_participants,
        total_completed=total_completed,
        completion_rate=round(completion_rate, 2),
        
        # Score Statistics
        average_score=round(average_score, 2),
        median_score=round(median_score, 2),
        highest_score=round(highest_score, 2),
        lowest_score=round(lowest_score, 2),
        std_deviation=round(std_deviation, 2),
        
        # Detailed Data
        participants=participants_data,
        question_analytics=question_analytics_data,
        score_distribution=score_distribution_data,
        daily_participants=daily_participants_data
    )

@app.get("/analytics/user", response_model=schemas.UserOverallAnalyticsResponse, dependencies=[Depends(JWTBearer())])
def get_user_overall_analytics(
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get comprehensive analytics for the current user's overall performance"""
    from collections import defaultdict, Counter
    import statistics
    from datetime import timedelta
    
    # Get user info
    user = session.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get all user's takes with exam information
    user_takes = session.query(models.Takes).join(
        models.Exam, models.Takes.exam_id == models.Exam.id
    ).filter(
        models.Takes.user_id == user_id,
        models.Takes.deleted_at.is_(None),
        models.Exam.deleted_at.is_(None),
        models.Takes.correct_answers.is_not(None)  # Only completed exams
    ).all()
    
    if not user_takes:
        # Return empty analytics for users with no exam history
        return schemas.UserOverallAnalyticsResponse(
            user_id=user_id,
            username=user.username,
            activity_summary=schemas.ActivitySummary(
                total_exams_taken=0,
                total_questions_answered=0,
                total_correct_answers=0,
                overall_accuracy=0,
                active_days=0,
                streak_current=0,
                streak_longest=0
            ),
            overall_average_score=0,
            subject_performance=[],
            difficulty_performance=[],
            performance_trends=[],
            monthly_progress=[],
            comparison_stats=schemas.ComparisonStats(
                user_average=0,
                global_average=0,
                percentile_rank=0,
                better_than_percentage=0
            ),
            strengths_weaknesses=[],
            recent_exams=[]
        )
    
    # Calculate activity summary
    total_exams_taken = len(user_takes)
    total_questions_answered = sum(take.exam.questions_count for take in user_takes)
    total_correct_answers = sum(take.correct_answers for take in user_takes)
    overall_accuracy = (total_correct_answers / total_questions_answered * 100) if total_questions_answered > 0 else 0
    
    # Calculate active days and streaks
    take_dates = sorted([take.created_at.date() for take in user_takes])
    unique_active_days = len(set(take_dates))
    
    # Calculate current and longest streaks
    streak_current = 0
    streak_longest = 0
    current_streak = 0
    
    if take_dates:
        # Check current streak from today backwards
        today = datetime.now(UTC_PLUS_6).date()
        current_date = today
        
        for i in range(30):  # Check last 30 days
            if current_date in take_dates:
                streak_current += 1
                current_date -= timedelta(days=1)
            else:
                break
        
        # Calculate longest streak
        for i in range(len(take_dates)):
            if i == 0 or (take_dates[i] - take_dates[i-1]).days == 1:
                current_streak += 1
                streak_longest = max(streak_longest, current_streak)
            else:
                current_streak = 1
    
    activity_summary = schemas.ActivitySummary(
        total_exams_taken=total_exams_taken,
        total_questions_answered=total_questions_answered,
        total_correct_answers=total_correct_answers,
        overall_accuracy=round(overall_accuracy, 2),
        active_days=unique_active_days,
        streak_current=streak_current,
        streak_longest=streak_longest
    )
    
    # Calculate overall average score
    scores = [(take.correct_answers / take.exam.questions_count * 100) for take in user_takes]
    overall_average_score = statistics.mean(scores) if scores else 0
    
    # Subject performance analysis
    subject_data = defaultdict(list)
    for take in user_takes:
        exam = take.exam
        subject = exam.topic if exam.topic else exam.quiz_type
        score = (take.correct_answers / exam.questions_count * 100)
        subject_data[subject].append({
            'score': score,
            'date': take.created_at.date()
        })
    
    subject_performances = []
    for subject, data in subject_data.items():
        scores = [d['score'] for d in data]
        dates = [d['date'] for d in data]
        
        # Calculate improvement trend
        if len(scores) >= 3:
            recent_avg = statistics.mean(scores[-3:])
            early_avg = statistics.mean(scores[:3])
            if recent_avg > early_avg + 5:
                trend = "improving"
            elif recent_avg < early_avg - 5:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "insufficient_data"
        
        subject_performances.append(schemas.SubjectPerformance(
            subject=subject,
            exams_taken=len(scores),
            average_score=round(statistics.mean(scores), 2),
            best_score=round(max(scores), 2),
            worst_score=round(min(scores), 2),
            improvement_trend=trend
        ))
    
    # Difficulty performance analysis
    difficulty_data = defaultdict(list)
    for take in user_takes:
        difficulty = take.exam.quiz_difficulty or "medium"
        score = (take.correct_answers / take.exam.questions_count * 100)
        difficulty_data[difficulty].append(score)
    
    difficulty_performances = []
    for difficulty, scores in difficulty_data.items():
        avg_score = statistics.mean(scores)
        success_rate = len([s for s in scores if s >= 60]) / len(scores) * 100  # 60% as pass threshold
        
        difficulty_performances.append(schemas.DifficultyPerformance(
            difficulty=difficulty,
            exams_taken=len(scores),
            average_score=round(avg_score, 2),
            success_rate=round(success_rate, 2)
        ))
    
    # Performance trends (last 20 exams or all if less than 20)
    recent_takes = sorted(user_takes, key=lambda x: x.created_at)[-20:]
    performance_trends = []
    for take in recent_takes:
        score = (take.correct_answers / take.exam.questions_count * 100)
        performance_trends.append(schemas.PerformanceTrend(
            date=take.created_at.strftime("%Y-%m-%d"),
            score=round(score, 2),
            exam_name=take.exam.name,
            exam_id=take.exam.id
        ))
    
    # Monthly progress (last 12 months)
    monthly_data = defaultdict(list)
    for take in user_takes:
        month_key = take.created_at.strftime("%Y-%m")
        score = (take.correct_answers / take.exam.questions_count * 100)
        monthly_data[month_key].append(score)
    
    monthly_progress = []
    for month, scores in sorted(monthly_data.items())[-12:]:  # Last 12 months
        monthly_progress.append({
            "month": month,
            "average_score": round(statistics.mean(scores), 2),
            "exams_count": len(scores)
        })
    
    # Comparative statistics
    # Get global average (all users)
    all_takes = session.query(models.Takes).join(
        models.Exam, models.Takes.exam_id == models.Exam.id
    ).filter(
        models.Takes.deleted_at.is_(None),
        models.Exam.deleted_at.is_(None),
        models.Takes.correct_answers.is_not(None)
    ).all()
    
    if all_takes:
        global_scores = [(take.correct_answers / take.exam.questions_count * 100) for take in all_takes]
        global_average = statistics.mean(global_scores)
        
        # Calculate percentile rank
        user_avg = overall_average_score
        better_count = len([s for s in global_scores if s < user_avg])
        percentile_rank = (better_count / len(global_scores) * 100) if global_scores else 0
        better_than_percentage = percentile_rank
    else:
        global_average = 0
        percentile_rank = 0
        better_than_percentage = 0
    
    comparison_stats = schemas.ComparisonStats(
        user_average=round(overall_average_score, 2),
        global_average=round(global_average, 2),
        percentile_rank=round(percentile_rank, 2),
        better_than_percentage=round(better_than_percentage, 2)
    )
    
    # Strengths and weaknesses analysis
    strengths_weaknesses = []
    subject_avg_scores = [(perf.subject, perf.average_score, perf.exams_taken) for perf in subject_performances]
    subject_avg_scores.sort(key=lambda x: x[1], reverse=True)
    
    # Top 2 subjects as strengths (if score > overall average)
    for i, (subject, avg_score, count) in enumerate(subject_avg_scores[:2]):
        if avg_score > overall_average_score:
            strengths_weaknesses.append(schemas.StrengthWeakness(
                category="strength",
                subject=subject,
                average_score=round(avg_score, 2),
                exams_count=count,
                description=f"Strong performance with {avg_score:.1f}% average score"
            ))
    
    # Bottom 2 subjects as weaknesses (if score < overall average)
    for i, (subject, avg_score, count) in enumerate(subject_avg_scores[-2:]):
        if avg_score < overall_average_score:
            strengths_weaknesses.append(schemas.StrengthWeakness(
                category="weakness",
                subject=subject,
                average_score=round(avg_score, 2),
                exams_count=count,
                description=f"Room for improvement with {avg_score:.1f}% average score"
            ))
    
    # Recent exams (last 10)
    recent_exam_takes = sorted(user_takes, key=lambda x: x.created_at, reverse=True)[:10]
    recent_exams = []
    
    for take in recent_exam_takes:
        exam = take.exam
        
        # Get ranking for this exam
        all_takes_for_exam = session.query(models.Takes).filter(
            models.Takes.exam_id == exam.id,
            models.Takes.deleted_at.is_(None),
            models.Takes.correct_answers.is_not(None)
        ).order_by(models.Takes.correct_answers.desc()).all()
        
        ranking = 1
        for idx, exam_take in enumerate(all_takes_for_exam):
            if exam_take.id == take.id:
                ranking = idx + 1
                break
        
        recent_exams.append(schemas.UserTakeDetail(
            id=take.id,
            quiz_name=exam.name,
            quiz_difficulty=exam.quiz_difficulty,
            quiz_type=exam.quiz_type,
            quiz_created_at=exam.created_at,
            correct_answers=take.correct_answers,
            ranking=ranking,
            total_participants=len(all_takes_for_exam),
            total_questions=exam.questions_count,
            start_time=exam.start_time,
            end_time=exam.end_time
        ))
    
    return schemas.UserOverallAnalyticsResponse(
        user_id=user_id,
        username=user.username,
        activity_summary=activity_summary,
        overall_average_score=round(overall_average_score, 2),
        subject_performance=subject_performances,
        difficulty_performance=difficulty_performances,
        performance_trends=performance_trends,
        monthly_progress=monthly_progress,
        comparison_stats=comparison_stats,
        strengths_weaknesses=strengths_weaknesses,
        recent_exams=recent_exams
    )

# ----- Payment Endpoints -----

@app.get("/credits/balance", response_model=schemas.CreditBalance, dependencies=[Depends(JWTBearer())])
def get_credit_balance(
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get the current user's credit balance"""
    user = session.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return schemas.CreditBalance(credits=user.credits)

@app.post("/payments/create-intent", response_model=schemas.PaymentIntentResponse, dependencies=[Depends(JWTBearer())])
def create_payment_intent(
    payment_data: schemas.PaymentIntentCreate,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Create a Stripe payment intent for purchasing credits"""
    try:
        # Validate user exists
        user = session.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not payment_data.currency:
            raise HTTPException(status_code=400, detail="Currency is required")
        elif payment_data.currency.lower() == "usd":
            if payment_data.amount < 1:
                raise HTTPException(status_code=400, detail="Amount must be at least $1.00 USD")
        elif payment_data.currency.lower() == "bdt":
            if payment_data.amount < 100:
                raise HTTPException(status_code=400, detail="Amount must be at least ৳100 BDT")
        else:
            raise HTTPException(status_code=400, detail="Unsupported currency. Only USD and BDT are supported")
        
        # Calculate credits to purchase (1:1 ratio)
        credits_to_purchase = float(payment_data.amount / 10)
        stripe_amount = int(payment_data.amount * 100)
        
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=stripe_amount,
            currency=payment_data.currency.lower(),
            metadata={
                "user_id": str(user_id),
                "credits_to_purchase": str(credits_to_purchase)
            }
        )
        
        # Create payment record in database
        payment_record = models.Payment(
            user_id=user_id,
            stripe_payment_intent_id=intent.id,
            amount=payment_data.amount,
            credits_purchased=credits_to_purchase,
            status="pending"
        )
        session.add(payment_record)
        session.commit()
        
        return schemas.PaymentIntentResponse(
            client_secret=intent.client_secret,
            payment_intent_id=intent.id,
            amount=payment_data.amount,
            credits_to_purchase=credits_to_purchase
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/payments/webhook")
async def stripe_webhook(
    request: Request,
    session: Session = Depends(get_session)
):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle payment intent succeeded event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        # Find the payment record
        payment = session.query(models.Payment).filter(
            models.Payment.stripe_payment_intent_id == payment_intent['id']
        ).first()
        
        if payment:
            # Update payment status
            payment.status = "completed"
            payment.completed_at = datetime.now(UTC_PLUS_6)
            
            # Add credits to user
            user = session.query(models.User).filter(models.User.id == payment.user_id).first()
            if user:
                user.credits += payment.credits_purchased
            
            session.commit()
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        
        # Find the payment record
        payment = session.query(models.Payment).filter(
            models.Payment.stripe_payment_intent_id == payment_intent['id']
        ).first()
        
        if payment:
            payment.status = "failed"
            session.commit()
    
    return {"status": "success"}

@app.get("/payments/history", response_model=List[schemas.PaymentResponse], dependencies=[Depends(JWTBearer())])
def get_payment_history(
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """Get the current user's payment history"""
    payments = session.query(models.Payment).filter(
        models.Payment.user_id == user_id
    ).order_by(models.Payment.created_at.desc()).all()
    
    return payments

@app.get("/credits/calculate")
def calculate_credits_for_questions(questions_count: int):
    """Calculate how many credits are needed for a given number of questions"""
    if questions_count <= 0:
        raise HTTPException(status_code=400, detail="Questions count must be positive")
    
    credits_needed = calculate_credits_needed(questions_count)
    return {
        "questions_count": questions_count,
        "credits_needed": round(credits_needed, 2),
        "rate": "0.1 credits per question (1 credit per 10 questions)"
    }