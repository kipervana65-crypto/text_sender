# Text Sender Frontend

## Setup
1. Copy env: `cp .env.example .env`
2. Install deps: `npm install`
3. Start dev server: `npm run dev`

## Build
- `npm run build`
- `npm run preview`

## Backend
Run backend separately and ensure `VITE_API_BASE_URL` points to it (default `http://127.0.0.1:8000`).

## Usage
1. Register a user
2. Login
3. Create text block (title + text)
4. Add/load comments by block UUID
5. View request logs and status in dashboard
