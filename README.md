# Retail Restock App

A full-stack inventory management tool built to streamline retail restocking workflows. This app helps retail workers quickly view inventory, identify items that need to be restocked, and track stock levels across sales floor and back stock.

## The Problem

In retail, restocking is slow and inefficient. The software I used at my retail job was clunky, slow, and didn't clearly show what was on the sales floor vs. back stock. I built this to solve that.

## Features

- View inventory with location (sales floor / back stock)
- See quantity and low-stock alerts (red when below threshold)
- Search and filter items (coming soon)
- Restock queue (coming soon)
- "Stock It" button to move items to sales floor (coming soon)

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** PostgreSQL (Supabase)
- **Deployment:** (coming soon)

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Add your DATABASE_URL to .env
uvicorn main:app --reload

###Frontend

```bash
cd frontend
npm install
npm run dev
