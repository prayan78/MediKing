const mongoose = require('mongoose');

const labResultEntrySchema = new mongoose.Schema({
  parameterName: String,
  resultValue: String,
  unit: String,
  referenceRange: String,
  isAbnormal: {
    type: Boolean,
    default: false,
  },
  remarks: String,
});

const labOrderTestItemSchema = new mongoose.Schema({
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LabTest',
    required: true,
  },
  testName: String,
  price: Number,
  results: [labResultEntrySchema],
  status: {
    type: String,
    enum: ['pending', 'sample_collected', 'processing', 'verified'],
    default: 'pending',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
});

const labOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    tests: [labOrderTestItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'waived'],
      default: 'pending',
    },
    orderDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    overallStatus: {
      type: String,
      enum: ['pending', 'sample_collected', 'in_progress', 'completed'],
      default: 'pending',
    },
    sampleAccessionNumber: String,
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    clinicalNotes: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LabOrder', labOrderSchema);

