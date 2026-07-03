import os
from fastapi import FastAPI
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Retail Restock API")

DATABASE_URL = os.environ.get("DATABASE_URL")

@app.get("/")
def root():
    return {"message": "Hello, retail world!"}

@app.get("/health")
def health_check():
    return {"status": "OK", "message": "Backend is running"}

@app.get("/db-test")
def db_test():
    """Test endpoint to check if we can connect to Supabase."""
    if not DATABASE_URL:
        return {"error": "DATABASE_URL not set in .env"}
    
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return {"success": True, "message": f"Connected! Result: {result.scalar()}"}
    except Exception as e:
        return {"success": False, "error": str(e)}