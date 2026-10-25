const Patient = require('../models/Patient');

// @desc    Get all patients with pagination & search
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10, branchId } = req.query;
    const query = {};

    if (branchId) {
      query.branch = branchId;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { mrn: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('branch', 'name code')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res, next) => {
  try {
    // Check for duplicate phone or MRN
    const { phone, fullName, age, gender, address, allergies, bloodGroup, emergencyContact, branch } = req.body;

    const existingPatient = await Patient.findOne({ phone, fullName: { $regex: new RegExp(`^${fullName}$`, 'i') } });
    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: `Duplicate Patient Warning: A patient named '${fullName}' with phone '${phone}' is already registered with MRN: ${existingPatient.mrn}`,
        patient: existingPatient,
      });
    }

    // Auto-generate MRN
    const currentYear = new Date().getFullYear();
    const count = await Patient.countDocuments();
    const mrn = `MK-${currentYear}-${String(count + 1).padStart(5, '0')}`;

    const newPatient = await Patient.create({
      mrn,
      fullName,
      age,
      gender,
      phone,
      address,
      allergies,
      bloodGroup,
      emergencyContact,
      branch: branch || req.user.branch?._id,
      registeredBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: newPatient,
    });
  } catch (error) {
    next(error);
  }
};

