const Branch = require('../models/Branch');

exports.getBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find({ isActive: true });
    res.json({ success: true, count: branches.length, data: branches });
  } catch (error) {
    next(error);
  }
};

exports.createBranch = async (req, res, next) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

