const MedicineMaster = require('../models/MedicineMaster');

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
    if (body.generics && Array.isArray(body.generics) && body.generics.length > 0) {
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
    if (body.generics && Array.isArray(body.generics) && body.generics.length > 0) {
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

