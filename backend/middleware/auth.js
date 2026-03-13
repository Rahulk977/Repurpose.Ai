const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware: Verify JWT and attach user to request
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.slice(7); // Remove "Bearer "

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ message: 'Invalid token.' });
    }

    const user = await User.findById(decoded.userId).select('-__v');
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Update last active timestamp (fire-and-forget)
    User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() }).exec();

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Authentication error.' });
  }
};

/**
 * Middleware: Require specific plan
 */
const requirePlan = (...plans) => (req, res, next) => {
  if (!plans.includes(req.user.subscription.plan)) {
    return res.status(403).json({
      message: `This feature requires one of the following plans: ${plans.join(', ')}.`,
      requiredPlans: plans,
      currentPlan: req.user.subscription.plan,
    });
  }
  next();
};

module.exports = { auth, requirePlan };
