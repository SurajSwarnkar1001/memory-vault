import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['text', 'link', 'voice', 'audio', 'video', 'image'],
      required: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    textContent: {
      type: String,
      trim: true,
      default: '',
    },
    fileKey: {
      type: String,
      trim: true,
    },
    fileName: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    entryDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index to help with sorting and filtering entries
entrySchema.index({ projectId: 1, entryDate: -1 });

const Entry = mongoose.model('Entry', entrySchema);
export default Entry;
