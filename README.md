# DealMate 🛒

A full-stack second-hand marketplace built for Nepal — list, discover, and buy pre-owned goods. Powered by AI-driven recommendations and real-time sentiment analysis.

---

## 🏗️ Architecture

```
dealmate/
├── backend/          # Node.js + Express API         → Port 5000
├── frontend/         # React (CRA) SPA               → Port 3000
└── ai_service/       # Python Flask microservices
    ├── sentiment.py  # Sentiment analysis service    → Port 5001
    └── recommend.py  # Content recommendation        → Port 5002
```

### Key Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Socket.IO client, Leaflet maps |
| Backend | Node.js, Express 5, MongoDB (Mongoose), Socket.IO, JWT auth |
| AI Services | Python, Flask, scikit-learn (TF-IDF), Gemini AI |
| Payments | Stripe, Khalti |
| Storage | Cloudinary (images), MongoDB Atlas |
| Auth | JWT + Google OAuth |

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & install dependencies

```bash
git clone https://github.com/your-username/dealmate.git
cd dealmate
npm run install:all          # installs backend & frontend node_modules
pip install -r ai_service/requirements.txt
```

### 2. Set up environment variables

Copy the example files and fill in your real values:

```bash
cp backend/.env.example   backend/.env
cp frontend/.env.example  frontend/.env
```

### 3. Train the sentiment model (first time only)

```bash
cd ai_service
python train_sentiment.py
```

> The trained model files (`models/sentiment_model.pkl`, `models/tfidf_vectorizer.pkl`) are committed, so this is only needed if you want to retrain.

### 4. Run all services

```bash
# From project root — starts all 4 processes concurrently
npm run dev
```

Or run each separately:
```bash
cd backend  && npm run dev          # Express API on :5000
cd frontend && npm start            # React app on :3000
python ai_service/sentiment.py     # Sentiment on :5001
python ai_service/recommend.py     # Recommend on :5002
```

---

## 🌐 Deployment on Render

This project uses a `render.yaml` Blueprint for one-click deployment.

1. Fork / push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your repository — Render will read `render.yaml` and create all 4 services automatically
4. Add environment variables for each service via the Render dashboard (use `.env.example` files as reference)

### Services deployed
| Service | Type | Build Command | Start Command |
|---|---|---|---|
| `dealmate-backend` | Web Service (Node) | `npm install` | `npm start` |
| `dealmate-frontend` | Static Site (React) | `npm install && npm run build` | — |
| `dealmate-sentiment` | Web Service (Python) | `pip install -r requirements.txt` | `gunicorn sentiment:app` |
| `dealmate-recommend` | Web Service (Python) | `pip install -r requirements.txt` | `gunicorn recommend:app` |

---

## 📁 Project Structure

```
backend/
├── api/              # Feature-based route handlers (auth, products, orders, …)
├── config/           # DB, JWT, Cloudinary, email config
├── middleware/        # Auth, upload, rate-limit, error handler
├── models/           # Mongoose schemas
├── scripts/          # One-off migration & debug scripts (not run on deploy)
├── seed/             # Sample data CSV
├── services/         # Business logic services (TrustScore, UserActivity, …)
└── utils/            # Email, sentiment, socket, recommendation helpers

frontend/src/
├── components/       # Reusable UI (admin/, auth/, chat/, common/, payment/, products/, user/, vendor/)
├── context/          # React context (Logo, Socket)
├── pages/            # Top-level route pages
├── styles/           # CSS files
└── utils/            # api.js (axios + interceptors), auth, routing, recommendations

ai_service/
├── models/           # Trained ML model files (.pkl)
├── scripts/          # Training & build scripts
├── tests/            # Test scripts for model verification
├── sentiment.py      # Flask sentiment API (:5001)
└── recommend.py      # Flask recommendation API (:5002)
```

---

## 🔑 Environment Variables Reference

See:
- [`backend/.env.example`](./backend/.env.example)
- [`frontend/.env.example`](./frontend/.env.example)
- [`ai_service/.env.example`](./ai_service/.env.example)

---

## 📄 License

MIT
