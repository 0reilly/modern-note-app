"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
const generateToken = (userId, email) => {
    const jwtSecret = process.env['JWT_SECRET'];
    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not defined');
    }
    return jsonwebtoken_1.default.sign({ userId, email }, jwtSecret);
};
router.post('/register', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    const { email, password, name } = req.body;
    const existingUser = await User_1.User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            message: 'User with this email already exists',
        });
    }
    const user = new User_1.User({
        email,
        password,
        name,
    });
    await user.save();
    const token = generateToken(user._id.toString(), user.email);
    logger_1.logger.info(`New user registered: ${email}`);
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                preferences: user.preferences,
            },
            token,
        },
    });
}));
router.post('/login', [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
        });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
        });
    }
    const token = generateToken(user._id.toString(), user.email);
    logger_1.logger.info(`User logged in: ${email}`);
    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                preferences: user.preferences,
            },
            token,
        },
    });
}));
router.get('/me', auth_1.authenticateToken, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.user.userId);
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
router.put('/profile', auth_1.authenticateToken, [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
], (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    const { name, preferences } = req.body;
    const updateData = {};
    if (name)
        updateData.name = name;
    if (preferences)
        updateData.preferences = preferences;
    const user = await User_1.User.findByIdAndUpdate(req.user.userId, updateData, { new: true, runValidators: true });
    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }
    logger_1.logger.info(`User profile updated: ${user.email}`);
    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                preferences: user.preferences,
            },
        },
    });
}));
exports.default = router;
