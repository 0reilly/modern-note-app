import express from 'express';
import { query, validationResult } from 'express-validator';
import { User } from '../models/User';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Search users for collaboration
router.get('/search', [
  query('q')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
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

  const { q } = req.query;
  const currentUserId = req.user.userId;

  // Search users by email or name (excluding current user)
  const users = await User.find({
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

// Get user by ID
router.get('/:id', asyncHandler(async (req: any, res) => {
  const userId = req.params.id;
  
  // Don't allow users to get other users' full profiles
  if (userId !== req.user.userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  }

  const user = await User.findById(userId);
  
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

export default router;