import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import userRoutes from './routes/userRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import templateRoutes from './routes/templateRoutes.js';
import db from './config/firestore.js';

// Load env vars
dotenv.config();

// Note: Using Firestore (Firebase) as database - no connection needed

const app = express();

// Middlewares
const allowedOrigins = [
    'https://resumeai-frontend-production-a0a4.up.railway.app',
    'https://your-vercel-domain.vercel.app', // User will replace this or add theirs
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1 && process.env.NODE_ENV === 'production') {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Add Cross-Origin headers for OAuth popup compatibility
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/templates', templateRoutes);

// Health check endpoint for Docker/Railway
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error Handling
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const PORT = process.env.PORT || 5000;

// Auto-seed templates on startup if needed
const autoSeedTemplates = async () => {
    try {
        const templatesSnapshot = await db.collection('templates').get();
        const expectedCount = 6; // Update this when adding new templates
        
        if (templatesSnapshot.size !== expectedCount) {
            console.log(`Template count mismatch: ${templatesSnapshot.size} found, ${expectedCount} expected. Auto-seeding...`);
            
            // Import and call seed logic
            const { seedTemplates } = await import('./controllers/templateController.js');
            
            // Create mock req/res for seedTemplates
            const mockReq = {};
            const mockRes = {
                status: (code) => ({
                    json: (data) => {
                        console.log(`Auto-seed completed: ${data.message}`);
                        return mockRes;
                    }
                })
            };
            
            await seedTemplates(mockReq, mockRes);
        } else {
            console.log(`Templates already seeded (${templatesSnapshot.size} templates)`);
        }
    } catch (error) {
        console.error('Auto-seed templates failed:', error.message);
    }
};

app.listen(PORT, async () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log("Payload limit set to 50MB");
    
    // Auto-seed templates after server starts
    await autoSeedTemplates();
});
