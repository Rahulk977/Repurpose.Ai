const multer = require('multer');
const Content = require('../models/Content');
const User = require('../models/User');
const aiService = require('../services/aiService');

// ─── Multer: in-memory storage ────────────────────────────────────────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/wav', 'audio/wave',
      'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac', 'audio/webm',
      'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo',
    ];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload an audio or video file.`));
    }
  },
}).single('audio');

exports.uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 25MB.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// ─── POST /api/content/generate ──────────────────────────────────────────────
exports.generateContent = async (req, res) => {
  const startTime = Date.now();

  try {
    const user = await User.findById(req.user._id);

    // Check usage limits
    user.resetMonthlyUsageIfNeeded();
    if (!user.canGenerate()) {
      return res.status(403).json({
        message: `Monthly generation limit reached (${User.PLAN_LIMITS[user.subscription.plan]}/${user.subscription.plan} plan). Please upgrade your plan.`,
        upgrade: true,
        currentPlan: user.subscription.plan,
        limit: User.PLAN_LIMITS[user.subscription.plan],
      });
    }

    const { inputType, youtubeUrl, textContent, title, formats } = req.body;
    const selectedFormats = formats
      ? (typeof formats === 'string' ? JSON.parse(formats) : formats)
      : ['twitter', 'linkedin', 'instagram', 'blog', 'email', 'youtube_shorts'];

    const isPriority = user.subscription.plan === 'creator';

    // Create content record immediately
    const contentDoc = await Content.create({
      userId: user._id,
      title: (title || `Content — ${new Date().toLocaleDateString()}`).trim(),
      inputType,
      selectedFormats,
      processingStatus: 'pending',
      isPriority,
    });

    // ── Step 1: Get transcript ────────────────────────────────────────────────
    let transcript = '';

    try {
      if (inputType === 'youtube') {
        if (!youtubeUrl) throw new Error('YouTube URL is required.');
        contentDoc.processingStatus = 'transcribing';
        await contentDoc.save();
        transcript = await aiService.fetchYouTubeTranscript(youtubeUrl);
        contentDoc.originalInput.youtubeUrl = youtubeUrl;

      } else if (inputType === 'audio') {
        if (!req.file) throw new Error('Audio file is required.');
        contentDoc.processingStatus = 'transcribing';
        await contentDoc.save();
        transcript = await aiService.transcribeAudio(req.file.buffer, req.file.originalname, req.file.mimetype);
        contentDoc.originalInput.audioFileName = req.file.originalname;
        contentDoc.originalInput.audioFileSize = req.file.size;

      } else if (inputType === 'text') {
        if (!textContent || textContent.trim().length < 30) {
          throw new Error('Text content must be at least 30 characters.');
        }
        transcript = textContent.trim();
        contentDoc.originalInput.textContent = textContent;

      } else {
        throw new Error('Invalid input type. Must be: youtube, audio, or text.');
      }

      contentDoc.originalInput.transcript = transcript;
    } catch (transcriptErr) {
      contentDoc.processingStatus = 'failed';
      contentDoc.errorMessage = transcriptErr.message;
      await contentDoc.save();
      return res.status(422).json({
        message: transcriptErr.message,
        contentId: contentDoc._id,
      });
    }

    if (!transcript || transcript.trim().length < 20) {
      contentDoc.processingStatus = 'failed';
      contentDoc.errorMessage = 'Extracted transcript is too short to process.';
      await contentDoc.save();
      return res.status(422).json({ message: 'Content is too short. Please provide more text.' });
    }

    // ── Step 2: Generate AI content ───────────────────────────────────────────
    contentDoc.processingStatus = 'generating';
    await contentDoc.save();

    const { results, totalTokens, model } = await aiService.generateContent(
      transcript,
      selectedFormats,
      isPriority
    );

    // ── Step 3: Save results ──────────────────────────────────────────────────
    contentDoc.generatedContent = results.map((r) => ({
      type: r.type,
      content: r.content,
      isEdited: false,
      regenerationCount: 0,
    }));
    contentDoc.processingStatus = 'completed';
    contentDoc.metadata = {
      wordCount: transcript.split(/\s+/).length,
      processingTimeMs: Date.now() - startTime,
      tokensUsed: totalTokens,
      modelUsed: model,
    };
    await contentDoc.save();

    // ── Step 4: Update user usage ─────────────────────────────────────────────
    user.incrementUsage();
    await user.save();

    res.json({
      message: 'Content generated successfully.',
      content: contentDoc,
      remainingGenerations: user.remainingGenerations,
      processingTimeMs: Date.now() - startTime,
    });
  } catch (err) {
    console.error('generateContent error:', err);
    res.status(500).json({ message: 'An unexpected error occurred. Please try again.' });
  }
};

// ─── GET /api/content/history ─────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;
    const { inputType, search } = req.query;

    const query = { userId: req.user._id, processingStatus: 'completed' };
    if (inputType && ['youtube', 'audio', 'text'].includes(inputType)) {
      query.inputType = inputType;
    }
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const [contents, total] = await Promise.all([
      Content.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-originalInput.transcript -originalInput.textContent')
        .lean(),
      Content.countDocuments(query),
    ]);

    res.json({
      contents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error('getHistory error:', err);
    res.status(500).json({ message: 'Failed to fetch history.' });
  }
};

// ─── GET /api/content/:id ─────────────────────────────────────────────────────
exports.getContent = async (req, res) => {
  try {
    const content = await Content.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!content) return res.status(404).json({ message: 'Content not found.' });
    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch content.' });
  }
};

// ─── PUT /api/content/:id ─────────────────────────────────────────────────────
exports.updateContentItem = async (req, res) => {
  try {
    const { contentType, newContent } = req.body;
    if (!contentType || !newContent) {
      return res.status(400).json({ message: 'contentType and newContent are required.' });
    }

    const content = await Content.findOne({ _id: req.params.id, userId: req.user._id });
    if (!content) return res.status(404).json({ message: 'Content not found.' });

    const item = content.generatedContent.find((c) => c.type === contentType);
    if (!item) return res.status(404).json({ message: `Format "${contentType}" not found.` });

    item.content = newContent;
    item.isEdited = true;
    await content.save();

    res.json({ message: 'Content updated.', content });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update content.' });
  }
};

// ─── POST /api/content/:id/regenerate ────────────────────────────────────────
exports.regenerateItem = async (req, res) => {
  try {
    const { contentType } = req.body;
    if (!contentType) return res.status(400).json({ message: 'contentType is required.' });

    const content = await Content.findOne({ _id: req.params.id, userId: req.user._id });
    if (!content) return res.status(404).json({ message: 'Content not found.' });

    const user = await User.findById(req.user._id);
    user.resetMonthlyUsageIfNeeded();
    if (!user.canGenerate()) {
      return res.status(403).json({
        message: 'Monthly generation limit reached. Please upgrade your plan.',
        upgrade: true,
      });
    }

    const transcript = content.originalInput.transcript || content.originalInput.textContent || '';
    if (!transcript) return res.status(422).json({ message: 'Original content not found for regeneration.' });

    const isPriority = user.subscription.plan === 'creator';
    const result = await aiService.regenerateSingle(transcript, contentType, isPriority);

    const item = content.generatedContent.find((c) => c.type === contentType);
    if (item) {
      item.content = result.content;
      item.regenerationCount += 1;
      item.lastRegeneratedAt = new Date();
    } else {
      content.generatedContent.push({
        type: contentType,
        content: result.content,
        regenerationCount: 1,
        lastRegeneratedAt: new Date(),
      });
    }
    await content.save();

    user.incrementUsage();
    await user.save();

    res.json({
      message: 'Content regenerated.',
      content,
      remainingGenerations: user.remainingGenerations,
    });
  } catch (err) {
    console.error('regenerateItem error:', err);
    res.status(500).json({ message: 'Failed to regenerate content.' });
  }
};

// ─── DELETE /api/content/:id ──────────────────────────────────────────────────
exports.deleteContent = async (req, res) => {
  try {
    const result = await Content.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!result) return res.status(404).json({ message: 'Content not found.' });
    res.json({ message: 'Content deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete content.' });
  }
};

// ─── GET /api/content/stats ───────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const [total, byType] = await Promise.all([
      Content.countDocuments({ userId, processingStatus: 'completed' }),
      Content.aggregate([
        { $match: { userId, processingStatus: 'completed' } },
        { $group: { _id: '$inputType', count: { $sum: 1 } } },
      ]),
    ]);

    const user = await User.findById(userId);

    res.json({
      stats: {
        totalGenerations: total,
        byInputType: Object.fromEntries(byType.map((b) => [b._id, b.count])),
        thisMonth: user.usage.generationsThisMonth,
        totalAllTime: user.usage.totalGenerations,
        remainingGenerations: user.remainingGenerations,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
};
