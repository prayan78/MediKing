const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    testCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    testName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      enum: ['Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Serology', 'Histopathology', 'Radiology', 'General'],
      default: 'General',
    },
    sampleType: {
      type: String,
      enum: ['Whole Blood', 'Serum', 'Plasma', 'Urine', 'Stool', 'Sputum', 'Swab', 'Biopsy', 'Other'],
      default: 'Whole Blood',
    },
    price: {
      type: Number,
      required: true,
    },
    parameters: [
      {
        parameterName: String,
        unit: String,
        normalRangeMale: String,
        normalRangeFemale: String,
        normalRangeChild: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LabTest', labTestSchema);

