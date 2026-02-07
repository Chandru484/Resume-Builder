import express from 'express';
import {
    createResume,
    getResumes,
    getResumeById,
    updateResume,
    deleteResume,
    restoreResume,
    permanentDeleteResume,
    downloadResumePDF,
    downloadResumeDOCX
} from '../controllers/resumeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getResumes)
    .post(protect, createResume);

router.route('/:id')
    .get(protect, getResumeById)
    .put(protect, updateResume)
    .delete(protect, deleteResume);

router.put('/:id/restore', protect, restoreResume);
router.delete('/:id/permanent', protect, permanentDeleteResume);

router.get('/:id/preview', protect, downloadResumePDF);
router.get('/:id/download/docx', protect, downloadResumeDOCX);

export default router;
