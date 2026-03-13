const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// ─── Token factory ────────────────────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'repurpose-ai',
  });

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  subscription: user.subscription,
  usage: user.usage,
  settings: user.settings,
  remainingGenerations: user.remainingGenerations,
  createdAt: user.createdAt,
});

// ─── POST /api/auth/signup ────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  // Validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name: name.trim(), email, password });
    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: userPayload(user),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email already registered.' });
    }
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Failed to create account. Please try again.' });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Reset monthly usage if needed and save
    const didReset = user.resetMonthlyUsageIfNeeded();
    if (didReset) await user.save();

    const token = signToken(user._id);

    res.json({
      message: 'Login successful.',
      token,
      user: userPayload(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.resetMonthlyUsageIfNeeded();
    await user.save();

    res.json({ user: userPayload(user) });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Failed to fetch user data.' });
  }
};

// ─── PUT /api/auth/settings ───────────────────────────────────────────────────
exports.updateSettings = async (req, res) => {
  try {
    const { name, emailNotifications, defaultFormats, timezone } = req.body;
    const updates = {};

    if (name && typeof name === 'string') updates.name = name.trim().slice(0, 100);
    if (typeof emailNotifications === 'boolean') {
      updates['settings.emailNotifications'] = emailNotifications;
    }
    if (Array.isArray(defaultFormats)) {
      updates['settings.defaultFormats'] = defaultFormats;
    }
    if (timezone && typeof timezone === 'string') {
      updates['settings.timezone'] = timezone;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Settings updated successfully.', user: userPayload(user) });
  } catch (err) {
    console.error('UpdateSettings error:', err);
    res.status(500).json({ message: 'Failed to update settings.' });
  }
};

// ─── PUT /api/auth/password ───────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    console.error('ChangePassword error:', err);
    res.status(500).json({ message: 'Failed to change password.' });
  }
};
