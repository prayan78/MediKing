const mongoose = require('mongoose');

const genericMedicineSchema = new mongoose.Schema(
  {
    genericName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GenericMedicine', genericMedicineSchema);
