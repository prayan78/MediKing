const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mediking_super_secret_jwt_key_2026_healthcare_erp', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username/email and password' });
    }

    const user = await User.findOne({
      $or: [
        { email: usernameOrEmail.toLowerCase().trim() },
        { username: usernameOrEmail.toLowerCase().trim() },
      ],
    })
      .select('+password')
      .populate('branch')
      .populate('assignedBranches');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'User account is inactive. Please contact your administrator.' });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Create Audit Log
    await AuditLog.create({
      action: 'LOGIN',
      user: user._id,
      username: user.username,
      userRole: user.role,
      entity: 'AUTH',
      entityId: user._id.toString(),
      branch: user.branch ? user.branch._id : null,
      ipAddress: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      details: { timestamp: new Date() },
    });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        branch: user.branch,
        assignedBranches: user.assignedBranches || [],
        phone: user.phone,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('branch')
      .populate('assignedBranches')
      .populate('department');

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Switch active branch
// @route   POST /api/auth/switch-branch
// @access  Private
exports.switchBranch = async (req, res, next) => {
  try {
    const { branchId } = req.body;
    if (!branchId) {
      return res.status(400).json({ success: false, message: 'branchId is required' });
    }

    const user = await User.findById(req.user._id);

    // If super_admin, allowed to switch to any branch
    if (user.role !== 'super_admin') {
      const isAssigned = user.assignedBranches && user.assignedBranches.some(b => b.toString() === branchId);
      if (!isAssigned && user.branch?.toString() !== branchId) {
        return res.status(403).json({ success: false, message: 'Not authorized for this branch' });
      }
    }

    user.branch = branchId;
    await user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(user._id).populate('branch').populate('assignedBranches');

    res.json({
      success: true,
      message: 'Active branch switched successfully',
      branch: updatedUser.branch,
    });
  } catch (error) {
    next(error);
  }
};

