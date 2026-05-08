# FitCheck — Resume Matcher

An AI-powered web app that analyzes how well your resume matches a job description and generates tailored cover letters.

---

## Features

- Upload a resume (PDF or DOCX) and paste or upload a job description
- AI analysis across multiple dimensions: overall fit score, skills match, experience relevance, education fit, keyword overlap, strengths, and gaps
- On-demand cover letter generation tailored to the role
- Session-based history to revisit past analyses
- Dark mode with persistent preference
- Responsive layout for mobile, tablet, and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7 |
| Backend | Node.js, Express 5 |
| AI | Google Gemini API (`@google/genai`) |
| Database | PostgreSQL on [Neon](https://neon.tech) |
| Deployment | Vercel (frontend) |

---

## Project Structure

```
resume-matcher/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── UploadPage.jsx      # Resume & job description input
│   │   │   ├── ResultsPage.jsx     # Analysis results slideshow/grid
│   │   │   └── HistoryPage.jsx     # Past analyses by session
│   │   ├── lib/api.js              # API client helpers
│   │   ├── hooks/useDarkMode.js    # Dark mode toggle
│   │   └── App.jsx                 # Router + session ID setup
│   ├── vercel.json                 # SPA rewrite rule for Vercel
│   └── package.json
│
└── backend/
    ├── server.js                   # Express app entry point
    ├── db.js                       # PostgreSQL connection pool
    ├── routes/
    │   ├── match.js                # POST /api/match
    │   ├── coverLetter.js          # POST /api/cover-letter
    │   └── history.js              # GET /api/history/:sessionId
    └── services/
        ├── gemini.js               # Gemini API integration
        └── extractor.js            # PDF/DOCX text extraction
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)
- A PostgreSQL database (a free [Neon](https://neon.tech) project works)

### 1. Clone the repo

```bash
git clone https://github.com/lhapollo/resume-matcher.git
cd resume-matcher
```

### 2. Set up the database

Run the following SQL in your PostgreSQL database to create the required table:

```sql
CREATE TABLE results (
  id          SERIAL PRIMARY KEY,
  session_id  TEXT        NOT NULL,
  score       INTEGER     NOT NULL,
  result_json JSONB       NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Configure environment variables

**Backend** — create `backend/.env`:

```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_neon_or_postgres_connection_string
CORS_ORIGIN=http://localhost:5173
```

**Frontend** — create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5001
```

### 4. Install dependencies and start

```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev       # starts on http://localhost:5001

# Terminal 2 — frontend
cd frontend
npm install
npm run dev       # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/match` | Analyze resume against job description |
| `POST` | `/api/cover-letter` | Generate a cover letter for a match result |
| `GET` | `/api/history/:sessionId` | Retrieve past analyses for a session |

Requests must include an `x-session-id` header containing the browser's session UUID.

File uploads accept `resume` (PDF/DOCX, max 10 MB) and an optional `jobFile` alongside a `jobDescription` text field.

---

## Deployment

### Frontend (Vercel)

The `frontend/vercel.json` is already configured with a catch-all rewrite rule for client-side routing. Push the `frontend/` directory as your Vercel project root and set `VITE_API_URL` to your deployed backend URL in the Vercel environment variables dashboard.

### Backend

Deploy to any Node.js host (Railway, Render, Fly.io, etc.). Set the same environment variables from step 3, updating `CORS_ORIGIN` to your Vercel frontend URL.

---

## How It Works

1. The browser generates a UUID on first visit and stores it in `localStorage` as the session ID.
2. The user uploads a resume and provides a job description.
3. The backend extracts text from the file using `pdf-parse` or `mammoth`, then sends it to the Gemini API with a structured prompt requesting a JSON analysis.
4. The result is stored in PostgreSQL, linked to the session ID.
5. The frontend displays the result as a slideshow of score cards with color-coded ratings (green ≥ 75, orange ≥ 50, red < 50).
6. Optionally, the user can request a cover letter, which triggers a second Gemini call using the same resume and job context.
