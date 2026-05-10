# ProSync — AI-Powered Team Productivity SaaS

A full-stack MERN application for real-time team task management with AI-powered daily summaries, Kanban boards, analytics dashboards, and multi-tenant workspace isolation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Zustand, Axios, TailwindCSS, Socket.io-client |
| Backend | Node.js, Express, Mongoose, Socket.io, ioredis, JWT |
| Database | MongoDB Atlas |
| Cache | Redis (Upstash) |
| Auth | JWT (access + refresh rotation) + Google OAuth 2.0 |
| AI | Gemini Flash latest |

## Features

- **JWT Auth** with access/refresh token rotation + Google OAuth 2.0
- **Multi-tenant Workspaces** with role-based access (admin/member)
- **Kanban Board** with drag-and-drop task management
- **Real-time Updates** via Socket.io room-based architecture
- **AI Daily Summaries** powered by Gemini AI Flash latest
- **Analytics Dashboard** with Redis-cached aggregation metrics
- **Rate Limiting** to protect auth routes from brute force

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Redis instance (Upstash recommended)
- Google Cloud OAuth credentials
- Gemini AI API key

### 1. Clone and configure environment

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- `MONGO_URI` — MongoDB Atlas connection string
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — random secure strings
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `REDIS_URL` / `REDIS_TOKEN` — from Upstash dashboard
- `GEMINI_API_KEY` — from Google AI Studio platform

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Run development servers

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

- Server runs on `http://localhost:5000`
- Client runs on `http://localhost:5173`
- Vite proxies `/api` and `/socket.io` to the backend

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/refresh | Rotate refresh token |
| POST | /api/auth/logout | Invalidate refresh token |
| GET | /api/auth/google | Initiate Google OAuth |
| GET | /api/auth/me | Get current user (protected) |

### Workspaces
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/workspaces | Create workspace |
| GET | /api/workspaces/my | List user's workspaces |
| GET | /api/workspaces/:id | Get workspace by ID |
| POST | /api/workspaces/:id/invite | Invite member by email |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks?workspaceId= | Get filtered tasks |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Soft delete task |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/:workspaceId | Get cached analytics |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/summary | Generate AI daily summary |

## Performance Features

1. **MongoDB Compound Indexes** on Task model for fast queries
2. **Redis Cache** on analytics (60s TTL) with X-Cache HIT/MISS headers
3. **Socket.io Rooms** — workspace-scoped events, never global
4. **React.lazy()** code splitting on all page components
5. **Gemini AI Response Caching** (1 hour) with cached indicator
6. **Rate Limiting** — 5 req/15min on auth, 100 req/15min global
