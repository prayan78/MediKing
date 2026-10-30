const User = require('../models/User');
const Role = require('../models/Role');

const BUILT_IN_ROLES = [
  'super_admin',
  'hospital_admin',
  'doctor',
  'nurse',
  'receptionist',
  'pharmacist',
  'lab_tech',
  'lab_verifier',
  'accountant',
  'inventory_manager',
];

const canManageUser = (actor, target) => {
  if (actor.role === 'super_admin') return true;
  return !['super_admin', 'hospital_admin'].includes(target.role);
};

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('name username email role phone isActive isApproved branch createdAt')
      .populate('branch', 'name')
      .sort({ isApproved: 1, name: 1 });
    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.listRoles = async (req, res, next) => {
  try {
    const roles = await Role.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      builtInRoles: BUILT_IN_ROLES,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

exports.createRole = async (req, res, next) => {
  try {
    const { name, permissions = [] } = req.body;
    if (typeof name !== 'string' || !name.trim() || !Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'A role name and permissions array are required.' });
    }

    const normalizedName = name.trim();
    const slug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    if (!slug || BUILT_IN_ROLES.includes(slug)) {
      return res.status(400).json({ success: false, message: 'This role name is reserved.' });
    }

    const allowedPermissions = BUILT_IN_ROLES.filter((role) => !['super_admin', 'hospital_admin'].includes(role));
    if (permissions.some((permission) => !allowedPermissions.includes(permission))) {
      return res.status(400).json({ success: false, message: 'One or more selected permissions are not allowed.' });
    }

    const role = await Role.create({
      name: normalizedName,
      slug,
      permissions: [...new Set(permissions)],
    });
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

exports.updateUserAccess = async (req, res, next) => {
  try {
    const { role, isApproved, isActive } = req.body;
    if (role !== undefined && typeof role !== 'string') {
      return res.status(400).json({ success: false, message: 'Role must be a string.' });
    }
    if (isApproved !== undefined && typeof isApproved !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Approval status must be a boolean.' });
    }
    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Account status must be a boolean.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (!canManageUser(req.user, user)) {
      return res.status(403).json({ success: false, message: 'Only a super admin can manage administrator accounts.' });
    }

    if (role !== undefined) {
      const customRole = await Role.findOne({ slug: role, isActive: true });
      if (!BUILT_IN_ROLES.includes(role) && !customRole) {
        return res.status(400).json({ success: false, message: 'Select a valid role.' });
      }

      if (req.user.role !== 'super_admin' && ['super_admin', 'hospital_admin'].includes(role)) {
        return res.status(403).json({ success: false, message: 'Only a super admin can grant administrator access.' });
      }
      user.role = role;
    }

    if (isApproved !== undefined) user.isApproved = Boolean(isApproved);
    if (isActive !== undefined) user.isActive = Boolean(isActive);

    if (user.role === 'super_admin') {
      user.isApproved = true;
      user.isActive = true;
    }

    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const { name, permissions } = req.body;
    const role = await Role.findOne({ slug: req.params.slug, isActive: true });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Custom role not found.' });
    }

    if (name !== undefined) {
      if (typeof name !== 'string') {
        return res.status(400).json({ success: false, message: 'Role name must be a string.' });
      }
      const normalizedName = name.trim();
      if (!normalizedName) {
        return res.status(400).json({ success: false, message: 'Role name cannot be empty.' });
      }
      role.name = normalizedName;
    }
    if (permissions !== undefined) {
      const allowedPermissions = BUILT_IN_ROLES.filter((item) => !['super_admin', 'hospital_admin'].includes(item));
      if (!Array.isArray(permissions) || permissions.some((item) => !allowedPermissions.includes(item))) {
        return res.status(400).json({ success: false, message: 'One or more selected permissions are not allowed.' });
      }
      role.permissions = [...new Set(permissions)];
    }
    await role.save();
    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};
