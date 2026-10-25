const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      default: 'MediKing Hospital & Research Centre',
    },
    subTitle: {
      type: String,
      default: 'Multi-Speciality Healthcare & Diagnostic Centre',
    },
    address: {
      type: String,
      default: 'Kathmandu, Nepal',
    },
    phone: {
      type: String,
      default: '+977-1-4567890',
    },
    email: {
      type: String,
      default: 'info@medikingnepal.com',
    },
    panNumber: {
      type: String,
      default: '601234567',
    },
    pharmacyDDA: {
      type: String,
      default: 'DDA-REG-2024-998',
    },
    currencySymbol: {
      type: String,
      default: 'Rs.',
    },
    currencyCode: {
      type: String,
      default: 'NPR',
    },
    vatPercentage: {
      type: Number,
      default: 13,
    },
    invoicePrefix: {
      type: String,
      default: 'MK-INV-',
    },
    prescriptionPrefix: {
      type: String,
      default: 'RX-',
    },
    opdTokenPrefix: {
      type: String,
      default: 'OPD-',
    },
    irdSyncEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SystemSetting', systemSettingSchema);

