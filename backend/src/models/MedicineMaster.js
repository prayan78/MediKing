const mongoose = require('mongoose');

const genericItemSchema = new mongoose.Schema(
  {
    genId: {
      type: Number,
      required: true,
    },
    genericName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const medicineMasterSchema = new mongoose.Schema(
  {
    mdCode: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    genericName: {
      type: String,
      trim: true,
      default: '',
    },
    generics: [genericItemSchema],
    companyCode: {
      type: Number,
      default: 0,
    },
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
    isInsuranceProduct: {
      type: Boolean,
      default: false,
    },
    vat: {
      type: String,
      default: 'N', // 'N', 'Y', or numeric percentage string
    },
    vatPercent: {
      type: Number,
      default: 0,
    },
    vatOnFree: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: 'General',
    },
    categoryCode: {
      type: Number,
      default: 0,
    },
    groupName: {
      type: String,
      default: '',
    },
    groupCode: {
      type: Number,
      default: 0,
    },
    refCode: {
      type: String,
      default: '',
    },
    ssfCode: {
      type: String, // Social Security Fund code
      default: '',
    },
    unit: {
      type: String,
      default: 'TAB',
      trim: true,
    },
    wsUnit: {
      type: Number,
      default: 1,
    },
    packing: {
      type: String,
      default: '1',
    },
    ccCharge: {
      type: Number,
      default: 0,
    },
    barcode: {
      type: String,
      default: '',
    },
    prodDivision: {
      type: Number,
      default: 0,
    },
    inBox: {
      type: Number,
      default: 0,
    },
    onlinePublished: {
      type: Boolean,
      default: false,
    },

    // Pricing Fields (from MediPro)
    iPrice: {
      type: Number,
      default: 0, // Invoice / Initial Price
    },
    excise: {
      type: Number,
      default: 0,
    },
    exPrice: {
      type: Number,
      default: 0,
    },
    cPrice: {
      type: Number,
      default: 0, // Cost Price
    },
    margin: {
      type: Number,
      default: 0, // Percentage margin
    },
    sPrice: {
      type: Number,
      required: true,
      default: 0, // Selling Price
    },
    mrp: {
      type: Number,
      default: 0,
    },
    custom: {
      type: Number,
      default: 0,
    },
    discPercent: {
      type: Number,
      default: 0,
    },
    mrRate: {
      type: Number,
      default: 0,
    },
    insuranceRate: {
      type: Number,
      default: 0,
    },

    // Bonus Fields
    onMinQty: {
      type: Number,
      default: 0,
    },
    bonus: {
      type: Number,
      default: 0,
    },
    onMinLot: {
      type: Number,
      default: 0,
    },
    lotBonus: {
      type: Number,
      default: 0,
    },

    // Other Information Fields
    rackNo: {
      type: String,
      default: '',
    },
    roLevel: {
      type: Number,
      default: 0, // Reorder Level
    },
    drugCategory: {
      type: String,
      default: 'Essential',
    },
    safetyStock: {
      type: Number,
      default: 0,
    },
    salesPeriod: {
      type: Number,
      default: 0,
    },
    leadTime: {
      type: Number,
      default: 0,
    },
    stockDays: {
      type: Number,
      default: 0,
    },
    doseType: {
      type: String,
      default: '',
    },
    doseUnit: {
      type: String,
      default: '',
    },

    // Status
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

medicineMasterSchema.index({ brandName: 'text', genericName: 'text', mdCode: 1 });

module.exports = mongoose.model('MedicineMaster', medicineMasterSchema);
