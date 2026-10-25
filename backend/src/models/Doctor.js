const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    medicalCouncilNumber: {
      type: String,
      trim: true,
      required: true,
    },
    opdConsultationFee: {
      type: Number,
      default: 500,
    },
    followUpFee: {
      type: Number,
      default: 300,
    },
    roomNumber: {
      type: String,
    },
    availableDays: [
      {
        type: String,
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    ],
    shiftStartTime: {
      type: String,
      default: '09:00',
    },
    shiftEndTime: {
      type: String,
      default: '17:00',
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

module.exports = mongoose.model('Doctor', doctorSchema);

