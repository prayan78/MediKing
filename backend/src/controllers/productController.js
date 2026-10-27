const MedicineMaster = require('../models/MedicineMaster');
const MedicineBatch = require('../models/MedicineBatch');
const GenericMedicine = require('../models/GenericMedicine');

exports.getGenericMedicines = async (req, res, next) => {
  try {
    const branch = req.user.branch?._id || req.user.branch;
    const [medicines, batchStocks, savedGenerics] = await Promise.all([
      MedicineMaster.find({ status: 'Active' })
        .select('mdCode brandName genericName generics unit wsUnit rackNo roLevel bonus cPrice mrp sPrice vatPercent')
        .sort({ brandName: 1 })
        .lean(),
      branch
        ? MedicineBatch.aggregate([
            { $match: { branch } },
            { $group: { _id: '$medicine', quantity: { $sum: '$currentStock' } } },
          ])
        : Promise.resolve([]),
      GenericMedicine.find().select('genericName').sort({ genericName: 1 }).lean(),
    ]);

    const stockByMedicine = new Map(
      batchStocks.map((stock) => [stock._id.toString(), stock.quantity])
    );
    const genericGroups = new Map();

    savedGenerics.forEach(({ genericName }) => {
      const key = genericName.trim().toLocaleUpperCase();
      if (key && !genericGroups.has(key)) {
        genericGroups.set(key, { genericName: genericName.trim(), brands: [] });
      }
    });

    medicines.forEach((medicine) => {
      const names = Array.isArray(medicine.generics) && medicine.generics.length
        ? medicine.generics.map((generic) => generic.genericName)
        : (medicine.genericName || '').split(',');
      const uniqueNames = new Map();
      names.forEach((name) => {
        const displayName = name?.trim();
        if (displayName) uniqueNames.set(displayName.toLocaleUpperCase(), displayName);
      });

      uniqueNames.forEach((displayName, key) => {
        if (!genericGroups.has(key)) {
          genericGroups.set(key, { genericName: displayName, brands: [] });
        }
        genericGroups.get(key).brands.push({
          ...medicine,
          currentStock: stockByMedicine.get(medicine._id.toString()) || 0,
        });
      });
    });

    res.json({
      success: true,
      data: [...genericGroups.values()].sort((a, b) => a.genericName.localeCompare(b.genericName)),
    });
  } catch (error) {
    next(error);
  }
};

exports.createGenericMedicine = async (req, res, next) => {
  try {
    const genericName = typeof req.body.genericName === 'string'
      ? req.body.genericName.trim().replace(/\s+/g, ' ')
      : '';

    if (!genericName) {
      return res.status(400).json({ success: false, message: 'Generic name is required.' });
    }

    const normalizedName = genericName.toLocaleUpperCase();
    const escapedName = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const [existingGeneric, existingMedicine] = await Promise.all([
      GenericMedicine.findOne({
        genericName: { $regex: `^${escapedName}$`, $options: 'i' },
      }),
      MedicineMaster.findOne({
        $or: [
          { genericName: { $regex: `(^|,\\s*)${escapedName}(\\s*,|$)`, $options: 'i' } },
          { 'generics.genericName': { $regex: `^${escapedName}$`, $options: 'i' } },
        ],
      }),
    ]);
    const existing = existingGeneric || existingMedicine;
    if (existing) {
      return res.status(409).json({ success: false, message: 'This generic name already exists.' });
    }

    const genericMedicine = await GenericMedicine.create({ genericName: normalizedName });
    res.status(201).json({
      success: true,
      message: 'Generic name added successfully.',
      data: { genericName: genericMedicine.genericName, brands: [] },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'This generic name already exists.' });
    }
    next(error);
  }
};

// @desc    Get all products with search & filters
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    const { search, status, company, page, limit } = req.query;
    const query = {};

    // Filter by status (All, Active, Inactive)
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by company
    if (company && company !== 'All' && company !== '0') {
      if (!isNaN(company)) {
        query.companyCode = Number(company);
      } else {
        query.companyName = { $regex: company, $options: 'i' };
      }
    }

    // Search filter
    if (search && search.trim()) {
      const s = search.trim();
      const numSearch = !isNaN(s) ? Number(s) : null;
      query.$or = [
        { brandName: { $regex: s, $options: 'i' } },
        { genericName: { $regex: s, $options: 'i' } },
        { 'generics.genericName': { $regex: s, $options: 'i' } },
        { companyName: { $regex: s, $options: 'i' } },
        { unit: { $regex: s, $options: 'i' } },
        { barcode: s },
      ];
      if (numSearch !== null) {
        query.$or.push({ mdCode: numSearch });
      }
    }

    // If page and limit provided, paginate; otherwise return full list sorted by mdCode
    if (page && limit) {
      const skip = (Number(page) - 1) * Number(limit);
      const total = await MedicineMaster.countDocuments(query);
      const products = await MedicineMaster.find(query)
        .sort({ mdCode: 1 })
        .skip(skip)
        .limit(Number(limit));

      return res.json({
        success: true,
        count: products.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: products,
      });
    }

    const products = await MedicineMaster.find(query).sort({ mdCode: 1 });
    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or mdCode
// @route   GET /api/products/:id
// @access  Private
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product;

    if (!isNaN(id)) {
      product = await MedicineMaster.findOne({ mdCode: Number(id) });
    }
    if (!product && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await MedicineMaster.findById(id);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res, next) => {
  try {
    const body = { ...req.body };

    // Auto-generate mdCode if not provided
    if (!body.mdCode) {
      const highest = await MedicineMaster.findOne().sort({ mdCode: -1 });
      body.mdCode = highest ? highest.mdCode + 1 : 10001;
    } else {
      // Check for duplicate mdCode
      const exists = await MedicineMaster.findOne({ mdCode: Number(body.mdCode) });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: `Product with MD Code ${body.mdCode} already exists (${exists.brandName})`,
        });
      }
    }

    // Synchronize genericName field from generics array if given
    if (Array.isArray(body.generics)) {
      body.genericName = body.generics.map((g) => g.genericName).join(', ');
    }

    // Set isActive based on status
    if (body.status) {
      body.isActive = body.status === 'Active';
    }

    const product = await MedicineMaster.create(body);
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    // Synchronize genericName from generics array if given
    if (Array.isArray(body.generics)) {
      body.genericName = body.generics.map((g) => g.genericName).join(', ');
    }

    if (body.status) {
      body.isActive = body.status === 'Active';
    }

    const product = await MedicineMaster.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle product active/inactive
// @route   PATCH /api/products/:id/toggle-status
// @access  Private
exports.toggleStatus = async (req, res, next) => {
  try {
    const product = await MedicineMaster.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.status = product.status === 'Active' ? 'Inactive' : 'Active';
    product.isActive = product.status === 'Active';
    await product.save();

    res.json({
      success: true,
      message: `Product status changed to ${product.status}`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await MedicineMaster.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
