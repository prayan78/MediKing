const mongoose = require('mongoose');

const medicineBatchSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MedicineMaster',
      required: true,
      index: true,
    },
    batchNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
      default: 0,
    },
    mrp: {
      type: Number,
      required: true,
      default: 0,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
    },
    initialStock: {
      type: Number,
      default: 0,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    supplier: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness per batch per medicine per branch
medicineBatchSchema.index({ medicine: 1, batchNumber: 1, branch: 1 }, { unique: true });

module.exports = mongoose.model('MedicineBatch', medicineBatchSchema);

