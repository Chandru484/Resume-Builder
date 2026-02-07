import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODELS = [
    'llama-3.3-70b-versatile',
    'llama-3.1-70b-versatile',
    'mixtral-8x7b-32768'
];

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory cache for AI responses (TTL: 6 hours for free tier optimization)
const aiCache = new Map();
const CACHE_TTL = 21600000;

const getCachedResponse = (key) => {
    const cached = aiCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
};

const setCachedResponse = (key, data) => {
    aiCache.set(key, { data, timestamp: Date.now() });
};

const callGroqWithFallback = async (prompt, models = MODELS, format = 'text') => {
    // Check Cache
    const cacheKey = `${format}:${prompt}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) {
        console.log(`[AI] Cache hit for prompt (${format})`);
        return cached;
    }

    let lastError = null;

    // Iterate through models
    for (const modelName of models) {
        // Retry logic for the SAME model (up to 3 attempts)
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`[AI] Attempting ${modelName} (Format: ${format}, Attempt: ${attempt})`);

                // Config setup for Groq
                const config = {
                    model: modelName,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 4096
                };

                if (format === 'json') {
                    config.response_format = { type: 'json_object' };
                }

                const response = await groq.chat.completions.create(config);
                const text = response.choices[0]?.message?.content;

                if (text) {
                    setCachedResponse(cacheKey, text);
                    return text;
                }
            } catch (error) {
                const msg = error.message || "";

                console.warn(`[AI] ${modelName} error (Attempt ${attempt}): ${msg}`);

                // Check if retryable (429, 503, rate limit)
                if (msg.includes('503') || msg.includes('overloaded') || msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('rate_limit') || msg.includes('Rate limit')) {
                    if (attempt < 3) {
                        // Intelligent Delay Calculation
                        let delay = 10000; // Default 10s for Groq

                        // Try to extract retry delay from error
                        const match = msg.match(/retry in ([\\d\\.]+)s/);
                        if (match && match[1]) {
                            delay = (parseFloat(match[1]) * 1000) + 1000;
                            console.log(`[AI] Parsed explicit retry delay: ${delay}ms`);
                        } else {
                            // Exponential backoff (10s, 20s, 40s)
                            delay = 10000 * Math.pow(2, attempt - 1);
                        }

                        // Cap max delay to 1 minute
                        delay = Math.min(delay, 60000);

                        console.log(`[AI] Rate limit hit. Waiting ${delay}ms before retry...`);
                        await wait(delay);
                        continue; // Retry internal loop
                    }
                }

                // If non-retryable error or max attempts reached
                lastError = error;
                break; // Break internal loop to try next model
            }
        }
    }
    throw lastError || new Error("AI models unavailable.");
};

/**
 * Robust JSON repair for malformed AI output.
 * Handles single quotes, unquoted keys, and nested stringified objects.
 */
const repairDirtyJSON = (text) => {
    if (!text || typeof text !== 'string') return text;
    let clean = text.trim();

    // Remove markdown code blocks if present
    clean = clean.replace(/```(json|javascript|js)?/g, '').replace(/```/g, '').trim();

    // Handle AI sometimes wrapping everything in single quotes
    if (clean.startsWith("'") && clean.endsWith("'")) {
        clean = clean.substring(1, clean.length - 1).trim();
    }

    // Handle JS-style concatenation with + markers
    if (clean.includes("+") && (clean.includes("'") || clean.includes("\""))) {
        console.log("[AI] Detected string concatenation or JS code in response, attempting to clean...");
        clean = clean.replace(/['"]\\s*\\+\\s*['"]/g, '')
            .replace(/['"]\\s*\\+\\s*\\n\\s*['"]/g, '')
            .replace(/\\n\\s*\\+\\s*/g, ' ')
            .replace(/\\r/g, '')
            .replace(/\\\\n/g, '\\n');
    }

    // Remove leading variable declarations
    clean = clean.replace(/^(const|let|var)\\s+\\w+\\s*=\\s*/, '');

    // Remove trailing semicolon
    if (clean.endsWith(';')) clean = clean.slice(0, -1);

    if (!clean.startsWith('{') && !clean.startsWith('[')) return text;

    try {
        return JSON.parse(clean);
    } catch (e) {
        try {
            // STEP 1: Handle JS-style literals
            let fixed = clean
                .replace(/'(?=([^\"]*\"[^\"]*\")*[^\"]*$)/g, '"')
                .replace(/([{,]\\s*)(\\w+):/g, '$1"$2":')
                .replace(/:\\s*'([^']*)'/g, ': "$1"');

            return JSON.parse(fixed);
        } catch (e2) {
            // STEP 2: Even more aggressive cleaning
            try {
                let ultraFixed = clean
                    .replace(/\\n/g, ' ')
                    .replace(/'/g, '"')
                    .replace(/([{,]\\s*)(\\w+):/g, '$1"$2":')
                    .replace(/,\\s*([}\\]])/g, '$1');

                return JSON.parse(ultraFixed);
            } catch (e3) {
                console.error("[AI] JSON Repair failed even with aggressive cleaning. Error:", e3.message);
                return text;
            }
        }
    }
};

const normalizeResumeData = (data) => {
    // If data is a string, try to repair and parse it first
    if (typeof data === 'string') {
        const repaired = repairDirtyJSON(data);
        if (typeof repaired === 'object' && repaired !== null) {
            data = repaired;
        } else {
            return {};
        }
    }

    // If data is an array, AI might have returned just projects or experience
    if (Array.isArray(data)) {
        if (data.length > 0 && (data[0].company || data[0].role)) {
            data = { experience: data };
        } else if (data.length > 0 && (data[0].title || data[0].description)) {
            data = { projects: data };
        } else if (data.length > 0 && data[0].school) {
            data = { education: data };
        } else {
            return {};
        }
    }

    if (!data || typeof data !== 'object') return {};

    // Recursively repair any string fields that might be stringified JSON
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'string' && (data[key].startsWith('{') || data[key].startsWith('['))) {
            const repaired = repairDirtyJSON(data[key]);
            if (typeof repaired !== 'string') {
                data[key] = repaired;
            }
        }
    });

    const normalized = {
        personalInfo: {
            fullName: String(data.personalInfo?.fullName || data.fullName || ''),
            email: String(data.personalInfo?.email || data.email || ''),
            phone: String(data.personalInfo?.phone || data.phone || ''),
            location: String(data.personalInfo?.location || data.location || ''),
            profession: String(data.personalInfo?.profession || data.profession || ''),
            linkedin: String(data.personalInfo?.linkedin || data.linkedin || ''),
            website: String(data.personalInfo?.website || data.website || '')
        },
        summary: typeof data.summary === 'object' ? JSON.stringify(data.summary) : String(data.summary || ''),
        experience: Array.isArray(data.experience) ? data.experience.map(exp => ({
            company: String(exp.company || ''),
            role: String(exp.role || ''),
            startDate: String(exp.startDate || ''),
            endDate: String(exp.endDate || ''),
            description: String(exp.description || '')
        })) : [],
        education: Array.isArray(data.education) ? data.education.map(edu => ({
            school: String(edu.school || ''),
            degree: String(edu.degree || ''),
            year: String(edu.year || '')
        })) : [],
        projects: Array.isArray(data.projects) ? data.projects.map(proj => {
            const p = typeof proj === 'string' ? repairDirtyJSON(proj) : proj;
            return {
                title: String(p?.title || (p?.name) || (typeof p === 'string' && p.length < 200 ? p : '')),
                category: String(p?.category || p?.type || ''),
                description: String(p?.description || (typeof p === 'string' && p.length >= 200 ? p : '')),
                link: String(p?.link || '')
            };
        }) : [],
        skills: []
    };

    if (data.skills) {
        let s = Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(',') : []);
        normalized.skills = s.map(skill => {
            if (typeof skill === 'object' && skill !== null) return skill.name || skill.title || JSON.stringify(skill);
            return String(skill).trim();
        }).filter(Boolean);
    }

    return normalized;
};

// Helper: Sanitize input for AI to save tokens and prevent errors
const sanitizeForAI = (input) => {
    let dataObj = input;

    // Try to parse if it's a string
    if (typeof input === 'string') {
        try {
            dataObj = JSON.parse(input);
        } catch (e) {
            // It's just a raw string (e.g. PDF text), so we truncate if too long
            const maxLength = 25000;
            if (input.length > maxLength) {
                console.warn(`[AI Service] Input text too long (${input.length}), truncating...`);
                return input.substring(0, maxLength);
            }
            return input;
        }
    }

    // If it's an object, strip heavy fields
    if (dataObj && typeof dataObj === 'object') {
        const clean = { ...dataObj };

        if (clean.personalInfo && clean.personalInfo.image) {
            clean.personalInfo = { ...clean.personalInfo, image: "[Image Removed]" };
        }

        return JSON.stringify(clean);
    }

    return String(input);
};

const enhanceText = async (text, type, mode = 'professional') => {
    const prompt = `Act as a Senior Executive Recruiter & Resume Writer.
    Your goal is to rewrite the following resume content to be High-Impact, ATS-Friendly, and Result-Oriented.

    Input Text (${type}): "${text}"
    Target Tone: ${mode}

    Instructions:
    1. Use STRONG Action Verbs (e.g., Spearheaded, Orchestrated, Optimized).
    2. Quantify results using metrics (%, $, numbers) where possible.
    3. Remove passive voice and weak phrases (e.g., "Responsible for").
    4. Keep it concise but powerful.

    Examples:
    BAD: "Managed a sales team and increased revenue."
    GOOD: "Orchestrated a high-performance sales team of 10, driving a 40% YoY revenue increase ($2M growth)."

    BAD: "Wrote code for the website."
    GOOD: "Engineered scalable frontend architecture using React, reducing page load time by 30%."

    Output:
    Return ONLY the enhanced text. Do not include quotes or explanations.`;

    return await callGroqWithFallback(prompt);
};

const cleanJson = (text, shouldNormalize = false) => {
    if (!text) throw new Error("AI returned empty.");
    console.log("[AI] Raw Response length:", text.length);

    // Extract JSON block
    let clean = text.replace(/```(json|javascript|js)?/g, '').replace(/```/g, '').trim();

    // Find first and last characters that could be JSON
    const firstBrace = clean.indexOf('{');
    const firstBracket = clean.indexOf('[');

    let start = -1;
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        start = firstBrace;
    } else {
        start = firstBracket;
    }

    const lastBrace = clean.lastIndexOf('}');
    const lastBracket = clean.lastIndexOf(']');
    let end = -1;
    if (lastBrace !== -1 && (lastBracket === -1 || lastBrace > lastBracket)) {
        end = lastBrace;
    } else {
        end = lastBracket;
    }

    if (start !== -1 && end !== -1 && end > start) {
        clean = clean.substring(start, end + 1);
    }

    try {
        const parsed = JSON.parse(clean);
        return shouldNormalize ? normalizeResumeData(parsed) : parsed;
    } catch (e) {
        console.log("[AI] Standard JSON.parse failed, attempting aggressive repair...");
        const repaired = repairDirtyJSON(clean);
        if (repaired && typeof repaired === 'object') {
            return shouldNormalize ? normalizeResumeData(repaired) : repaired;
        }

        console.error("[AI] Final data is not an object:", typeof repaired);
        throw new Error("AI failed to produce valid JSON data. Please try again.");
    }
};

const parseResume = async (text) => {
    const cleanText = sanitizeForAI(text);

    const prompt = `Parse this resume text into a CLEAN JSON object. 
    Strict Structure: {
        "personalInfo": { "fullName": "", "email": "", "phone": "", "location": "", "profession": "", "linkedin": "", "website": "" },
        "summary": "",
        "experience": [{ "company": "", "role": "", "startDate": "", "endDate": "", "description": "" }],
        "education": [{ "school": "", "degree": "", "year": "" }],
        "projects": [{ "title": "", "category": "", "description": "", "link": "" }],
        "skills": ["string"]
    }
    
    IMPORTANT: 
    1. Return ONLY the JSON object. 
    2. Use DOUBLE QUOTES for all keys and string values.
    3. Ensure proper JSON syntax.
    
    Resume Text:
    ${cleanText}`;

    const raw = await callGroqWithFallback(prompt, MODELS, 'json');
    return cleanJson(raw, true);
};

const analyzeResume = async (resumeText) => {
    const cleanResumeText = sanitizeForAI(resumeText);

    const prompt = `Act as a strict Application Tracking System (ATS) and Senior Technical Recruiter.
    Audit this resume text for ATS readability, keyword optimization, and content impact.
    
    Return a JSON object with this EXACT structure:
    {
      "score": number (0-100),
      "sectionScores": {
        "Contact": number (0-10),
        "Summary": number (0-10),
        "Experience": number (0-10),
        "Education": number (0-10),
        "Projects": number (0-10),
        "Skills": number (0-10)
      },
      "criticalIssues": ["string (Be specific, e.g., 'Missing email', 'Summary too long', 'Passive voice used')"],
      "missingKeywords": ["string (Suggest 3-5 high-value keywords missing based on the context of the resume content itself)"],
      "actionableSteps": [
        { "section": "string", "feedback": "string (Concrete advice, e.g., 'Add metrics to experience bullets')" }
      ],
      "strengths": ["string"],
      "weaknesses": ["string"]
    }

    Resume Data:
    ${cleanResumeText}`;

    const raw = await callGroqWithFallback(prompt, MODELS, 'json');
    return cleanJson(raw, false);
};

const matchJob = async (resumeText, jobDescription) => {
    const cleanResumeText = sanitizeForAI(resumeText);

    const prompt = `Match this resume against the provided job description.
    Return a JSON object with the following EXACT keys:
    {
      "matchScore": number (0-100),
      "missingKeywords": ["string"],
      "matchingKeywords": ["string"],
      "gapAnalysis": "string",
      "tailoringSuggestions": ["string"]
    }
    
    Resume Data:
    ${cleanResumeText}
    
    Job Description:
    ${jobDescription}`;

    const raw = await callGroqWithFallback(prompt, MODELS, 'json');
    console.log("[Job Match] Raw AI Response:", raw);
    return cleanJson(raw, false);
};

const trimResume = async (resumeData) => {
    console.log("[AI Service] trimResume called");

    const resumeText = sanitizeForAI(resumeData);
    console.log("[AI Service] Resume text length:", resumeText.length);

    const prompt = `Act as a Ruthless Senior Resume Editor.
    Your SOLE GOAL is to fit this resume into a 1-Page Format. You must shorten it significantly.
    
    Strategies to Apply:
    1. Professional Summary: Cut to 1-2 punchy lines maximum.
    2. Experience: MERGE related bullets. Remove weak bullets entirely. Limit to 2-3 high-impact bullets per role. Use telegram style (drop "I", "the", "a").
    3. Projects: Max 2 lines total per project.
    4. Skills: Group them into a single comma-separated list or tight categories.
    
    CRITICAL INSTRUCTIONS:
    - If a section is long, CUT IT DOWN.
    - Do NOT remove the actual jobs/degrees, just the descriptions.
    - Maintain valid JSON structure.
    
    Resume JSON:
    ${resumeText}`;

    try {
        console.log("[AI Service] Sending request to Groq...");
        const raw = await callGroqWithFallback(prompt, MODELS, 'json');
        console.log("[AI Service] Raw response received. Length:", raw.length);
        return cleanJson(raw, true);
    } catch (error) {
        console.error("[AI Service] trimResume failed:", error);
        throw error;
    }
};

export { enhanceText, parseResume, analyzeResume, matchJob, trimResume, callGroqWithFallback };

// Re-adding improveText alias for compatibility
export const improveText = async (text, type, mode) => {
    const prompt = `Enhance the following ${type} in ${mode} mode. Return only the enhanced text.\\n\\nText: ${text}`;
    return await callGroqWithFallback(prompt);
};

export const generateCoverLetter = async (resumeText, jobDescription) => {
    const prompt = `Generate a professional cover letter based on this resume and job description. Return only the letter text.`;
    return await callGroqWithFallback(`${prompt}\\n\\nResume: ${resumeText}\\nJD: ${jobDescription}`);
};
