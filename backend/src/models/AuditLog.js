const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    username: String,
    userRole: String,
    entity: {
      type: String,
      required: true,
      index: true,
    },
    entityId: String,
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);

