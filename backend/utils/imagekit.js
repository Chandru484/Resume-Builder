import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ImageKit = require('imagekit');
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    console.error('WARNING: ImageKit environment variables are missing. Image features will not work.');
}

const imagekit = (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY)
    ? new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    })
    : null;

const uploadImage = async (fileBuffer, fileName) => {
    if (!imagekit) {
        throw new Error('ImageKit is not configured. Please add your keys to the .env file.');
    }
    const result = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: '/resumes/profiles',
        extensions: [
            {
                name: 'google-auto-tagging',
                maxTags: 5,
                minConfidence: 90
            }
        ]
    });
    return result;
};

const removeBackground = async (fileBuffer, fileName) => {
    if (!imagekit) {
        throw new Error('ImageKit is not configured. Please add your keys to the .env file.');
    }
    // ImageKit background removal is usually done via transformation or a specific upload extension
    // Here we use the upload with bg-removal extension if available, or just a transformation URL for display
    const result = await imagekit.upload({
        file: fileBuffer,
        fileName: fileName,
        folder: '/resumes/bg-removed',
        transformation: {
            pre: 'bg-remove' // This depends on ImageKit's specific extension configuration
        }
    });
    return result;
};

export { uploadImage, removeBackground };
