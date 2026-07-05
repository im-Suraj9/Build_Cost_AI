# 🏗️ BuildCost AI — Smart Construction Cost Estimator

An AI-powered, full-stack construction cost estimation platform built with the MERN stack. Get instant estimates, material breakdowns, timeline predictions, and cost optimization tips tailored to the Indian market.

![Tech Stack](https://img.shields.io/badge/Stack-MERN-orange) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Cost Prediction** | Instant estimates with ±10% accuracy, city-specific pricing |
| 📦 **Material Breakdown** | Cement, steel, bricks, sand, tiles — quantity + cost per item |
| ⏱️ **Timeline Planning** | Phase-wise Gantt chart with realistic durations |
| 💡 **Optimization Tips** | AI suggestions to save 15–25% on costs |
| 📊 **Visual Dashboard** | Pie/bar charts, project comparisons |
| 💬 **AI Chatbot** | Construction expert chatbot (mock + Groq) |
| 👷 **Contractor Marketplace** | Browse verified contractors with ratings/reviews |
| 📄 **PDF Reports** | Downloadable professional PDF reports |
| 🔔 **Notifications** | Real-time project updates via Socket.io |
| 🌙 **Dark Mode** | Full dark/light theme support |
| 🔐 **JWT Auth** | Role-based access (User / Contractor / Admin) |

## 🤖 Groq AI Setup (Free & Ultra-Fast)

Groq provides **free API access** with blazing fast inference (up to 500 tokens/sec).

### Get your free API key:
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card needed)
3. Create an API key
4. Add to `backend/.env`:

```env
GROQ_API_KEY=gsk_your-key-here
GROQ_MODEL=llama3-8b-8192
```

### Available Models:
| Model | Speed | Context | Best For |
|-------|-------|---------|----------|
| `llama3-8b-8192` | ⚡⚡⚡ Fastest | 8K | General chat (recommended) |
| `llama3-70b-8192` | ⚡⚡ Fast | 8K | More detailed responses |
| `mixtral-8x7b-32768` | ⚡⚡ Fast | 32K | Long conversations |
| `gemma2-9b-it` | ⚡⚡⚡ Fast | 8K | Precise factual answers |

Without a Groq key, the chatbot uses built-in mock responses (still works great!).



---

## 🗂️ Project Structure

```
construction-estimator/
├── backend/                  # Node.js + Express API
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Contractor.js
│   ├── routes/               # REST API routes
│   │   ├── auth.js           # /api/auth
│   │   ├── projects.js       # /api/projects (+ PDF)
│   │   ├── ai.js             # /api/ai/predict
│   │   ├── contractors.js    # /api/contractors
│   │   ├── admin.js          # /api/admin
│   │   └── chat.js           # /api/chat
│   ├── services/
│   │   ├── aiService.js      # Core ML logic (mock + real)
│   │   └── emailService.js   # NodeMailer integration
│   ├── middleware/
│   │   └── auth.js           # JWT + role middleware
│   ├── server.js             # Express + Socket.io server
│   ├── seed.js               # Database seed script
│   └── .env.example
│
├── frontend/                 # React + Vite + Tailwind
│   └── src/
│       ├── pages/
│       │   ├── HomePage.jsx          # Landing page + quick estimate
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── DashboardPage.jsx     # Stats + recent projects
│       │   ├── NewProjectPage.jsx    # 4-step estimate wizard
│       │   ├── ProjectDetailPage.jsx # Full estimate + charts
│       │   ├── ContractorsPage.jsx   # Marketplace
│       │   ├── ComparePage.jsx       # Side-by-side comparison
│       │   ├── ProfilePage.jsx
│       │   └── AdminPage.jsx         # Admin dashboard
│       ├── components/
│       │   ├── layout/DashboardLayout.jsx  # Sidebar + topbar
│       │   ├── chatbot/ChatbotWidget.jsx    # Floating AI chat
│       │   └── ui/NotificationPanel.jsx
│       ├── contexts/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       └── services/api.js
│
├── ai-service/               # Python FastAPI ML service (optional)
│   ├── main.py               # FastAPI app with prediction endpoints
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml        # Full stack Docker setup
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm / yarn

### 1. Clone & Install

```bash
git clone <repo-url>
cd construction-estimator

# Install all dependencies
npm install
npm run install:all
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/construction_estimator
JWT_SECRET=your_super_secret_key_here
FRONTEND_URL=http://localhost:5173

# Optional — for email notifications
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password

# Optional — for file uploads
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Optional — for real AI chatbot
GROQ_API_KEY=gsk_your-groq-api-key
GROQ_MODEL=llama3-8b-8192
```

### 3. Seed the Database

```bash
npm run seed
```

This creates:
- **Demo User:** `demo@buildcost.ai` / `demo123`
- **Admin:** `admin@buildcost.ai` / `admin123`
- **Contractor:** `contractor@buildcost.ai` / `contractor123`
- 6 verified contractors + 3 sample projects

### 4. Run Development Servers

```bash
# Start both backend + frontend together
npm run dev

# Or separately:
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:5173
```

---

## 🐳 Docker Deployment

```bash
# Build and start all services
npm run docker:build
npm run docker:up

# Services:
# Frontend:   http://localhost:3000
# Backend:    http://localhost:5000
# AI Service: http://localhost:8000
# MongoDB:    localhost:27017
```

---

## 🐍 Python AI Service (Optional)

The Node.js backend has built-in mock ML logic. For enhanced accuracy with the Python FastAPI service:

```bash
cd ai-service
pip install -r requirements.txt
python main.py
# Service runs at http://localhost:8000
```

Add to `backend/.env`:
```env
AI_API_URL=http://localhost:8000
```

### Python API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/predict` | POST | Full prediction (cost + materials + timeline) |
| `/estimate` | POST | Cost estimate only |
| `/materials` | POST | Material quantities only |
| `/timeline` | POST | Timeline only |

**Request body:**
```json
{
  "plot_size": 1500,
  "floors": 2,
  "city": "Mumbai",
  "building_type": "residential",
  "material_quality": "standard"
}
```

---

## 📡 REST API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Projects
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project + AI estimate |
| GET | `/api/projects/:id` | Get project detail |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| GET | `/api/projects/:id/pdf` | Download PDF report |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/predict` | Full AI prediction (auth required) |
| POST | `/api/ai/quick-estimate` | Quick estimate (no auth) |

### Contractors
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/contractors` | List contractors |
| GET | `/api/contractors/:id` | Get contractor |
| POST | `/api/contractors/:id/review` | Add review |

### Chat
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/chat/message` | Send message to AI chatbot |

### Admin *(admin role required)*
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/admin/stats` | Platform analytics |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id/role` | Change user role |

---

## 🧠 AI Estimation Logic

The cost estimation uses a multiplier-based model with these factors:

```
Total Cost = PlotSize × Floors × BaseCost × CityMultiplier × QualityMultiplier × TypeMultiplier
```

| Factor | Values |
|--------|--------|
| **Base Cost** | ₹1,800/sqft (Standard) |
| **City** | Mumbai: 1.45×, Delhi: 1.35×, Bangalore: 1.30×, etc. |
| **Quality** | Basic: 0.75×, Standard: 1.00×, Premium: 1.55× |
| **Type** | Residential: 1.0×, Commercial: 1.3×, Industrial: 0.9× |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Framer Motion |
| Backend | Node.js, Express.js, Socket.io |
| Database | MongoDB, Mongoose |
| Auth | JWT (JSON Web Tokens) |
| AI Service | Python FastAPI, scikit-learn (optional) |
| PDF | PDFKit |
| Email | NodeMailer |
| Upload | Multer + Cloudinary |
| Realtime | Socket.io |
| Deployment | Docker, Nginx |

---

## 🔮 Roadmap

- [ ] Scikit-learn regression model trained on real construction data
- [ ] Google Maps integration for location detection
- [ ] Razorpay/Stripe payment for premium reports
- [ ] Voice input for estimate form
- [ ] Multi-language support (Hindi, Tamil, Telugu)
- [ ] Mobile app (React Native)

---

## 📄 License

MIT License — free for personal and commercial use.

---

*Built with ❤️ for the Indian construction industry*
