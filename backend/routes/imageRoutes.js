import express from 'express';
import multer from 'multer';
import { uploadProfileImage, uploadAndRemoveBg } from '../controllers/imageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', protect, upload.single('image'), uploadProfileImage);
router.post('/remove-bg', protect, upload.single('image'), uploadAndRemoveBg);

export default router;
