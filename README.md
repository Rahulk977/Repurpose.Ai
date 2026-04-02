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
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 12 40 PM" src="https://github.com/user-attachments/assets/eb306565-9645-46be-af00-8536c57692b5" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 11 59 PM" src="https://github.com/user-attachments/assets/646e1909-ca92-4ce4-abb5-54d597b286eb" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 11 50 PM" src="https://github.com/user-attachments/assets/0fe3133a-cd46-4819-91bc-0b9fafb07748" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 11 41 PM" src="https://github.com/user-attachments/assets/6d8f500e-4379-403c-82ec-de085a551b57" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 11 22 PM" src="https://github.com/user-attachments/assets/6ab8d2f3-a1a8-4ff7-8664-7e28b405c68a" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 10 09 PM" src="https://github.com/user-attachments/assets/f3557d68-6e93-420b-ad5e-0e00508987f9" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 10 04 PM" src="https://github.com/user-attachments/assets/d7ebba57-75d0-4196-a7c4-0a499e7fcf2e" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 09 58 PM" src="https://github.com/user-attachments/assets/599f0e5d-76ba-446f-a8fb-5940e923a095" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 09 52 PM" src="https://github.com/user-attachments/assets/0d819577-b70b-4d51-9ed9-1bb27a442321" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 09 45 PM" src="https://github.com/user-attachments/assets/9116a195-654e-498a-a2e7-670bab5c56a1" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 09 33 PM" src="https://github.com/user-attachments/assets/7138f2c7-e5bc-4efb-ac48-870eb2a038ae" />
<img width="1464" height="798" alt="Screenshot 2026-04-02 at 12 09 26 PM" src="https://github.com/user-attachments/assets/8c209eb3-b916-44e1-8812-7e08a05cafb8" />


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
