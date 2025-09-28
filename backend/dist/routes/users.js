"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticateToken);
router.get('/search', [
    (0, express_validator_1.query)('q')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search query must be at least 2 characters long'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    const { q } = req.query;
    const currentUserId = req.user.userId;
    const users = await User_1.User.find({
        _id: { $ne: currentUserId },
        $or: [
            { email: { $regex: q, $options: 'i' } },
            { name: { $regex: q, $options: 'i' } },
        ],
    })
        .select('email name avatar')
        .limit(10);
    res.json({
        success: true,
        data: {
            users,
        },
    });
}));
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.params.id;
    if (userId !== req.user.userId) {
        return res.status(403).json({
            success: false,
            message: 'Access denied',
        });
    }
    const user = await User_1.User.findById(userId);
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }
    res.json({
        success: true,
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                preferences: user.preferences,
                createdAt: user.createdAt,
            },
        },
    });
}));
exports.default = router;
