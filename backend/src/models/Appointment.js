const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: Number,
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
      default: Date.now,
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
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    visitType: {
      type: String,
      enum: ['New Visit', 'Follow-up', 'Emergency', 'Routine Checkup'],
      default: 'New Visit',
    },
    status: {
      type: String,
      enum: ['waiting', 'in_consultation', 'completed', 'cancelled'],
      default: 'waiting',
      index: true,
    },
    fee: {
      type: Number,
      default: 500,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'waived'],
      default: 'paid',
    },
    symptoms: [String],
    vitals: {
      bloodPressure: String, // e.g. 120/80
      pulseRate: Number, // bpm
      temperature: Number, // F
      weight: Number, // kg
      spo2: Number, // %
    },
    consultationNotes: String,
    diagnosis: [String],
    prescriptions: [
      {
        medicineName: String,
        dosage: String, // e.g. "1-0-1"
        duration: String, // e.g. "5 days"
        instructions: String, // e.g. "After food"
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

