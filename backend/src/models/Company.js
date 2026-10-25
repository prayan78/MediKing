const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    compCode: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    refCode: {
      type: String,
      trim: true,
      default: '',
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    ncBill: {
      type: Boolean,
      default: true,
    },
    superStock: {
      type: Boolean,
      default: false,
    },
    custom: {
      type: Number,
      default: 0,
    },
    ncTrade: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    panNo: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ companyName: 'text', refCode: 'text' });

module.exports = mongoose.model('Company', companySchema);

