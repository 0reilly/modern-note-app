"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const Note_1 = require("../models/Note");
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/', [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('category').optional().trim(),
    (0, express_validator_1.query)('tag').optional().trim(),
    (0, express_validator_1.query)('archived').optional().isBoolean().withMessage('Archived must be a boolean'),
    (0, express_validator_1.query)('search').optional().trim(),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    const userId = req.user.userId;
    const { page = 1, limit = 20, category, tag, archived = false, search, } = req.query;
    const queryConditions = {
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
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const notes = await Note_1.Note.find(queryConditions)
        .populate('author', 'name email avatar')
        .populate('collaborators', 'name email avatar')
        .populate('lastEditedBy', 'name email avatar')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    const total = await Note_1.Note.countDocuments(queryConditions);
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
router.post('/', [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('content').optional().trim(),
    (0, express_validator_1.body)('category').optional().trim(),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags must be an array'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    const userId = req.user.userId;
    const { title, content = '', category = 'General', tags = [] } = req.body;
    const note = new Note_1.Note({
        title,
        content,
        author: userId,
        lastEditedBy: userId,
        category,
        tags,
    });
    await note.save();
    await note.populate('author', 'name email avatar');
    logger_1.logger.info(`New note created by user ${userId}: ${title}`);
    res.status(201).json({
        success: true,
        message: 'Note created successfully',
        data: {
            note,
        },
    });
}));
router.get('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid note ID'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    const userId = req.user.userId;
    const noteId = req.params.id;
    const note = await Note_1.Note.findOne({
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
router.put('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid note ID'),
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    (0, express_validator_1.body)('content').optional().trim(),
    (0, express_validator_1.body)('category').optional().trim(),
    (0, express_validator_1.body)('tags').optional().isArray().withMessage('Tags must be an array'),
    (0, express_validator_1.body)('isArchived').optional().isBoolean().withMessage('isArchived must be a boolean'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
    const note = await Note_1.Note.findById(noteId);
    if (!note) {
        return res.status(404).json({
            success: false,
            message: 'Note not found',
        });
    }
    const canEdit = note.author.toString() === userId ||
        note.collaborators.some(collabId => collabId.toString() === userId);
    if (!canEdit) {
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to edit this note',
        });
    }
    Object.assign(note, updateData);
    note.lastEditedBy = new mongoose_1.default.Types.ObjectId(userId);
    note.version += 1;
    await note.save();
    await note.populate('author', 'name email avatar');
    await note.populate('collaborators', 'name email avatar');
    await note.populate('lastEditedBy', 'name email avatar');
    logger_1.logger.info(`Note ${noteId} updated by user ${userId}`);
    res.json({
        success: true,
        message: 'Note updated successfully',
        data: {
            note,
        },
    });
}));
router.delete('/:id', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid note ID'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    const userId = req.user.userId;
    const noteId = req.params.id;
    const note = await Note_1.Note.findOneAndDelete({
        _id: noteId,
        author: userId,
    });
    if (!note) {
        return res.status(404).json({
            success: false,
            message: 'Note not found or you are not the author',
        });
    }
    logger_1.logger.info(`Note ${noteId} deleted by user ${userId}`);
    res.json({
        success: true,
        message: 'Note deleted successfully',
    });
}));
router.post('/:id/collaborate', [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid note ID'),
    (0, express_validator_1.body)('userId').isMongoId().withMessage('Invalid user ID'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
    const note = await Note_1.Note.findOne({
        _id: noteId,
        author: currentUserId,
    });
    if (!note) {
        return res.status(404).json({
            success: false,
            message: 'Note not found or you are not the author',
        });
    }
    const collaborator = await User_1.User.findById(collaboratorId);
    if (!collaborator) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }
    if (note.collaborators.some(collabId => collabId.toString() === collaboratorId)) {
        return res.status(409).json({
            success: false,
            message: 'User is already a collaborator',
        });
    }
    note.collaborators.push(new mongoose_1.default.Types.ObjectId(collaboratorId));
    await note.save();
    await note.populate('author', 'name email avatar');
    await note.populate('collaborators', 'name email avatar');
    logger_1.logger.info(`User ${collaboratorId} added as collaborator to note ${noteId} by user ${currentUserId}`);
    res.json({
        success: true,
        message: 'Collaborator added successfully',
        data: {
            note,
        },
    });
}));
router.get('/meta/categories', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const categories = await Note_1.Note.aggregate([
        {
            $match: {
                $or: [
                    { author: new mongoose_1.default.Types.ObjectId(userId) },
                    { collaborators: new mongoose_1.default.Types.ObjectId(userId) },
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
router.get('/meta/tags', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.userId;
    const tags = await Note_1.Note.aggregate([
        {
            $match: {
                $or: [
                    { author: new mongoose_1.default.Types.ObjectId(userId) },
                    { collaborators: new mongoose_1.default.Types.ObjectId(userId) },
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
exports.default = router;
