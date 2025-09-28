import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import { Note } from '../models/Note';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all notes for user (with pagination and filtering)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().trim(),
  query('tag').optional().trim(),
  query('archived').optional().isBoolean().withMessage('Archived must be a boolean'),
  query('search').optional().trim(),
], asyncHandler(async (req: any, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const userId = req.user.userId;
  const {
    page = 1,
    limit = 20,
    category,
    tag,
    archived = false,
    search,
  } = req.query;

  // Build query
  const queryConditions: any = {
    $or: [
      { author: userId },
      { collaborators: userId },
    ],
    isArchived: archived === 'true',
  };

  if (category) {
    queryConditions.category = category;
  }

  if (tag) {
    queryConditions.tags = tag;
  }

  if (search) {
    queryConditions.$text = { $search: search };
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query
  const notes = await Note.find(queryConditions)
    .populate('author', 'name email avatar')
    .populate('collaborators', 'name email avatar')
    .populate('lastEditedBy', 'name email avatar')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Note.countDocuments(queryConditions);

  res.json({
    success: true,
    data: {
      notes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
}));

// Create new note
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
], asyncHandler(async (req: any, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const userId = req.user.userId;
  const { title, content = '', category = 'General', tags = [] } = req.body;

  const note = new Note({
    title,
    content,
    author: userId,
    lastEditedBy: userId,
    category,
    tags,
  });

  await note.save();
  await note.populate('author', 'name email avatar');

  logger.info(`New note created by user ${userId}: ${title}`);

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: {
      note,
    },
  });
}));

// Get specific note
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid note ID'),
], asyncHandler(async (req: any, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const userId = req.user.userId;
  const noteId = req.params.id;

  const note = await Note.findOne({
    _id: noteId,
    $or: [
      { author: userId },
      { collaborators: userId },
    ],
  })
  .populate('author', 'name email avatar')
  .populate('collaborators', 'name email avatar')
  .populate('lastEditedBy', 'name email avatar');

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found or access denied',
    });
  }

  res.json({
    success: true,
    data: {
      note,
    },
  });
}));

// Update note
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid note ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content').optional().trim(),
  body('category').optional().trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isArchived').optional().isBoolean().withMessage('isArchived must be a boolean'),
], asyncHandler(async (req: any, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const userId = req.user.userId;
  const noteId = req.params.id;
  const updateData = req.body;

  // Find note and check permissions
  const note = await Note.findById(noteId);
  
  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found',
    });
  }

  // Check if user can edit (author or collaborator)
  const canEdit = note.author.toString() === userId || 
                  note.collaborators.some(collabId => collabId.toString() === userId);
  
  if (!canEdit) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to edit this note',
    });
  }

  // Update note
  Object.assign(note, updateData);
  note.lastEditedBy = new mongoose.Types.ObjectId(userId);
  note.version += 1;

  await note.save();
  await note.populate('author', 'name email avatar');
  await note.populate('collaborators', 'name email avatar');
  await note.populate('lastEditedBy', 'name email avatar');

  logger.info(`Note ${noteId} updated by user ${userId}`);

  res.json({
    success: true,
    message: 'Note updated successfully',
    data: {
      note,
    },
  });
}));

// Delete note
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid note ID'),
], asyncHandler(async (req: any, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const userId = req.user.userId;
  const noteId = req.params.id;

  // Only author can delete the note
  const note = await Note.findOneAndDelete({
    _id: noteId,
    author: userId,
  });

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found or you are not the author',
    });
  }

  logger.info(`Note ${noteId} deleted by user ${userId}`);

  res.json({
    success: true,
    message: 'Note deleted successfully',
  });
}));

// Add collaborator to note
router.post('/:id/collaborate', [
  param('id').isMongoId().withMessage('Invalid note ID'),
  body('userId').isMongoId().withMessage('Invalid user ID'),
], asyncHandler(async (req: any, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const currentUserId = req.user.userId;
  const noteId = req.params.id;
  const { userId: collaboratorId } = req.body;

  // Find note and check if current user is the author
  const note = await Note.findOne({
    _id: noteId,
    author: currentUserId,
  });

  if (!note) {
    return res.status(404).json({
      success: false,
      message: 'Note not found or you are not the author',
    });
  }

  // Check if collaborator exists
  const collaborator = await User.findById(collaboratorId);
  if (!collaborator) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Check if user is already a collaborator
  if (note.collaborators.some(collabId => collabId.toString() === collaboratorId)) {
    return res.status(409).json({
      success: false,
      message: 'User is already a collaborator',
    });
  }

  // Add collaborator
  note.collaborators.push(new mongoose.Types.ObjectId(collaboratorId));
  await note.save();

  await note.populate('author', 'name email avatar');
  await note.populate('collaborators', 'name email avatar');

  logger.info(`User ${collaboratorId} added as collaborator to note ${noteId} by user ${currentUserId}`);

  res.json({
    success: true,
    message: 'Collaborator added successfully',
    data: {
      note,
    },
  });
}));

// Get note categories
router.get('/meta/categories', asyncHandler(async (req: any, res) => {
  const userId = req.user.userId;

  const categories = await Note.aggregate([
    {
      $match: {
        $or: [
          { author: new mongoose.Types.ObjectId(userId) },
          { collaborators: new mongoose.Types.ObjectId(userId) },
        ],
        isArchived: false,
      },
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.json({
    success: true,
    data: {
      categories,
    },
  });
}));

// Get all tags
router.get('/meta/tags', asyncHandler(async (req: any, res) => {
  const userId = req.user.userId;

  const tags = await Note.aggregate([
    {
      $match: {
        $or: [
          { author: new mongoose.Types.ObjectId(userId) },
          { collaborators: new mongoose.Types.ObjectId(userId) },
        ],
        isArchived: false,
      },
    },
    {
      $unwind: '$tags',
    },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.json({
    success: true,
    data: {
      tags,
    },
  });
}));

export default router;