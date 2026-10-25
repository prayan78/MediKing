const Company = require('../models/Company');

// Get all companies with search & filter
exports.getCompanies = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 100 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { companyName: regex },
        { refCode: regex },
        { address: regex },
      ];
      const numericCode = parseInt(search.trim(), 10);
      if (!isNaN(numericCode)) {
        query.$or.push({ compCode: numericCode });
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .sort({ compCode: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: companies,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single company by ID
exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

// Create company
exports.createCompany = async (req, res, next) => {
  try {
    let { compCode, companyName, refCode, ncBill, superStock, custom, ncTrade, address, phone, panNo } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ success: false, message: 'Company Name is required' });
    }

    if (!compCode) {
      const highest = await Company.findOne().sort({ compCode: -1 });
      compCode = highest && highest.compCode ? highest.compCode + 1 : 101;
    }

    const existing = await Company.findOne({ compCode });
    if (existing) {
      return res.status(409).json({ success: false, message: `Company Code ${compCode} already exists` });
    }

    const company = await Company.create({
      compCode,
      companyName: companyName.trim(),
      refCode: refCode ? refCode.trim() : '',
      ncBill: ncBill !== undefined ? Boolean(ncBill) : true,
      superStock: superStock !== undefined ? Boolean(superStock) : false,
      custom: custom !== undefined ? Number(custom) : 0,
      ncTrade: ncTrade !== undefined ? Boolean(ncTrade) : false,
      address,
      phone,
      panNo,
    });

    res.status(201).json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

// Update company
exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, data: company });
  } catch (error) {
    next(error);
  }
};

