const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineMaster',
    required: true,
  },
  medicineName: {
    type: String,
    required: true,
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicineBatch',
    required: true,
  },
  batchNumber: {
    type: String,
    required: true,
  },
  expiryDate: Date,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const pharmacySaleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    customerName: {
      type: String,
      default: 'Cash Customer',
    },
    customerPhone: String,
    prescribedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    items: [saleItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'fonepay_qr', 'bank_card', 'credit_udharo'],
      default: 'cash',
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'due'],
      default: 'paid',
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PharmacySale', pharmacySaleSchema);

