# 🚀 Repurpose.AI — AI Content Repurposing Engine

A production-ready full-stack SaaS application that transforms any content (YouTube video, audio file, or text) into 6 platform-optimized social media formats using AI.

---

## ✨ Feature Overview

| Feature | Description |
|---|---|
| 🎙️ Three Input Types | YouTube URL auto-transcription, audio/video upload via Whisper, direct text paste |
| 🤖 6 AI Formats | Twitter threads, LinkedIn posts, Instagram captions, Blog articles, Email newsletters, YouTube Shorts scripts |
| ✏️ Editable Cards | Edit, copy, and regenerate each content format individually |
| 📜 History | Full searchable history with pagination |
| 💳 Stripe Subscriptions | Free (3/mo) · Pro $19/mo · Creator $39/mo (GPT-4 Turbo) |
| 🔐 JWT Auth | Secure email/password authentication with 7-day tokens |
| 📊 Dashboard | Usage stats, quick actions, recent history |
| ⚙️ Settings | Profile, notifications, default formats, password change |

---

## 🏗️ Tech Stack

```
Frontend:  Next.js 14 (App Router) · React · TailwindCSS · Cormorant + DM Sans fonts
Backend:   Node.js · Express.js · Helmet · Morgan · Rate limiting
Database:  MongoDB · Mongoose (with indexes)
AI:        OpenAI GPT-3.5/GPT-4-Turbo · Whisper (audio transcription)
Auth:      JWT (jsonwebtoken) · bcryptjs
Payments:  Stripe Checkout + Billing Portal + Webhooks
Deploy:    Vercel (frontend) · Railway/Render (backend) · MongoDB Atlas (DB)
```

---

## 📁 Folder Structure

```
repurpose-ai/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx        # Sidebar layout (protects all routes)
│   │   │   └── page.tsx          # Dashboard home
│   │   ├── generate/page.tsx     # Content generation wizard
│   │   ├── history/
│   │   │   ├── page.tsx          # History list
│   │   │   └── [id]/page.tsx     # Content detail + editable cards
│   │   ├── billing/page.tsx      # Stripe subscription management
│   │   └── settings/page.tsx     # User settings
│   ├── lib/api.ts                # Axios client + API modules
│   └── hooks/useAuth.tsx         # Auth context (optional)
│
└── backend/
    ├── server.js                 # Express app entry point
    ├── models/
    │   ├── User.js               # User + subscription + usage
    │   └── Content.js            # Generated content
    ├── controllers/
    │   ├── authController.js
    │   ├── contentController.js  # Generation + CRUD
    │   └── subscriptionController.js
    ├── routes/
    │   ├── auth.js
    │   ├── content.js
    │   └── subscription.js
    ├── middleware/
    │   └── auth.js               # JWT verification
    └── services/
        └── aiService.js          # OpenAI + Whisper integration
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key
- Stripe account (test mode)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env
# → Edit .env with your values

# Frontend
cd ../frontend
npm install
cp .env.example .env.local
# → Edit .env.local with your values
```

### 2. Configure Environment Variables

**`backend/.env`**
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017/repurpose-ai

JWT_SECRET=your-super-secret-minimum-32-chars-change-this!
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=sk-...

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_CREATOR_PRICE_ID=price_...
```

**`frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Stripe Products

In [Stripe Dashboard](https://dashboard.stripe.com) → Products:

1. Create **Pro Plan**: Recurring price $19.00/month → copy `price_...` ID
2. Create **Creator Plan**: Recurring price $39.00/month → copy `price_...` ID

For local webhook testing, install [Stripe CLI](https://stripe.com/docs/stripe-cli):
```bash
stripe login
stripe listen --forward-to localhost:5000/api/subscription/webhook
# Copy the webhook secret (whsec_...) to STRIPE_WEBHOOK_SECRET
```

### 4. Start Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → Server at http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# → App at http://localhost:3000
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/settings` | ✅ | Update profile/settings |
| PUT | `/api/auth/password` | ✅ | Change password |

### Content
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/content/generate` | ✅ | Generate content (multipart) |
| GET | `/api/content/history` | ✅ | Paginated history |
| GET | `/api/content/stats` | ✅ | Usage statistics |
| GET | `/api/content/:id` | ✅ | Get single item |
| PUT | `/api/content/:id` | ✅ | Edit a format |
| POST | `/api/content/:id/regenerate` | ✅ | Regenerate a format |
| DELETE | `/api/content/:id` | ✅ | Delete item |

### Subscription
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/subscription/status` | ✅ | Plan + usage status |
| POST | `/api/subscription/create` | ✅ | Start Stripe checkout |
| POST | `/api/subscription/portal` | ✅ | Open billing portal |
| POST | `/api/subscription/webhook` | ❌ | Stripe webhook handler |

---

## 💳 Subscription Plans

| Feature | Free | Pro ($19/mo) | Creator ($39/mo) |
|---|---|---|---|
| Generations/month | 3 | Unlimited | Unlimited |
| YouTube transcription | ❌ | ✅ | ✅ |
| Audio upload | ❌ | ✅ | ✅ |
| AI Model | GPT-3.5 | GPT-3.5 | **GPT-4 Turbo** |
| Priority processing | ❌ | ❌ | ✅ |
| History | ✅ | ✅ | ✅ |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel deploy --prod
# Add env vars in Vercel dashboard under Settings → Environment Variables
```

### Backend → Railway
1. Push to GitHub
2. New Railway project → Deploy from GitHub repo
3. Set the root directory to `/backend`
4. Add all environment variables
5. Set start command: `npm start`

### Backend → Render
1. New Web Service → Connect GitHub repo
2. Root directory: `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables

### Database → MongoDB Atlas
1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create database user
3. Whitelist `0.0.0.0/0` (or specific IP)
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/repurpose-ai`
5. Update `MONGODB_URI` in production

---

## 🔒 Security Features

- **Helmet.js**: HTTP security headers
- **Rate limiting**: 100 req/15min globally, 20 req/hr on auth routes
- **bcrypt**: Password hashing (12 salt rounds)
- **JWT**: Signed tokens with expiry
- **Stripe webhook verification**: Cryptographic signature checking
- **Express-validator**: Input validation and sanitization
- **CORS**: Strict origin allowlist

---

## 📝 License

MIT — use freely in personal and commercial projects.
