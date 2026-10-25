const PurchaseEntry = require('../models/PurchaseEntry');
const MedicineMaster = require('../models/MedicineMaster');
const MedicineBatch = require('../models/MedicineBatch');

// Get next MRN
exports.getNextMrn = async (req, res, next) => {
  try {
    const latest = await PurchaseEntry.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (latest && latest.mrnNo) {
      const match = latest.mrnNo.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0], 10) + 1;
      }
    }
    const formattedMrn = `FAPU${String(nextNum).padStart(7, '0')}`;
    res.json({ success: true, nextMrn: formattedMrn });
  } catch (error) {
    next(error);
  }
};

// Get list of purchases (Purchase Book / Register)
exports.getPurchases = async (req, res, next) => {
  try {
    const { from, to, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { mrnNo: regex },
        { billNo: regex },
        { supplierName: regex },
      ];
    }

    // Filter by date if provided
    if (from || to) {
      query.purchDateBs = {};
      if (from) query.purchDateBs.$gte = from;
      if (to) query.purchDateBs.$lte = to;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await PurchaseEntry.countDocuments(query);
    const purchases = await PurchaseEntry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Summary totals
    const aggregates = await PurchaseEntry.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          totalNet: { $sum: '$netAmount' },
          totalVat: { $sum: '$vat' },
          totalDiscount: { $sum: '$discount' },
        },
      },
    ]);

    res.json({
      success: true,
      data: purchases,
      summary: aggregates[0] || { totalAmount: 0, totalNet: 0, totalVat: 0, totalDiscount: 0 },
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

// Get single purchase by ID
exports.getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await PurchaseEntry.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase record not found' });
    }
    res.json({ success: true, data: purchase });
  } catch (error) {
    next(error);
  }
};

// Create / Post new purchase
exports.createPurchase = async (req, res, next) => {
  try {
    const {
      fiscalYear,
      mrnNo,
      purchDateAd,
      purchDateBs,
      billNo,
      billDateAd,
      billDateBs,
      supplierCode,
      supplierName,
      division,
      vatType,
      discountOn,
      ccChargeType,
      companywisePurchase,
      discountType,
      ccFreeExclude,
      vatOnFreeActive,
      lessCustom,
      cashParty,
      manualMrn,
      marginText,
      stockistPurchase,
      items,
      totalAmount,
      ccCharge,
      ccFree,
      discount,
      vat,
      freeVat,
      netAmount,
      branchId,
    } = req.body;

    let finalMrn = mrnNo;
    if (!finalMrn) {
      const latest = await PurchaseEntry.findOne().sort({ createdAt: -1 });
      let nextNum = 1;
      if (latest && latest.mrnNo) {
        const match = latest.mrnNo.match(/\d+$/);
        if (match) nextNum = parseInt(match[0], 10) + 1;
      }
      finalMrn = `FAPU${String(nextNum).padStart(7, '0')}`;
    }

    const newPurchase = await PurchaseEntry.create({
      mrnNo: finalMrn,
      fiscalYear: fiscalYear || 'FY7879',
      purchDateAd: purchDateAd ? new Date(purchDateAd) : new Date(),
      purchDateBs: purchDateBs || '2078/05/14',
      billNo: billNo || '',
      billDateAd: billDateAd ? new Date(billDateAd) : undefined,
      billDateBs: billDateBs || '2078/05/01',
      supplierCode: supplierCode || '',
      supplierName: supplierName || 'SUPPLIER #',
      division: division || '0',
      vatType: vatType || 'Inclusive',
      discountOn: discountOn || 'After CC',
      ccChargeType: ccChargeType || 'Inclusive',
      companywisePurchase: companywisePurchase || 'NO',
      discountType: discountType || 'Invoicewise',
      ccFreeExclude: Boolean(ccFreeExclude),
      vatOnFreeActive: Boolean(vatOnFreeActive),
      lessCustom: lessCustom || 'N',
      cashParty: cashParty || 'N',
      manualMrn: manualMrn || '',
      marginText: marginText || '',
      count: items ? items.length : 0,
      stockistPurchase: Boolean(stockistPurchase),
      items: items || [],
      totalAmount: Number(totalAmount) || 0,
      ccCharge: Number(ccCharge) || 0,
      ccFree: Number(ccFree) || 0,
      discount: Number(discount) || 0,
      vat: Number(vat) || 0,
      freeVat: Number(freeVat) || 0,
      netAmount: Number(netAmount) || 0,
      username: req.user?.name || 'ADMINISTRATOR',
      branch: branchId || req.user?.branch,
    });

    // Update MedicineMaster stock and MedicineBatch for each purchased item
    if (Array.isArray(items)) {
      for (const item of items) {
        if (!item.mdCode) continue;

        const medicine = await MedicineMaster.findOne({ mdCode: item.mdCode });
        if (medicine) {
          const qtyToAdd = Number(item.totalQty) || Number(item.qty) || 0;
          medicine.currentStock = (medicine.currentStock || 0) + qtyToAdd;
          if (item.iPrice) medicine.cPrice = Number(item.iPrice);
          if (item.sPrice) medicine.sPrice = Number(item.sPrice);
          if (item.mrp) medicine.mrp = Number(item.mrp);
          await medicine.save();

          // Create/update batch
          if (item.batch) {
            const expDate = item.expiry ? new Date(item.expiry) : new Date(Date.now() + 365 * 24 * 3600 * 1000);
            await MedicineBatch.create({
              medicine: medicine._id,
              batchNumber: String(item.batch).trim().toUpperCase(),
              expiryDate: isNaN(expDate.getTime()) ? new Date() : expDate,
              purchasePrice: Number(item.iPrice) || 0,
              mrp: Number(item.mrp) || Number(item.sPrice) || 0,
              currentStock: qtyToAdd,
              initialStock: qtyToAdd,
              supplier: supplierName || 'Supplier',
              branch: branchId || req.user?.branch || medicine.branch,
            });
          }
        }
      }
    }

    res.status(201).json({
      success: true,
      message: `Purchase ${finalMrn} posted successfully`,
      data: newPurchase,
    });
  } catch (error) {
    next(error);
  }
};

