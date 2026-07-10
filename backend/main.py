import os
from fastapi import FastAPI
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Add this model at the top of the file (after the imports)
class ItemCreate(BaseModel):
    name: str
    sku: str
    location: str
    quantity: int = 0
    floor_capacity: int = 10

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
    """Fetch all items with counts and priority sorting."""
    if not DATABASE_URL:
        return {"error": "DATABASE_URL not set in .env"}
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM items ORDER BY id"))
            items = []
            backstock_count = 0
            sales_floor_count = 0

            for row in result:
                item = {
                    "id": row.id,
                    "name": row.name,
                    "sku": row.sku,
                    "location": row.location,
                    "quantity": row.quantity,
                    "floor_capacity": row.floor_capacity,
                }
                items.append(item)

                if row.location == "back_stock":
                    backstock_count += row.quantity
                elif row.location == "sales_floor":
                    sales_floor_count += row.quantity

            # Priority sorting: Critical → Needs Restock → Full → Backstock
            def priority_score(item):
                if item["location"] == "sales_floor":
                    deficit = item["floor_capacity"] - item["quantity"]
                    if deficit >= 5:
                        return 1000 + deficit   # Critical
                    elif deficit > 0:
                        return 100 + deficit    # Needs Restock
                    else:
                        return 0                # Full
                else:
                    # All backstock items go to the bottom
                    return -1000 - item["id"]   # Stable order at bottom

            items.sort(key=priority_score, reverse=True)

            return {
                "items": items,
                "backstock_count": backstock_count,
                "sales_floor_count": sales_floor_count,
            }
    except Exception as e:
        return {"error": str(e)}

@app.put("/items/{item_id}/stock")
def stock_item(item_id: int):
    """Move an item from back_stock to sales_floor and increment quantity."""
    if not DATABASE_URL:
        return {"error": "DATABASE_URL not set in .env"}
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # Check if item exists and get current location and quantity
            check_sql = "SELECT location, quantity, floor_capacity FROM items WHERE id = :id"
            result = conn.execute(text(check_sql), {"id": item_id})
            row = result.fetchone()
            if not row:
                return {"error": "Item not found"}

            current_location, current_quantity, floor_capacity = row

            # If already on sales floor, just increment quantity
            if current_location == "sales_floor":
                new_quantity = current_quantity + 1
                update_sql = """
                    UPDATE items
                    SET quantity = :quantity, updated_at = NOW()
                    WHERE id = :id
                """
                conn.execute(text(update_sql), {"quantity": new_quantity, "id": item_id})
                conn.commit()
                return {"message": f"Added one to sales floor. New quantity: {new_quantity}"}

            # Otherwise move from back_stock to sales_floor
            else:
                # Move to sales floor and set quantity to 1 (or keep existing if you prefer)
                update_sql = """
                    UPDATE items
                    SET location = 'sales_floor', quantity = 1, updated_at = NOW()
                    WHERE id = :id
                """
                conn.execute(text(update_sql), {"id": item_id})
                conn.commit()
                return {"message": "Item moved to sales floor with quantity set to 1."}
    except Exception as e:
        return {"error": str(e)}

@app.post("/items")
def create_item(item: ItemCreate):
    """Add a new item to the inventory."""
    if not DATABASE_URL:
        return {"error": "DATABASE_URL not set in .env"}
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            insert_sql = """
                INSERT INTO items (name, sku, location, quantity, floor_capacity)
                VALUES (:name, :sku, :location, :quantity, :floor_capacity)
            """
            conn.execute(
                text(insert_sql),
                {
                    "name": item.name,
                    "sku": item.sku,
                    "location": item.location,
                    "quantity": item.quantity,
                    "floor_capacity": item.floor_capacity,
                }
            )
            conn.commit()
            return {"message": f"Item '{item.name}' added successfully!"}
    except Exception as e:
        return {"error": str(e)}

@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    """Delete an item from the inventory."""
    if not DATABASE_URL:
        return {"error": "DATABASE_URL not set in .env"}
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # Check if item exists
            check_sql = "SELECT id FROM items WHERE id = :id"
            result = conn.execute(text(check_sql), {"id": item_id})
            row = result.fetchone()
            if not row:
                return {"error": "Item not found"}

            # Delete the item
            delete_sql = "DELETE FROM items WHERE id = :id"
            conn.execute(text(delete_sql), {"id": item_id})
            conn.commit()
            return {"message": f"Item {item_id} deleted successfully!"}
    except Exception as e:
        return {"error": str(e)}
        