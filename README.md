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

## Screenshorts
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 12 40 PM" src="https://github.com/user-attachments/assets/a6f905bc-2b43-4058-b993-d7965e1f5351" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 11 59 PM" src="https://github.com/user-attachments/assets/961f9a68-f108-47ff-ab28-f6984ba78c4f" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 11 50 PM" src="https://github.com/user-attachments/assets/2c2625a6-1789-410b-bf62-8280a3934b46" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 11 41 PM" src="https://github.com/user-attachments/assets/3b66eb52-ca5b-42a9-8afe-6399498d921f" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 11 22 PM" src="https://github.com/user-attachments/assets/e81a0a1f-9799-4200-a284-d3043826c131" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 10 09 PM" src="https://github.com/user-attachments/assets/1b14472c-79cf-4d86-9964-9a5f3fdecb1a" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 10 04 PM" src="https://github.com/user-attachments/assets/534a3e7d-e309-43d4-a054-62f7393eb63c" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 09 58 PM" src="https://github.com/user-attachments/assets/1fd208f2-fd37-48cf-9f62-47b2e27566f4" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 09 52 PM" src="https://github.com/user-attachments/assets/010e90da-fe43-4fd6-be56-46d39b6abe24" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 09 45 PM" src="https://github.com/user-attachments/assets/0a715ad0-903d-415e-b59c-b87e8af5f576" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 09 33 PM" src="https://github.com/user-attachments/assets/c0e65de9-8880-4c31-9800-00e71895e4cb" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 09 26 PM" src="https://github.com/user-attachments/assets/039a1309-9846-441e-85fc-84810c5cb338" />



## 🏗️ Tech Stack

```
Frontend:  Next.js 14 (App Router) · React · TailwindCSS · Cormorant + DM Sans fonts
Backend:   Node.js · Express.js · Helmet · Morgan · Rate limiting
Database:  MongoDB · Mongoose (with indexes)
AI:        OpenAI GPT-3.5/GPT-4-Turbo · Whisper (audio transcription)
Auth:      JWT (jsonwebtoken) · bcryptjs

```

---



## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key
- Stripe account (test mode not done yet)

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

### 3. Set Up Stripe Products( to be done later)

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



## 📝 License

MIT — use freely in personal and commercial projects.
