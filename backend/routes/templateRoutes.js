import express from 'express';
import { getTemplates, seedTemplates } from '../controllers/templateController.js';

const router = express.Router();

router.get('/', getTemplates);
router.post('/seed', seedTemplates);

export default router;
