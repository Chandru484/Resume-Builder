import db from '../config/firestore.js';
import { generatePDF, generateDOCX } from '../utils/generatorService.js';

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
const createResume = async (req, res) => {
    try {
        const { title } = req.body;

        console.log('[Create Resume] User ID:', req.user.id);
        console.log('[Create Resume] Title:', title);

        const resumeData = {
            userId: req.user.id,
            title: title || 'Untitled Resume',
            template: 'modern',
            personalInfo: {},
            summary: '',
            experience: [],
            education: [],
            projects: [],
            skills: [],
            sectionOrder: ['personalInfo', 'summary', 'experience', 'education', 'projects', 'skills'],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const resumeRef = await db.collection('resumes').add(resumeData);
        const newResume = await resumeRef.get();

        console.log('[Create Resume] Created resume ID:', newResume.id);

        res.status(201).json({ id: newResume.id, ...newResume.data() });
    } catch (error) {
        console.error('[Create Resume] Error:', error);
        res.status(400).json({ message: 'Invalid resume data', error: error.message });
    }
};

// @desc    Get user resumes
// @route   GET /api/resumes
// @access  Private
const getResumes = async (req, res) => {
    try {
        console.log('[Get Resumes] Fetching for user ID:', req.user.id);
        const isArchived = req.query.archived === 'true';
        
        const resumesSnapshot = await db.collection('resumes')
            .where('userId', '==', req.user.id)
            .get();

        console.log('[Get Resumes] Found', resumesSnapshot.docs.length, 'resumes total');
        
        // Sort manually until Firestore index is created
        const resumes = resumesSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(resume => {
                 // If requesting archived, only return archived.
                 // If requesting active (default), return those where isArchived is false or undefined.
                 if (isArchived) {
                     return resume.isArchived === true;
                 } else {
                     return resume.isArchived !== true;
                 }
            })
            .sort((a, b) => {
                const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt);
                const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt);
                return dateB - dateA; // Descending order
            });

        res.status(200).json(resumes);
    } catch (error) {
        console.error('[Get Resumes] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = async (req, res) => {
    try {
        const resumeDoc = await db.collection('resumes').doc(req.params.id).get();

        if (!resumeDoc.exists) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        const resumeData = resumeDoc.data();

        if (resumeData.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        res.status(200).json({ id: resumeDoc.id, ...resumeData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
const updateResume = async (req, res) => {
    try {
        const resumeRef = db.collection('resumes').doc(req.params.id);
        const resumeDoc = await resumeRef.get();

        if (!resumeDoc.exists) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        const resumeData = resumeDoc.data();

        if (resumeData.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        console.log(`[Resume Update] Saving ID: ${req.params.id}`);
        console.log("[Resume Update] Projects Data:", JSON.stringify(req.body.projects, null, 2));

        // Final sanity check for array fields
        const arrayFields = ['experience', 'education', 'projects', 'skills', 'sectionOrder'];
        const sanitizedBody = { ...req.body };

        arrayFields.forEach(field => {
            if (sanitizedBody[field] !== undefined) {
                // If it's a string, it might be a stringified array
                if (typeof sanitizedBody[field] === 'string' && sanitizedBody[field].startsWith('[')) {
                    try {
                        console.log(`[Resume Update] Attempting to parse stringified array for field: ${field}`);
                        sanitizedBody[field] = JSON.parse(sanitizedBody[field].replace(/'/g, '"'));
                    } catch (e) {
                        console.error(`[Resume Update] Failed to parse string for ${field}:`, e.message);
                    }
                }

                if (!Array.isArray(sanitizedBody[field])) {
                    console.warn(`[Resume Update] WARNING: Field '${field}' is not an array. Converting to empty array.`);
                    sanitizedBody[field] = [];
                }
            }
        });

        // Ensure subdocument fields don't have non-object elements
        ['experience', 'education', 'projects'].forEach(field => {
            if (Array.isArray(sanitizedBody[field])) {
                sanitizedBody[field] = sanitizedBody[field].filter(item =>
                    item !== null && typeof item === 'object' && !Array.isArray(item)
                );
            }
        });

        // Add updatedAt timestamp
        sanitizedBody.updatedAt = new Date();

        console.log('[Resume Update] Writing to Firestore...');
        await resumeRef.update(sanitizedBody);
        console.log('[Resume Update] ✅ Successfully written to Firestore');

        const updatedDoc = await resumeRef.get();
        console.log('[Resume Update] ✅ Document retrieved after update, exists:', updatedDoc.exists);
        
        res.status(200).json({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
        console.error("[Resume Update] CRITICAL ERROR:", error);

        res.status(400).json({
            message: 'Failed to update resume',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Archive resume (Soft Delete)
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res) => {
    try {
        const resumeRef = db.collection('resumes').doc(req.params.id);
        const resumeDoc = await resumeRef.get();

        if (!resumeDoc.exists) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        const resumeData = resumeDoc.data();

        if (resumeData.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Soft delete: set isArchived to true
        await resumeRef.update({
             isArchived: true,
             updatedAt: new Date()
        });
        
        res.status(200).json({ message: 'Resume archived' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Restore resume from archive
// @route   PUT /api/resumes/:id/restore
// @access  Private
const restoreResume = async (req, res) => {
    try {
        const resumeRef = db.collection('resumes').doc(req.params.id);
        const resumeDoc = await resumeRef.get();

        if (!resumeDoc.exists) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        const resumeData = resumeDoc.data();

        if (resumeData.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        // Restore: set isArchived to false
        await resumeRef.update({
             isArchived: false,
             updatedAt: new Date()
        });
        
        res.status(200).json({ message: 'Resume restored' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Permanently delete resume
// @route   DELETE /api/resumes/:id/permanent
// @access  Private
const permanentDeleteResume = async (req, res) => {
    try {
        const resumeRef = db.collection('resumes').doc(req.params.id);
        const resumeDoc = await resumeRef.get();

        if (!resumeDoc.exists) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        const resumeData = resumeDoc.data();

        if (resumeData.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        await resumeRef.delete();
        res.status(200).json({ message: 'Resume permanently deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Download Resume PDF
// @route   GET /api/resumes/:id/download/pdf
// @access  Private
const downloadResumePDF = async (req, res) => {
    try {
        console.log('[Controller] Fetching resume:', req.params.id);
        const resumeDoc = await db.collection('resumes').doc(req.params.id).get();

        if (!resumeDoc.exists) {
            console.warn('[Controller] Resume not found');
            return res.status(404).json({ message: 'Resume not found' });
        }

        const resumeData = resumeDoc.data();

        // Ensure user owns resume (security)
        if (resumeData.userId !== req.user.id) {
            console.warn('[Controller] Unauthorized access attempt');
            return res.status(401).json({ message: 'User not authorized' });
        }

        console.log('[Controller] Calling generatePDF...');
        const resume = { id: resumeDoc.id, ...resumeData };
        const pdfBuffer = await generatePDF(resume);

        console.log('[Controller] PDF generated, sending response...');
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
            'Content-Disposition': `inline; filename="${resumeData.title || 'resume'}.pdf"`,
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('[Controller] Error in downloadResumePDF:', error);
        res.status(500).json({ message: 'PDF generation failed: ' + error.message });
    }
};

// @desc    Download Resume DOCX
// @route   GET /api/resumes/:id/download/docx
// @access  Private
const downloadResumeDOCX = async (req, res) => {
    try {
        const resumeDoc = await db.collection('resumes').doc(req.params.id).get();

        if (!resumeDoc.exists) {
            return res.status(404).json({ message: 'Resume not found' });
        }

        const resumeData = resumeDoc.data();

        if (resumeData.userId !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        const resume = { id: resumeDoc.id, ...resumeData };
        const docxBuffer = await generateDOCX(resume);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Length': docxBuffer.length,
            'Content-Disposition': `attachment; filename="${resumeData.title || 'resume'}.docx"`,
        });

        res.send(docxBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'DOCX generation failed' });
    }
};

export { createResume, getResumes, getResumeById, updateResume, deleteResume, restoreResume, permanentDeleteResume, downloadResumePDF, downloadResumeDOCX };
