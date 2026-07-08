import os
from fastapi import FastAPI
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI(title="Retail Restock API")

# CORS middleware (so your React frontend can talk to this backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = os.environ.get("DATABASE_URL")

@app.get("/")
def root():
    return {"message": "Hello, retail world!"}

@app.get("/health")
def health_check():
    return {"status": "OK", "message": "Backend is running"}

@app.get("/db-test")
def db_test():
    if not DATABASE_URL:
        return {"error": "DATABASE_URL not set in .env"}
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            return {"success": True, "message": f"Connected! Result: {result.scalar()}"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/items")
def get_items():
    """Fetch all items from the database."""
    if not DATABASE_URL:
        return {"error": "DATABASE_URL not set in .env"}
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM items ORDER BY id"))
            items = []
            for row in result:
                items.append({
                    "id": row.id,
                    "name": row.name,
                    "sku": row.sku,
                    "location": row.location,
                    "quantity": row.quantity,
                    "min_threshold": row.min_threshold
                })
            return {"items": items}
    except Exception as e:
        return {"error": str(e)}