import express from 'express';
import multer from 'multer';
import { enhanceResumeText, parseResumePdf, analyzeResumeHandler, jobMatchHandler, coverLetterHandler, trimResumeHandler, extractTextFromPdfHandler } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/enhance', protect, enhanceResumeText);
router.post('/parse', protect, upload.single('resume'), parseResumePdf);
router.post('/analyze', protect, upload.single('resume'), analyzeResumeHandler);
router.post('/job-match', protect, jobMatchHandler);
router.post('/cover-letter', protect, coverLetterHandler);
router.post('/trim', protect, trimResumeHandler);
router.post('/extract-text', protect, upload.single('resume'), extractTextFromPdfHandler);

export default router;
