const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    invitedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

invitationSchema.index({ invitedEmail: 1, status: 1 });
invitationSchema.index({ invitedUser: 1, status: 1 });
invitationSchema.index({ workspace: 1, invitedEmail: 1 }, { unique: true });

const Invitation = mongoose.model('Invitation', invitationSchema);

module.exports = Invitation;
