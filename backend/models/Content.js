const mongoose = require('mongoose');

const generatedItemSchema = new mongoose.Schema(
  {
    type: { 
      type: String,
      enum: ['twitter', 'linkedin', 'instagram', 'blog', 'email', 'youtube_shorts'],
      required: true,
    },
    content: { type: String, required: true },
    isEdited: { type: Boolean, default: false },
    regenerationCount: { type: Number, default: 0 },
    lastRegeneratedAt: { type: Date, default: null },
  },
  { _id: true }
);

const contentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    inputType: {
      type: String,
      enum: ['youtube', 'audio', 'text'],
      required: true,
    },
    originalInput: {
      youtubeUrl: { type: String, default: null },
      audioFileName: { type: String, default: null },
      audioFileSize: { type: Number, default: null },
      textContent: { type: String, default: null },
      transcript: { type: String, default: null },
    },
    selectedFormats: {
      type: [String],
      default: ['twitter', 'linkedin', 'instagram', 'blog', 'email', 'youtube_shorts'],
    },
    generatedContent: [generatedItemSchema],
    processingStatus: {
      type: String,
      enum: ['pending', 'transcribing', 'generating', 'completed', 'failed'],
      default: 'pending',
    },
    errorMessage: { type: String, default: null },
    metadata: {
      wordCount: { type: Number, default: 0 },
      processingTimeMs: { type: Number, default: 0 },
      tokensUsed: { type: Number, default: 0 },
      modelUsed: { type: String, default: null },
    },
    isPriority: { type: Boolean, default: false },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Compound indexes ─────────────────────────────────────────────────────────
contentSchema.index({ userId: 1, createdAt: -1 });
contentSchema.index({ userId: 1, processingStatus: 1 });

// ─── Virtual: format count ────────────────────────────────────────────────────
contentSchema.virtual('formatCount').get(function () {
  return this.generatedContent?.length || 0;
});

module.exports = mongoose.model('Content', contentSchema);
