# NrityaKala (MERN)

NrityaKala is a MERN stack web app for learning and practicing Indian classical dance mudras with simple real-time hand detection using MediaPipe Hands.

## Tech Stack
- Frontend: React (CRA), React Router, Recharts
- Backend: Node.js, Express
- Database: MongoDB (local or Atlas)
- Auth: JWT (stored in localStorage)

## Prerequisites
- Node.js 18+
- MongoDB running locally OR MongoDB Atlas connection string

## 1) Install dependencies

### Root (for running both together)
```bash
npm install
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and set:
- `MONGO_URI`
- `JWT_SECRET`

### Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
```

## 2) Seed mudras
From the project root:
```bash
npm run seed
```

## 3) Run the app (dev)
From the project root:
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Health: http://localhost:5000/health

## Notes
- Mudra detection is intentionally rule-based (simple) for reliability and easy maintenance.
- Practice sessions are saved when you click **Stop & Save**.