require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const subscriptionRoutes = require('./routes/subscription');

const app = express();

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Stripe webhook needs raw body ────────────────────────────────────────────
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ─── Rate limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: { message: 'Too many authentication attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/subscription', subscriptionRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error(`[${new Date().toISOString()}] ${status} - ${message}`, err.stack);
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Database connection ──────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI 

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    const PORT = parseInt(process.env.PORT) || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
