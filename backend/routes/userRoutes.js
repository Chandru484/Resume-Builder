import express from 'express';
import { updateUserProfile, getUserProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes are protected - Firebase handles authentication
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;
