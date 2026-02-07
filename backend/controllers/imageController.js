import { uploadImage, removeBackground } from '../utils/imagekit.js';

// @desc    Upload profile image
// @route   POST /api/images/upload
// @access  Private
const uploadProfileImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }

    try {
        const result = await uploadImage(req.file.buffer, req.file.originalname);
        res.status(200).json({
            url: result.url,
            fileId: result.fileId
        });
    } catch (error) {
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};

// @desc    Upload & Remove Image Background
// @route   POST /api/images/remove-bg
// @access  Private
const uploadAndRemoveBg = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }

    try {
        const result = await removeBackground(req.file.buffer, req.file.originalname);
        res.status(200).json({
            url: result.url,
            fileId: result.fileId
        });
    } catch (error) {
        res.status(500).json({ message: 'Background removal failed', error: error.message });
    }
};

export { uploadProfileImage, uploadAndRemoveBg };
