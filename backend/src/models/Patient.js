const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    mrn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      index: true,
    },
    age: {
      type: Number,
      required: true,
    },
    ageUnit: {
      type: String,
      enum: ['Years', 'Months', 'Days'],
      default: 'Years',
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      street: String,
      city: String,
      district: String,
      province: String,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
      default: 'Unknown',
    },
    allergies: [String],
    chronicConditions: [String],
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    outstandingBalance: {
      type: Number,
      default: 0,
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

patientSchema.index({ fullName: 'text', phone: 'text', mrn: 'text' });

module.exports = mongoose.model('Patient', patientSchema);

