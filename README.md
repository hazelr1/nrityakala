# 🕉️ NrityaKala — Art of Dance

**A full-stack MERN web platform for learning and practicing Indian classical dance mudras with AI-powered real-time hand detection.**

---

## ✨ Features

- **User Authentication** — JWT-based login/signup with bcrypt password hashing
- **Mudra Library** — 8 classical mudras with descriptions, finger patterns, and meanings
- **AI Practice Module** — Real-time webcam detection using MediaPipe Hands
- **Rule-Based Classification** — Detects: Pataka, Tripataka, Alapadma, Ardhachandra, Mushti, Shikara, Mayura, Katakamukha
- **Practice History** — Saves every session with accuracy scores to MongoDB
- **Dashboard** — Accuracy trend charts, per-mudra breakdown, session stats
- **Profile Management** — View/edit name, bio, and dance level

---

## 🗂️ Folder Structure

```
nrityakala/
├── backend/
│   ├── config/
│   │   └── seed.js          # Database seeder for mudra data
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   ├── User.js          # User model with bcrypt
│   │   ├── Mudra.js         # Mudra model
│   │   └── PracticeLog.js   # Practice session model
│   ├── routes/
│   │   ├── auth.js          # /api/auth (login, register, me)
│   │   ├── mudras.js        # /api/mudras
│   │   ├── practice.js      # /api/practice (save, history, stats)
│   │   └── user.js          # /api/user (profile CRUD)
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html       # MediaPipe CDN scripts loaded here
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── AuthPage.js  # Login & Register
│   │   │   ├── Dashboard.js
│   │   │   ├── MudraList.js
│   │   │   ├── Practice.js  # Webcam + MediaPipe detection
│   │   │   ├── History.js
│   │   │   └── Profile.js
│   │   ├── utils/
│   │   │   ├── api.js           # Axios API helpers
│   │   │   └── mudraDetector.js # Rule-based classification logic
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css        # Indian classical theme
│   ├── .env.example
│   └── package.json
├── package.json             # Root scripts (run both servers)
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v16+ and npm
- **MongoDB** running locally on port 27017 (or a MongoDB Atlas URI)
- A modern browser with webcam support (Chrome recommended)

---

### 1. Clone / Copy the project

```bash
cd nrityakala
```

### 2. Install dependencies

```bash
# From root (installs both backend and frontend)
npm install          # installs concurrently
npm run install:all  # installs backend and frontend deps
```

Or manually:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

**Backend** — copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nrityakala
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Frontend** — copy `.env.example` to `.env`:
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Seed the database with mudra data

```bash
cd backend
npm run seed
```

You should see:
```
✅ Connected to MongoDB
🌱 Seeded 8 mudras successfully!
  ✓ Pataka (Beginner)
  ✓ Tripataka (Beginner)
  ...
✅ Done!
```

### 5. Start the development servers

From root:
```bash
npm start
```

Or separately:
```bash
# Terminal 1 - Backend
cd backend && npm run dev   # runs on http://localhost:5000

# Terminal 2 - Frontend  
cd frontend && npm start    # runs on http://localhost:3000
```

### 6. Open the app

Navigate to **http://localhost:3000**

---

## 🧠 Mudra Detection Logic

The AI detection uses **MediaPipe Hands** (client-side, no model training) with **rule-based finger state analysis**:

```
classifyMudra(landmarks) → { name, confidence, description }
```

Each hand has 21 landmarks. The classifier determines:
- **Finger extension**: Is fingertip higher than PIP joint? (y-coordinate comparison)
- **Thumb state**: Is thumb spread away from index base? Is it bent across palm?
- **Finger spread**: Are fingertips spread apart (Alapadma)?

| Mudra | Rule |
|-------|------|
| Mushti | All fingers curled, no thumb |
| Shikara | Thumb up, all 4 curled |
| Pataka | All 4 straight, thumb bent in |
| Tripataka | Ring bent, others straight |
| Ardhachandra | Thumb + all 4 extended, not spread |
| Alapadma | All 5 spread open |
| Mayura | Index bent to thumb, middle/ring/pinky up |
| Katakamukha | Only pinky straight |

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/mudras` | ❌ | List all mudras |
| GET | `/api/mudras/:id` | ❌ | Single mudra |
| POST | `/api/practice` | ✅ | Save practice session |
| GET | `/api/practice/history` | ✅ | User's history |
| GET | `/api/practice/stats` | ✅ | Dashboard stats |
| GET | `/api/user/profile` | ✅ | Get profile |
| PUT | `/api/user/profile` | ✅ | Update profile |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6 |
| Charts | Recharts |
| AI/Detection | MediaPipe Hands (CDN) |
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Styling | Custom CSS (Indian classical theme) |

---

## 🚀 Production Notes

- Change `JWT_SECRET` to a strong random string
- Set `REACT_APP_API_URL` to your deployed backend URL  
- Use MongoDB Atlas for cloud database
- Add HTTPS for webcam to work in production (browsers require secure context)
- Build frontend: `cd frontend && npm run build`

---

*नृत्यकला — Preserving the Sacred Language of Hands* 🕉️
