const Role = require('../models/Role');

const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Super Admin has access to everything
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    try {
      const customRole = await Role.findOne({ slug: req.user.role, isActive: true });
      if (customRole && customRole.permissions.some((permission) => roles.includes(permission))) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource.`,
      });
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = { authorize };
