import { PDFParse } from 'pdf-parse';
import { enhanceText, parseResume, analyzeResume, matchJob, generateCoverLetter, trimResume } from '../utils/groq.js';

// @desc    Enhance resume text (summary or description)
// @route   POST /api/ai/enhance
// @access  Private
const enhanceResumeText = async (req, res) => {
    const { text, type, mode } = req.body;

    if (!text) {
        return res.status(400).json({ message: 'Text is required' });
    }

    try {
        const enhancedText = await enhanceText(text, type, mode);
        res.status(200).json({ enhancedText });
    } catch (error) {
        res.status(500).json({ message: 'AI Enhancement failed', error: error.message });
    }
};

// @desc    Parse uploaded PDF resume
// @route   POST /api/ai/parse
// @access  Private
const parseResumePdf = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        console.log("Start parsing PDF...");
        const dataBuffer = req.file.buffer;
        console.log(`Buffer size: ${dataBuffer.length}`);

        console.log("Initializing PDFParse...");
        const parser = new PDFParse({ data: dataBuffer });

        console.log("Calling parser.getText()...");
        const data = await parser.getText();

        console.log("PDF extraction complete. Characters:", data?.text?.length || 0);
        if (!data?.text || data.text.trim().length === 0) {
            console.warn("WARNING: Extracted text is empty!");
            return res.status(400).json({ message: 'Could not extract text from PDF. Please ensure it is a valid text-based PDF.' });
        } else {
            console.log("Extracted text snippet:", data.text.substring(0, 200).replace(/\n/g, ' '));
        }

        console.log("Calling parseResume with Groq...");
        const parsedData = await parseResume(data.text);
        console.log("Groq parseResume result:", parsedData);
        console.log("AI parsing complete. Result Type:", typeof parsedData);

        if (!parsedData || (typeof parsedData === 'object' && Object.keys(parsedData).length === 0)) {
            console.error("AI parsing returned empty/invalid object:", parsedData);
            throw new Error("AI parsing returned empty results. Please try again with a different PDF.");
        }

        res.status(200).json(parsedData);
    } catch (error) {
        console.error("CRITICAL: Resume Parsing Pipeline Failed!");
        console.error("Step Location: parseResumePdf controller");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        res.status(500).json({
            message: 'Resume parsing failed',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Analyze resume for ATS score
// @route   POST /api/ai/analyze
// @access  Private
const analyzeResumeHandler = async (req, res) => {
    try {
        let resumeText = '';

        if (req.file) {
            const dataBuffer = req.file.buffer;
            const parser = new PDFParse({ data: dataBuffer });
            const data = await parser.getText();
            resumeText = data.text;
        } else if (req.body.resumeText) {
            resumeText = req.body.resumeText;
        } else {
            return res.status(400).json({ message: 'No file or resume text provided' });
        }

        const analysis = await analyzeResume(resumeText);
        res.status(200).json(analysis);
    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({ message: 'Analysis failed', error: error.message });
    }
};

// @desc    Match resume against JD
// @route   POST /api/ai/job-match
// @access  Private
const jobMatchHandler = async (req, res) => {
    const { resumeId, jobDescription } = req.body;
    // In a real app, we might fetch the resume from DB using resumeId.
    // For now, we'll accept raw resume text or if resumeId is provided we fetch it.
    // Let's assume the frontend sends the *text* of the current resume to make it stateless/easier for now, or we fetch from DB.
    // Let's support sending 'resumeText' directly for flexibility.

    const { resumeText } = req.body;

    if (!resumeText || !jobDescription) {
        return res.status(400).json({ message: 'Resume text and Job Description are required' });
    }

    try {
        const matchResult = await matchJob(resumeText, jobDescription);
        res.status(200).json(matchResult);
    } catch (error) {
        res.status(500).json({ message: 'Job matching failed', error: error.message });
    }
};

// @desc    Generate Cover Letter
// @route   POST /api/ai/cover-letter
// @access  Private
const coverLetterHandler = async (req, res) => {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
        return res.status(400).json({ message: 'Resume text and Job Description are required' });
    }

    try {
        const coverLetter = await generateCoverLetter(resumeText, jobDescription);
        res.status(200).json({ coverLetter });
    } catch (error) {
        res.status(500).json({ message: 'Cover Letter generation failed', error: error.message });
    }
};

// @desc    Trim resume to 1 page
// @route   POST /api/ai/trim
// @access  Private
const trimResumeHandler = async (req, res) => {
    const { resumeText } = req.body;

    console.log("[Trim Resume] Request received");
    console.log("[Trim Resume] Payload type:", typeof resumeText);

    if (!resumeText) {
        console.error("[Trim Resume] Missing resumeText");
        return res.status(400).json({ message: 'Resume text/data is required' });
    }

    try {
        console.log("[Trim Resume] Calling AI service...");
        const trimmedData = await trimResume(resumeText);
        console.log("[Trim Resume] Success. Response keys:", Object.keys(trimmedData));
        res.status(200).json(trimmedData);
    } catch (error) {
        console.error("[Trim Resume] Handler Error:", error);
        res.status(500).json({ message: 'Trim failed', error: error.message });
    }
};

// @desc    Extract text from PDF for Cover Letter
// @route   POST /api/ai/extract-text
// @access  Private
const extractTextFromPdfHandler = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const dataBuffer = req.file.buffer;
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();

        if (!data || !data.text) {
            return res.status(400).json({ message: 'Could not extract text from PDF' });
        }

        res.status(200).json({ text: data.text });
    } catch (error) {
        console.error("PDF Extraction Error:", error);
        res.status(500).json({ message: 'Text extraction failed', error: error.message });
    }
};

export { enhanceResumeText, parseResumePdf, analyzeResumeHandler, jobMatchHandler, coverLetterHandler, trimResumeHandler, extractTextFromPdfHandler };
