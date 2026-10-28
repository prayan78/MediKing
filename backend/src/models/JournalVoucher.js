const mongoose = require('mongoose');

const journalLineSchema = new mongoose.Schema(
  {
    accountCode: { type: String, required: true, trim: true },
    accountName: { type: String, required: true, trim: true },
    narration: { type: String, trim: true, default: '' },
    billDate: { type: Date },
    debit: { type: Number, min: 0, default: 0 },
    credit: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const journalVoucherSchema = new mongoose.Schema(
  {
    voucherNo: { type: String, required: true, unique: true, trim: true },
    voucherType: { type: String, default: 'JV', enum: ['JV'] },
    fiscalYear: { type: String, required: true, trim: true },
    voucherDate: { type: Date, required: true, index: true },
    voucherDateBs: { type: String, trim: true, default: '' },
    lines: {
      type: [journalLineSchema],
      validate: {
        validator: (lines) => lines.length >= 2,
        message: 'A journal voucher must contain at least two lines.',
      },
    },
    totalDebit: { type: Number, required: true, min: 0 },
    totalCredit: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['POSTED'], default: 'POSTED' },
    username: { type: String, default: 'ADMINISTRATOR' },
    branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  },
  { timestamps: true }
);

journalVoucherSchema.index({ voucherDate: 1, 'lines.accountCode': 1 });

module.exports = mongoose.model('JournalVoucher', journalVoucherSchema);
