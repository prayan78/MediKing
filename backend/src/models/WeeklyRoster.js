const mongoose = require('mongoose');

const rosterDaySchema = new mongoose.Schema(
  {
    inTime: { type: String, default: '00:00' },
    outTime: { type: String, default: '00:00' },
    shift: { type: String, default: 'O' },
    offDay: { type: Boolean, default: false },
    holiday: { type: Boolean, default: false },
    leave: { type: Boolean, default: false },
  },
  { _id: false }
);

const weeklyRosterSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekStart: {
      type: Date,
      required: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    shifts: {
      type: [rosterDaySchema],
      validate: {
        validator: (shifts) => shifts.length === 7,
        message: 'A weekly roster must contain exactly seven days.',
      },
      required: true,
    },
  },
  { timestamps: true }
);

weeklyRosterSchema.index({ branch: 1, employee: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyRoster', weeklyRosterSchema);
