from fastapi import FastAPI

app = FastAPI(title="Retail Restock API")

@app.get("/")
def root():
    return {"message": "Hello, retail world!"}

@app.get("/health")
def health_check():
    return {"status": "OK", "message": "Backend is running"}