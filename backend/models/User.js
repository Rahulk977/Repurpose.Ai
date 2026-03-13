const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PLAN_LIMITS = {
  free: 3,
  pro: Infinity,
  creator: Infinity,
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    avatar: { type: String, default: null },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'creator'],
        default: 'free',
      },
      stripeCustomerId: { type: String, default: null },
      stripeSubscriptionId: { type: String, default: null },
      currentPeriodEnd: { type: Date, default: null },
      status: {
        type: String,
        enum: ['active', 'inactive', 'cancelled', 'past_due', 'trialing'],
        default: 'active',
      },
    },
    usage: {
      generationsThisMonth: { type: Number, default: 0 },
      totalGenerations: { type: Number, default: 0 },
      lastResetDate: { type: Date, default: () => new Date() },
    },
    settings: {
      emailNotifications: { type: Boolean, default: true },
      defaultFormats: {
        type: [String],
        default: ['twitter', 'linkedin', 'instagram', 'blog', 'email', 'youtube_shorts'],
      },
      timezone: { type: String, default: 'UTC' },
    },
    lastActiveAt: { type: Date, default: () => new Date() },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// userSchema.index({ email: 1 });
userSchema.index({ 'subscription.stripeCustomerId': 1 });

// ─── Virtual: remaining generations ──────────────────────────────────────────
userSchema.virtual('remainingGenerations').get(function () {
  const limit = PLAN_LIMITS[this.subscription.plan];
  if (limit === Infinity) return -1;
  return Math.max(0, limit - this.usage.generationsThisMonth);
});

// ─── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Method: compare passwords ────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Method: reset monthly usage if new month ────────────────────────────────
userSchema.methods.resetMonthlyUsageIfNeeded = function () {
  const now = new Date();
  const last = this.usage.lastResetDate;
  if (now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear()) {
    this.usage.generationsThisMonth = 0;
    this.usage.lastResetDate = now;
    return true;
  }
  return false;
};

// ─── Method: can user generate? ──────────────────────────────────────────────
userSchema.methods.canGenerate = function () {
  this.resetMonthlyUsageIfNeeded();
  const limit = PLAN_LIMITS[this.subscription.plan];
  return this.usage.generationsThisMonth < limit;
};

// ─── Method: increment usage ─────────────────────────────────────────────────
userSchema.methods.incrementUsage = function () {
  this.usage.generationsThisMonth += 1;
  this.usage.totalGenerations += 1;
};

// ─── Static: plan limits ─────────────────────────────────────────────────────
userSchema.statics.PLAN_LIMITS = PLAN_LIMITS;

module.exports = mongoose.model('User', userSchema);
