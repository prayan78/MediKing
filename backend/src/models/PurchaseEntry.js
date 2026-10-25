const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineMaster',
    },
    mdCode: {
      type: Number,
      required: true,
    },
    particular: {
      type: String,
      required: true,
      trim: true,
    },
    wsunit: {
      type: String,
      default: '',
    },
    pack: {
      type: String,
      default: '1',
    },
    batch: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    expiry: {
      type: String, // e.g. "2026/08/29" or Date format string
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      default: 0,
    },
    free: {
      type: Number,
      default: 0,
    },
    totalQty: {
      type: Number,
      required: true,
      default: 0,
    },
    iPrice: {
      type: Number,
      required: true,
      default: 0, // Cost Price
    },
    net: {
      type: Number,
      required: true,
      default: 0,
    },
    sPrice: {
      type: Number,
      default: 0, // Selling Price
    },
    margin: {
      type: Number,
      default: 0,
    },
    mrp: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const purchaseEntrySchema = new mongoose.Schema(
  {
    mrnNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true, // e.g. "FAPU0000001", "FAPU0000002"
    },
    fiscalYear: {
      type: String,
      default: 'FY7879',
    },
    purchDateAd: {
      type: Date,
      default: Date.now,
    },
    purchDateBs: {
      type: String,
      default: '2078/05/14',
    },
    billNo: {
      type: String,
      trim: true,
      default: '',
    },
    billDateAd: {
      type: Date,
    },
    billDateBs: {
      type: String,
      default: '2078/05/01',
    },
    supplierCode: {
      type: String,
      default: '',
    },
    supplierName: {
      type: String,
      required: true,
      trim: true,
      default: 'SUPPLIER #',
    },
    division: {
      type: String,
      default: '0',
    },
    vatType: {
      type: String,
      enum: ['Inclusive', 'Exclusive'],
      default: 'Inclusive',
    },
    discountOn: {
      type: String,
      enum: ['After CC', 'Before CC'],
      default: 'After CC',
    },
    ccChargeType: {
      type: String,
      enum: ['Inclusive', 'Exclusive'],
      default: 'Inclusive',
    },
    companywisePurchase: {
      type: String,
      enum: ['NO', 'YES'],
      default: 'NO',
    },
    discountType: {
      type: String,
      enum: ['Invoicewise', 'Itemwise'],
      default: 'Invoicewise',
    },
    ccFreeExclude: {
      type: Boolean,
      default: false,
    },
    vatOnFreeActive: {
      type: Boolean,
      default: false,
    },
    lessCustom: {
      type: String,
      default: 'N',
    },
    cashParty: {
      type: String,
      default: 'N',
    },
    manualMrn: {
      type: String,
      default: '',
    },
    marginText: {
      type: String,
      default: '',
    },
    count: {
      type: Number,
      default: 0,
    },
    stockistPurchase: {
      type: Boolean,
      default: false,
    },
    items: [purchaseItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    ccCharge: {
      type: Number,
      default: 0,
    },
    ccFree: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    vat: {
      type: Number,
      default: 0,
    },
    freeVat: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    userCode: {
      type: Number,
      default: 0,
    },
    age: {
      type: Number,
      default: 0,
    },
    username: {
      type: String,
      default: 'ADMINISTRATOR',
    },
    status: {
      type: String,
      enum: ['POSTED', 'CANCELLED'],
      default: 'POSTED',
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
  },
  {
    timestamps: true,
  }
);

purchaseEntrySchema.index({ mrnNo: 'text', billNo: 'text', supplierName: 'text' });

module.exports = mongoose.model('PurchaseEntry', purchaseEntrySchema);

