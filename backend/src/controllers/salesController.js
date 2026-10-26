const PharmacySale = require('../models/PharmacySale');

exports.getSalesRegister = async (req, res, next) => {
  try {
    const { page = 1, limit = 500 } = req.query;
    const parsedPage = Number.parseInt(page, 10);
    const parsedLimit = Number.parseInt(limit, 10);
    if (!Number.isInteger(parsedPage) || parsedPage < 1
      || !Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
      return res.status(400).json({ success: false, message: 'Page must be positive and limit must be between 1 and 500.' });
    }

    const branch = req.user.branch?._id || req.user.branch;
    if (!branch) {
      return res.json({ success: true, data: [] });
    }

    const query = { branch };
    const [sales, total] = await Promise.all([
      PharmacySale.find(query)
        .populate('patient', 'fullName mrn')
        .populate('dispensedBy', 'name')
        .sort({ saleDate: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .lean(),
      PharmacySale.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: sales,
      pagination: {
        total,
        page: parsedPage,
        limit: parsedLimit,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    next(error);
  }
};
