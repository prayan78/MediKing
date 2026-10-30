const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mediking_super_secret_jwt_key_2026_healthcare_erp');
      
      const user = await User.findById(decoded.id).populate('branch');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
      }

      if (user.tokenVersion > 0 && decoded.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated. Please contact administrator.' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('[Auth Error]:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed or expired.' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided.' });
  }
};

module.exports = { protect };
