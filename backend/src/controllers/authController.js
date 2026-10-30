const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Role = require('../models/Role');
const { sendPasswordResetEmail } = require('../services/emailService');

const SUPER_ADMIN_EMAIL = 'prayan78@gmail.com';

const getUserPermissions = async (role) => {
  const customRole = await Role.findOne({ slug: role, isActive: true }).select('permissions');
  return customRole ? customRole.permissions : [];
};

const generateToken = (id, tokenVersion) => {
  return jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET || 'mediking_super_secret_jwt_key_2026_healthcare_erp', {
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

    if (!user.isApproved) {
      return res.status(403).json({ success: false, message: 'Your account is awaiting administrator approval.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'User account is inactive. Please contact your administrator.' });
    }

    if (user.email === SUPER_ADMIN_EMAIL && user.role !== 'super_admin') {
      user.role = 'super_admin';
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

    const token = generateToken(user._id, user.tokenVersion);
    const permissions = await getUserPermissions(user.role);

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
        permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists for that email, a password reset link will be sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      user.passwordResetTokenHash = undefined;
      user.passwordResetExpiresAt = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('[Password Reset Email Error]:', error.message);
      return res.status(503).json({
        success: false,
        message: 'Password reset email could not be sent. Please contact an administrator.',
      });
    }

    return res.json({
      success: true,
      message: 'If an account exists for that email, a password reset link will be sent.',
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== 'string' || !token || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'A valid reset token and a password of at least 6 characters are required.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ success: false, message: 'This password reset link is invalid or has expired.' });
    }

    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.tokenVersion += 1;
    await user.save();

    return res.json({ success: true, message: 'Your password has been reset. You can now sign in.' });
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
    const permissions = await getUserPermissions(user.role);

    res.json({
      success: true,
      user: { ...user.toObject(), permissions },
    });
  } catch (error) {
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const { name, username, email, password, phone } = req.body;
    if (![name, username, email, password].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ success: false, message: 'Name, username, email, and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    if (normalizedEmail === SUPER_ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'This administrator account must already exist and be verified by a successful password login.',
      });
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
      phone,
      role: 'receptionist',
      isActive: false,
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message: 'Your account was created and is awaiting administrator approval.',
      user: { id: user._id, email: user.email, isApproved: user.isApproved },
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
