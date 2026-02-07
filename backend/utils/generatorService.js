import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, VerticalAlign, ExternalHyperlink, ImageRun } from 'docx';
import fs from 'fs';
import axios from 'axios';

// Helper to fetch image buffer from URL or base64
const getImageBuffer = async (imageUrl) => {
    if (!imageUrl) return null;
    try {
        if (imageUrl.startsWith('data:image')) {
            const base64Data = imageUrl.split(';base64,').pop();
            return Buffer.from(base64Data, 'base64');
        }
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    } catch (error) {
        console.error('Error fetching image for DOCX:', error.message);
        return null;
    }
};

// Helper to generate HTML for Puppeteer
const generateResumeHTML = (resume, theme) => {
    console.log('Building HTML for resume:', resume?.title);

    // Extreme null safety
    const personalInfo = resume?.personalInfo || {};
    const summary = resume?.summary || '';
    const experience = resume?.experience || [];
    const education = resume?.education || [];
    const projects = resume?.projects || [];
    const skills = resume?.skills || [];
    const color = theme?.color || '#000000';

    const safeEmail = personalInfo.email || '';
    const safePhone = personalInfo.phone || '';
    const safeLocation = personalInfo.location || '';
    const safeLinkedin = personalInfo.linkedin || '';
    const safeGithub = personalInfo.github || '';
    const safeWebsite = personalInfo.website || '';

    const formatUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `https://${url}`;
    };

    const contactParts = [
        safeEmail ? `<a href="mailto:${safeEmail}" style="text-decoration:none; color:#666;">${safeEmail}</a>` : null,
        safePhone,
        safeLocation,
        safeLinkedin ? `<a href="${formatUrl(safeLinkedin)}" style="text-decoration:none; color:${color}; font-weight:bold;">LinkedIn</a>` : null,
        safeGithub ? `<a href="${formatUrl(safeGithub)}" style="text-decoration:none; color:${color}; font-weight:bold;">GitHub</a>` : null,
        safeWebsite ? `<a href="${formatUrl(safeWebsite)}" style="text-decoration:none; color:${color}; font-weight:bold;">Website</a>` : null
    ].filter(Boolean);

    const contactStr = contactParts.join(' | ');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 40px; color: #333; line-height: 1.6; }
            a { color: inherit; text-decoration: none; }
            .header { border-bottom: 3px solid ${color}; padding-bottom: 20px; margin-bottom: 25px; }
            .name { font-size: 36px; font-weight: 800; color: #000; text-transform: uppercase; margin-bottom: 5px; }
            .contact { font-size: 13px; color: #666; font-weight: 500; }
            .section { margin-bottom: 30px; break-inside: avoid; }
            .section-title { font-size: 18px; font-weight: 800; color: ${color}; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 15px; letter-spacing: 1px; }
            .item { margin-bottom: 20px; break-inside: avoid; }
            .item-header { display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 4px; }
            .company { font-size: 16px; color: #000; }
            .date { font-size: 13px; color: #777; font-weight: 600; }
            .role { font-style: italic; color: #555; font-size: 14px; margin-bottom: 8px; font-weight: 600; }
            .description { font-size: 13.5px; white-space: pre-line; color: #444; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 10px; }
            .skill-tag { background: #f8fafc; color: #475569; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1px solid #e2e8f0; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="name">${personalInfo.fullName || 'Your Name'}</div>
            <div class="contact">${contactStr || 'Contact details not provided'}</div>
            ${personalInfo.profession ? `<div style="margin-top: 10px; font-weight: 700; color: ${color}; text-transform: uppercase; letter-spacing: 0.5px;">${personalInfo.profession}</div>` : ''}
        </div>

        ${summary ? `
        <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="description">${summary}</div>
        </div>` : ''}

        ${experience.length > 0 ? `
        <div class="section">
            <div class="section-title">Experience</div>
            ${experience.map(exp => `
                <div class="item">
                    <div class="item-header">
                        <span class="company">${exp.company || 'Company'}</span>
                        <span class="date">${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}</span>
                    </div>
                    <div class="role">${exp.role || ''}</div>
                    <div class="description">${exp.description || ''}</div>
                </div>
            `).join('')}
        </div>` : ''}

        ${education.length > 0 ? `
        <div class="section">
            <div class="section-title">Education</div>
            ${education.map(edu => `
                <div class="item">
                    <div class="item-header">
                        <span class="company">${edu.school || 'Institution'}</span>
                        <span class="date">${edu.year || ''}</span>
                    </div>
                    <div class="role">${edu.degree || ''}</div>
                </div>
            `).join('')}
        </div>` : ''}

        ${projects.length > 0 ? `
        <div class="section">
            <div class="section-title">Projects</div>
            ${projects.map(proj => `
                <div class="item">
                    <div class="item-header">
                        <span class="company">${proj.title || 'Project'}</span>
                        <span class="date">${proj.category || proj.type || ''}</span>
                    </div>
                    <div class="description">${proj.description || ''}</div>
                </div>
            `).join('')}
        </div>` : ''}

        ${skills.length > 0 ? `
        <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills-list">
                ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>` : ''}
    </body>
    </html>
    `;
};

const generatePDF = async (resume) => {
    let browser = null;
    try {
        console.log('[Puppeteer] Launching browser...');
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless
        });

        console.log('[Puppeteer] Opening new page...');
        const page = await browser.newPage();

        const resumeData = resume.toObject ? resume.toObject() : resume;
        console.log('[Puppeteer] Setting content for:', resumeData?.title);

        const html = generateResumeHTML(resumeData, resumeData.theme || {});

        await page.setContent(html, {
            waitUntil: 'domcontentloaded',
            timeout: 20000
        });

        console.log('[Puppeteer] Generating PDF buffer...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '48px', right: '48px', bottom: '48px', left: '48px' },
            timeout: 20000
        });

        await browser.close();
        console.log('[Puppeteer] Generation successful.');
        return pdfBuffer;
    } catch (error) {
        console.error('[Puppeteer] Fatal Error:', error);
        try {
            fs.appendFileSync('error.log', `Date: ${new Date().toISOString()}\nError: ${error.message}\nStack: ${error.stack}\n\n`);
        } catch (logErr) {
            console.error('Failed to write to error.log:', logErr);
        }
        if (browser) await browser.close();
        throw new Error('PDF Generation failed: ' + error.message);
    }
};

// Helper function to convert hex color to RGB components for DOCX
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? hex.replace('#', '').toUpperCase() : '000000';
};

// Template-specific styling configurations
const getTemplateStyles = (template, themeColor) => {
    const baseColor = themeColor || '#ea580c';
    const colorHex = hexToRgb(baseColor);

    const styles = {
        classic: {
            font: 'Calibri',
            nameSize: 72,
            headingSize: 32,
            bodySize: 22,
            nameAlignment: AlignmentType.LEFT,
            sectionAlignment: AlignmentType.LEFT,
            color: colorHex
        },
        modern: {
            font: 'Arial',
            nameSize: 64,
            headingSize: 24,
            bodySize: 22,
            nameAlignment: AlignmentType.LEFT,
            sectionAlignment: AlignmentType.LEFT,
            color: colorHex
        },
        elegant: {
            font: 'Georgia',
            nameSize: 84,
            headingSize: 26,
            bodySize: 22,
            nameAlignment: AlignmentType.CENTER,
            sectionAlignment: AlignmentType.CENTER,
            color: colorHex
        },
        developer: {
            font: 'Consolas',
            nameSize: 56,
            headingSize: 24,
            bodySize: 20,
            nameAlignment: AlignmentType.LEFT,
            sectionAlignment: AlignmentType.LEFT,
            color: '3B82F6' // Blue for developer theme
        },
        simple: {
            font: 'Arial',
            nameSize: 64,
            headingSize: 24,
            bodySize: 22,
            nameAlignment: AlignmentType.LEFT,
            sectionAlignment: AlignmentType.LEFT,
            color: '000000'
        },
        creative: {
            font: 'Trebuchet MS',
            nameSize: 72,
            headingSize: 32,
            bodySize: 22,
            nameAlignment: AlignmentType.LEFT,
            sectionAlignment: AlignmentType.LEFT,
            color: colorHex
        },
        bold: {
            font: 'Arial Black',
            nameSize: 72,
            headingSize: 36,
            bodySize: 22,
            nameAlignment: AlignmentType.LEFT,
            sectionAlignment: AlignmentType.LEFT,
            color: colorHex
        },
        minimalist: {
            font: 'Helvetica',
            nameSize: 56,
            headingSize: 22,
            bodySize: 20,
            nameAlignment: AlignmentType.LEFT,
            sectionAlignment: AlignmentType.LEFT,
            color: '666666'
        },
        executive: {
            font: 'Garamond',
            nameSize: 72,
            headingSize: 26,
            bodySize: 22,
            nameAlignment: AlignmentType.CENTER,
            sectionAlignment: AlignmentType.LEFT,
            color: colorHex
        },
        techstack: {
            font: 'Consolas',
            nameSize: 64,
            headingSize: 24,
            bodySize: 20,
            nameAlignment: AlignmentType.LEFT,
            sectionAlignment: AlignmentType.LEFT,
            color: '10B981' // Green for tech theme
        },
        gradient: {
            font: 'Segoe UI',
            nameSize: 72,
            headingSize: 26,
            bodySize: 22,
            nameAlignment: AlignmentType.LEFT,
            sectionAlignment: AlignmentType.LEFT,
            color: colorHex
        }
    };

    return styles[template] || styles.classic;
};

// =====================================================
// ELEGANT TEMPLATE - Centered, serif font, refined layout
// =====================================================
const generateElegantDOCX = async (resume) => {
    const {
        personalInfo = {},
        summary = '',
        experience = [],
        education = [],
        projects = [],
        skills = [],
        theme = {},
        sectionOrder = ['summary', 'experience', 'education', 'projects', 'skills']
    } = resume;

    const themeColor = theme.color ? theme.color.replace('#', '').toUpperCase() : 'EA580C';

    // Build contact string
    const contactParts = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
        personalInfo.linkedin,
        personalInfo.website
    ].filter(Boolean);

    // Elegant: Centered section title with bottom border
    const createElegantSectionTitle = (title) => new Paragraph({
        children: [
            new TextRun({
                text: title.toUpperCase(),
                size: 24,
                font: 'Georgia',
                color: themeColor
            })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 120 },
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 4, color: themeColor }
        }
    });

    // Header - Centered name and title
    const headerParagraphs = [
        new Paragraph({
            children: [
                new TextRun({
                    text: personalInfo.fullName || 'Your Name',
                    size: 56,
                    font: 'Georgia',
                    color: themeColor
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 }
        }),
        personalInfo.profession ? new Paragraph({
            children: [
                new TextRun({
                    text: personalInfo.profession.toUpperCase(),
                    size: 20,
                    font: 'Georgia',
                    color: '888888',
                    characterSpacing: 60
                }) 
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 } 
        }) : null,
        new Paragraph({
            children: [
                new TextRun({
                    text: contactParts.join('  •  '),
                    size: 18,
                    font: 'Georgia',
                    italics: true,
                    color: '666666'
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            border: {
                bottom: { style: BorderStyle.SINGLE, size: 8, color: themeColor }
            }
        })
    ].filter(Boolean);

    // Build sections based on sectionOrder
    const buildElegantSection = (sectionName) => {
        switch (sectionName) {
            case 'summary':
                if (!summary) return [];
                return [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: summary,
                                size: 22,
                                font: 'Georgia',
                                italics: true,
                                color: '555555'
                            })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 200, after: 300 }
                    })
                ];

            case 'experience':
                if (experience.filter(Boolean).length === 0) return [];
                return [
                    createElegantSectionTitle('Experience'),
                    ...experience.filter(Boolean).flatMap(exp => [
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.NONE },
                                bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE },
                                right: { style: BorderStyle.NONE },
                                insideHorizontal: { style: BorderStyle.NONE },
                                insideVertical: { style: BorderStyle.NONE }
                            },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            width: { size: 30, type: WidthType.PERCENTAGE },
                                            children: [
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({ text: exp.company || '', bold: true, size: 22, font: 'Georgia' })
                                                    ],
                                                    alignment: AlignmentType.RIGHT
                                                }),
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({ text: `${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}`, italics: true, size: 18, font: 'Georgia', color: '888888' })
                                                    ],
                                                    alignment: AlignmentType.RIGHT
                                                })
                                            ],
                                            verticalAlign: VerticalAlign.TOP
                                        }),
                                        new TableCell({
                                            width: { size: 70, type: WidthType.PERCENTAGE },
                                            children: [
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({ text: exp.role || '', bold: true, size: 22, font: 'Georgia' })
                                                    ]
                                                }),
                                                new Paragraph({
                                                    children: [
                                                        new TextRun({ text: exp.description || '', size: 20, font: 'Georgia', color: '555555' })
                                                    ],
                                                    spacing: { after: 200 }
                                                })
                                            ],
                                            margins: { left: 200 }
                                        })
                                    ]
                                })
                            ]
                        })
                    ])
                ];

            case 'education':
                const safeEdu = education.filter(Boolean);
                if (safeEdu.length === 0) return [];
                // Two-column grid layout for education (matching elegant template)
                const eduRows = [];
                for (let i = 0; i < safeEdu.length; i += 2) {
                    const edu1 = safeEdu[i];
                    const edu2 = safeEdu[i + 1];
                    eduRows.push(
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    children: [
                                        new Paragraph({
                                            children: [new TextRun({ text: edu1.school || '', bold: true, size: 22, font: 'Georgia' })],
                                            alignment: AlignmentType.CENTER
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: edu1.degree || '', italics: true, size: 20, font: 'Georgia', color: '666666' })],
                                            alignment: AlignmentType.CENTER
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: edu1.year || '', size: 18, font: 'Georgia', color: '888888' })],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { after: 200 }
                                        })
                                    ],
                                    verticalAlign: VerticalAlign.TOP
                                }),
                                edu2 ? new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    children: [
                                        new Paragraph({
                                            children: [new TextRun({ text: edu2.school || '', bold: true, size: 22, font: 'Georgia' })],
                                            alignment: AlignmentType.CENTER
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: edu2.degree || '', italics: true, size: 20, font: 'Georgia', color: '666666' })],
                                            alignment: AlignmentType.CENTER
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: edu2.year || '', size: 18, font: 'Georgia', color: '888888' })],
                                            alignment: AlignmentType.CENTER,
                                            spacing: { after: 200 }
                                        })
                                    ],
                                    verticalAlign: VerticalAlign.TOP
                                }) : new TableCell({
                                    width: { size: 50, type: WidthType.PERCENTAGE },
                                    children: [new Paragraph({ children: [] })]
                                })
                            ]
                        })
                    );
                }
                return [
                    createElegantSectionTitle('Education'),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        borders: {
                            top: { style: BorderStyle.NONE },
                            bottom: { style: BorderStyle.NONE },
                            left: { style: BorderStyle.NONE },
                            right: { style: BorderStyle.NONE },
                            insideHorizontal: { style: BorderStyle.NONE },
                            insideVertical: { style: BorderStyle.NONE }
                        },
                        rows: eduRows
                    })
                ];

            case 'projects':
                if (projects.filter(Boolean).length === 0) return [];
                return [
                    createElegantSectionTitle('Selected Works'),
                    ...projects.filter(Boolean).flatMap(proj => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: proj.title || '', bold: true, size: 20, font: 'Georgia' }),
                                new TextRun({ text: `     ${proj.category || proj.type || ''}`, italics: true, size: 18, font: 'Georgia', color: '888888' })
                            ],
                            border: { bottom: { style: BorderStyle.DOTTED, size: 4, color: 'CCCCCC' } },
                            spacing: { before: 120, after: 60 }
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: proj.description || '', size: 20, font: 'Georgia', color: '666666' })
                            ],
                            spacing: { after: 160 }
                        })
                    ])
                ];

            case 'skills':
                if (skills.filter(Boolean).length === 0) return [];
                const skillsText = skills.filter(Boolean).map(s => typeof s === 'object' ? (s.name || s.title || JSON.stringify(s)) : String(s)).join('   •   ');
                return [
                    createElegantSectionTitle('Expertise'),
                    new Paragraph({
                        children: [
                            new TextRun({ text: skillsText, size: 20, font: 'Georgia', color: '555555' })
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                    })
                ];

            default:
                return [];
        }
    };

    const sectionParagraphs = sectionOrder.flatMap(section => buildElegantSection(section));

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 360, right: 360, bottom: 360, left: 360 }
                }
            },
            children: [...headerParagraphs, ...sectionParagraphs]
        }]
    });

    return await Packer.toBuffer(doc);
};

// =====================================================
// DEVELOPER TEMPLATE - Monospace font, code-style headers
// =====================================================
const generateDeveloperDOCX = async (resume) => {
    const {
        personalInfo = {},
        summary = '',
        experience = [],
        education = [],
        projects = [],
        skills = [],
        sectionOrder = ['summary', 'experience', 'education', 'projects', 'skills']
    } = resume;

    // Filter out potential nulls in data arrays to prevent crashes
    const safeExperience = experience.filter(Boolean);
    const safeEducation = education.filter(Boolean);
    const safeProjects = projects.filter(Boolean);
    const safeSkills = skills.filter(Boolean);

    const blueColor = '3B82F6';

    const contactParts = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
        personalInfo.linkedin,
        personalInfo.website
    ].filter(Boolean);

    // Developer-style section title (code syntax)
    const createDevSectionTitle = (title) => new Paragraph({
        children: [
            new TextRun({
                text: title,
                size: 18,
                font: 'Consolas',
                color: '6B7280',
                bold: true
            })
        ],
        spacing: { before: 300, after: 120 }
    });

    const imageBuffer = await getImageBuffer(personalInfo.image);

    const headerParagraphs = [
        imageBuffer ? new Paragraph({
            children: [
                new ImageRun({
                    data: imageBuffer,
                    transformation: { width: 50, height: 50 },
                })
            ],
            shading: { fill: '0F172A' },
            spacing: { before: 100, after: 100 }
        }) : null,
        new Paragraph({
            children: [
                new TextRun({ text: personalInfo.fullName || 'Dev Name', bold: true, size: 40, font: 'Consolas', color: 'FFFFFF' })
            ],
            shading: { fill: '0F172A' },
            spacing: { after: 40 }
        }),
        personalInfo.profession ? new Paragraph({
            children: [
                new TextRun({ text: personalInfo.profession, size: 18, font: 'Consolas', color: blueColor, bold: true })
            ],
            shading: { fill: '0F172A' },
            spacing: { after: 100 }
        }) : null,
        new Paragraph({
            children: [
                ...[
                    personalInfo.email ? { text: personalInfo.email, link: `mailto:${personalInfo.email}` } : null,
                    personalInfo.phone ? { text: personalInfo.phone } : null,
                    personalInfo.location ? { text: personalInfo.location } : null,
                    personalInfo.linkedin ? { text: personalInfo.linkedin, link: personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}` } : null
                ].filter(Boolean).flatMap((item, idx, arr) => [
                    item.link ? new ExternalHyperlink({
                        children: [new TextRun({ text: item.text, size: 14, font: 'Consolas', color: blueColor, underline: {} })],
                        link: item.link
                    }) : new TextRun({ text: item.text, size: 14, font: 'Consolas', color: '94A3B8' }),
                    idx < arr.length - 1 ? new TextRun({ text: ' | ', size: 14, font: 'Consolas', color: '4B5563' }) : null
                ]).filter(Boolean)
            ],
            shading: { fill: '0F172A' },
            spacing: { after: 200 }
        })
    ].filter(Boolean);

    const buildDevSection = (sectionName) => {
        switch (sectionName) {
            case 'summary':
                if (!summary) return [];
                return [
                    createDevSectionTitle('System.initialize()'),
                    new Paragraph({
                        children: [new TextRun({ text: summary, size: 20, font: 'Consolas', color: '4B5563' })],
                        spacing: { after: 200 }
                    })
                ];

            case 'experience':
                if (experience.filter(Boolean).length === 0) return [];
                return [
                    createDevSectionTitle('Work_History[]'),
                    ...experience.filter(Boolean).flatMap(exp => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: exp.role || '', bold: true, size: 22, font: 'Consolas', color: blueColor }),
                                new TextRun({ text: `  // ${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}`, size: 18, font: 'Consolas', color: '9CA3AF' })
                            ],
                            shading: { fill: 'F3F4F6' },
                            spacing: { before: 100 }
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: exp.company || '', bold: true, size: 18, font: 'Consolas', color: '6B7280' })]
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: exp.description || '', size: 18, font: 'Consolas', color: '4B5563' })],
                            spacing: { after: 160 }
                        })
                    ])
                ];

            case 'education':
                if (education.filter(Boolean).length === 0) return [];
                return [
                    createDevSectionTitle('Academia[]'),
                    ...education.filter(Boolean).flatMap(edu => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: edu.school || '', bold: true, size: 20, font: 'Consolas' }),
                                new TextRun({ text: `  // ${edu.year || ''}`, size: 18, font: 'Consolas', color: blueColor })
                            ]
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: edu.degree || '', size: 18, font: 'Consolas', color: '6B7280' })],
                            spacing: { after: 120 }
                        })
                    ])
                ];

            case 'projects':
                if (projects.filter(Boolean).length === 0) return [];
                return [
                    createDevSectionTitle('Repository.getProjects()'),
                    ...projects.filter(Boolean).flatMap(proj => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: proj.title || '', bold: true, size: 20, font: 'Consolas' }),
                                new TextRun({ text: `  [${proj.category || proj.type || ''}]`, size: 16, font: 'Consolas', color: blueColor })
                            ],
                            spacing: { before: 80 }
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: proj.description || '', size: 18, font: 'Consolas', color: '6B7280' })],
                            spacing: { after: 120 }
                        })
                    ])
                ];

            case 'skills':
                if (skills.filter(Boolean).length === 0) return [];
                const safeSkills = skills.filter(Boolean);
                return [
                    createDevSectionTitle('Stack[]'),
                    new Paragraph({
                        children: safeSkills.map((s, i) => new TextRun({
                            text: `${typeof s === 'object' ? (s.name || s.title) : String(s)}${i < safeSkills.length - 1 ? '  •  ' : ''}`,
                            size: 18,
                            font: 'Consolas',
                            color: blueColor
                        })),
                        spacing: { after: 200 }
                    })
                ];

            default:
                return [];
        }
    };

    const sectionParagraphs = sectionOrder.flatMap(section => buildDevSection(section));

    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 360, right: 360, bottom: 360, left: 360 } } },
            children: [...headerParagraphs.filter(Boolean), ...sectionParagraphs.filter(Boolean)]
        }]
    });

    return await Packer.toBuffer(doc);
};

// =====================================================
// MODERN TEMPLATE - Sidebar layout, clean sans font
// =====================================================
const generateModernDOCX = async (resume) => {
    const {
        personalInfo = {},
        summary = '',
        experience = [],
        education = [],
        projects = [],
        skills = [],
        theme = {}
    } = resume;

    const themeColor = theme.color ? theme.color.replace('#', '').toUpperCase() : 'EA580C';
    const imageBuffer = await getImageBuffer(personalInfo.image);

    const sidebarChildren = [
        imageBuffer ? new Paragraph({
            children: [
                new ImageRun({
                    data: imageBuffer,
                    transformation: { width: 80, height: 80 },
                })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 300 }
        }) : null,
        new Paragraph({
            children: [
                new TextRun({ text: 'CONTACT', bold: true, size: 18, font: 'Arial', color: '999999', characterSpacing: 40 })
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'EEEEEE' } },
            spacing: { before: 200, after: 100 }
        }),
        ...[
            personalInfo.email ? { text: personalInfo.email, label: 'Email', link: `mailto:${personalInfo.email}` } : null,
            personalInfo.phone ? { text: personalInfo.phone, label: 'Phone' } : null,
            personalInfo.location ? { text: personalInfo.location, label: 'Location' } : null,
            personalInfo.linkedin ? { text: personalInfo.linkedin, label: 'LinkedIn', link: personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}` } : null,
            personalInfo.website ? { text: personalInfo.website, label: 'Web', link: personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}` } : null
        ].filter(Boolean).map(item => new Paragraph({
            children: [
                item.link ? new ExternalHyperlink({
                    children: [new TextRun({ text: item.text, size: 16, font: 'Arial', color: '3B82F6', underline: {} })],
                    link: item.link
                }) : new TextRun({ text: item.text, size: 16, font: 'Arial', color: '666666' })
            ],
            spacing: { after: 80 }
        })),
        education.filter(Boolean).length > 0 ? new Paragraph({
            children: [
                new TextRun({ text: 'EDUCATION', bold: true, size: 18, font: 'Arial', color: '999999', characterSpacing: 40 })
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'EEEEEE' } },
            spacing: { before: 400, after: 100 }
        }) : null,
        ...education.filter(Boolean).flatMap(edu => [
            new Paragraph({
                children: [new TextRun({ text: edu.degree || '', bold: true, size: 18, font: 'Arial' })]
            }),
            new Paragraph({
                children: [new TextRun({ text: edu.school || '', size: 16, font: 'Arial', color: '666666' })]
            }),
            new Paragraph({
                children: [new TextRun({ text: edu.year || '', size: 16, font: 'Arial', color: '999999', bold: true })],
                spacing: { after: 150 }
            })
        ]),
        skills.filter(Boolean).length > 0 ? new Paragraph({
            children: [
                new TextRun({ text: 'SKILLS', bold: true, size: 18, font: 'Arial', color: '999999', characterSpacing: 40 })
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'EEEEEE' } },
            spacing: { before: 400, after: 100 }
        }) : null,
        new Paragraph({
            children: skills.filter(Boolean).map((s, i) => new TextRun({
                text: `${typeof s === 'object' ? (s.name || s.title) : String(s)}${i < skills.length - 1 ? ' • ' : ''}`,
                size: 16, font: 'Arial', color: '666666', bold: true
            })),
            spacing: { after: 200 }
        })
    ].filter(Boolean);

    const mainChildren = [
        new Paragraph({
            children: [
                new TextRun({ text: (personalInfo.fullName || 'Name').toUpperCase(), bold: true, size: 48, font: 'Arial' })
            ]
        }),
        personalInfo.profession ? new Paragraph({
            children: [
                new TextRun({ text: personalInfo.profession, bold: true, size: 24, font: 'Arial', color: themeColor })
            ],
            spacing: { after: 300 }
        }) : null,
        summary ? new Paragraph({
            children: [
                new TextRun({ text: 'PROFILE', bold: true, size: 18, font: 'Arial', color: '999999', characterSpacing: 40 })
            ],
            spacing: { before: 200, after: 100 }
        }) : null,
        summary ? new Paragraph({
            children: [new TextRun({ text: summary, size: 20, font: 'Arial', color: '444444' })],
            spacing: { after: 300 }
        }) : null,
        experience.filter(Boolean).length > 0 ? new Paragraph({
            children: [
                new TextRun({ text: 'EXPERIENCE', bold: true, size: 18, font: 'Arial', color: '999999', characterSpacing: 40 })
            ],
            spacing: { before: 200, after: 100 }
        }) : null,
        ...experience.filter(Boolean).flatMap(exp => [
            new Paragraph({
                children: [
                    new TextRun({ text: exp.role || '', bold: true, size: 22, font: 'Arial' }),
                    new TextRun({ text: `\t${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}`, size: 18, font: 'Arial', color: '999999', bold: true })
                ],
                tabStops: [{ type: "right", position: 9000 }]
            }),
            new Paragraph({
                children: [new TextRun({ text: exp.company || '', bold: true, size: 18, font: 'Arial', color: '666666' })]
            }),
            new Paragraph({
                children: [new TextRun({ text: exp.description || '', size: 20, font: 'Arial', color: '444444' })],
                spacing: { after: 200 }
            })
        ]),
        projects.filter(Boolean).length > 0 ? new Paragraph({
            children: [
                new TextRun({ text: 'PROJECTS', bold: true, size: 18, font: 'Arial', color: '999999', characterSpacing: 40 })
            ],
            spacing: { before: 200, after: 100 }
        }) : null,
        ...projects.filter(Boolean).flatMap(proj => [
            new Paragraph({
                children: [
                    new TextRun({ text: proj.title || '', bold: true, size: 20, font: 'Arial' }),
                    new TextRun({ text: ` | ${proj.category || proj.type || ''}`, size: 18, font: 'Arial', color: '999999' })
                ]
            }),
            new Paragraph({
                children: [new TextRun({ text: proj.description || '', size: 20, font: 'Arial', color: '444444' })],
                spacing: { after: 150 }
            })
        ])
    ].filter(Boolean);

    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 360, right: 360, bottom: 360, left: 360 } } },
            children: [
                new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE }
                    },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    width: { size: 30, type: WidthType.PERCENTAGE },
                                    children: sidebarChildren,
                                    shading: { fill: 'F9FAFB' },
                                    margins: { left: 200, right: 200, top: 200, bottom: 200 }
                                }),
                                new TableCell({
                                    width: { size: 70, type: WidthType.PERCENTAGE },
                                    children: mainChildren,
                                    margins: { left: 400, top: 200 }
                                })
                            ]
                        })
                    ]
                })
            ]
        }]
    });

    return await Packer.toBuffer(doc);
};

// =====================================================
// CREATIVE TEMPLATE - Decorative elements, initials box
// =====================================================
const generateCreativeDOCX = async (resume) => {
    const {
        personalInfo = {},
        summary = '',
        experience = [],
        education = [],
        projects = [],
        skills = [],
        theme = {},
        sectionOrder = ['summary', 'experience', 'education', 'projects', 'skills']
    } = resume;

    const themeColor = theme.color ? theme.color.replace('#', '').toUpperCase() : 'EA580C';

    const initials = personalInfo.fullName 
        ? personalInfo.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
        : 'YN';

    const imageBuffer = await getImageBuffer(personalInfo.image);

    const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 1200, type: WidthType.DXA },
                        children: [
                            imageBuffer ? new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: imageBuffer,
                                        transformation: { width: 60, height: 60 },
                                    })
                                ],
                                alignment: AlignmentType.CENTER
                            }) : new Paragraph({
                                children: [new TextRun({ text: initials, color: "FFFFFF", bold: true, size: 52, font: "Trebuchet MS" })],
                                alignment: AlignmentType.CENTER,
                            })
                        ],
                        shading: { fill: themeColor },
                        verticalAlign: VerticalAlign.CENTER,
                        margins: { top: imageBuffer ? 80 : 240, bottom: imageBuffer ? 80 : 240, left: 100, right: 100 }
                    }),
                    new TableCell({
                        width: { size: 85, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: (personalInfo.fullName || 'Name').toUpperCase(), bold: true, size: 72, font: "Trebuchet MS", color: themeColor })],
                                indent: { left: 400 },
                                spacing: { before: 100, after: 160 }
                            }),
                            personalInfo.profession ? new Paragraph({
                                children: [new TextRun({ text: personalInfo.profession, bold: true, size: 24, font: "Trebuchet MS", color: "374151" })],
                                indent: { left: 400 },
                                spacing: { after: 200 }
                            }) : null,
                            new Table({
                                width: { size: 95, type: WidthType.PERCENTAGE },
                                indent: { size: 400, type: WidthType.DXA },
                                borders: {
                                    top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                                    left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
                                    insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
                                },
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({ 
                                                width: { size: 50, type: WidthType.PERCENTAGE },
                                                children: [
                                                    new Paragraph({ 
                                                        children: [
                                                            new TextRun({ text: "✉ ", size: 16, font: "Trebuchet MS", color: "4B5563" }),
                                                            personalInfo.email ? new ExternalHyperlink({
                                                                children: [new TextRun({ text: personalInfo.email, size: 16, font: "Trebuchet MS", color: "4B5563", underline: {} })],
                                                                link: `mailto:${personalInfo.email}`
                                                            }) : new TextRun({ text: "" })
                                                        ] 
                                                    })
                                                ] 
                                            }),
                                            new TableCell({ 
                                                width: { size: 50, type: WidthType.PERCENTAGE },
                                                children: [
                                                    new Paragraph({ 
                                                        children: [
                                                            new TextRun({ text: "☎ ", size: 16, font: "Trebuchet MS", color: "4B5563" }),
                                                            new TextRun({ text: personalInfo.phone || '', size: 16, font: "Trebuchet MS", color: "4B5563" })
                                                        ] 
                                                    })
                                                ] 
                                            })
                                        ]
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({ 
                                                width: { size: 100, type: WidthType.PERCENTAGE },
                                                children: [
                                                    new Paragraph({ 
                                                        children: [
                                                            new TextRun({ text: "📍 ", size: 16, font: "Trebuchet MS", color: "4B5563" }),
                                                            new TextRun({ text: personalInfo.location || '', size: 16, font: "Trebuchet MS", color: "4B5563" })
                                                        ] 
                                                    })
                                                ] 
                                            }),
                                            new TableCell({ 
                                                width: { size: 50, type: WidthType.PERCENTAGE },
                                                children: [
                                                    new Paragraph({ 
                                                        children: [
                                                            new TextRun({ text: "🔗 ", size: 16, font: "Trebuchet MS", color: "4B5563" }),
                                                            personalInfo.linkedin ? new ExternalHyperlink({
                                                                children: [new TextRun({ text: personalInfo.linkedin, size: 16, font: "Trebuchet MS", color: "4B5563", underline: {} })],
                                                                link: personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`
                                                            }) : new TextRun({ text: "" })
                                                        ] 
                                                    })
                                                ] 
                                            })
                                        ]
                                    }),
                                    personalInfo.website || personalInfo.github ? new TableRow({
                                        children: [
                                            new TableCell({ 
                                                width: { size: 50, type: WidthType.PERCENTAGE },
                                                children: [
                                                    new Paragraph({ 
                                                        children: [
                                                            new TextRun({ text: "🌐 ", size: 16, font: "Trebuchet MS", color: "4B5563" }),
                                                            personalInfo.website ? new ExternalHyperlink({
                                                                children: [new TextRun({ text: "Website", size: 16, font: "Trebuchet MS", color: "4B5563", underline: {} })],
                                                                link: personalInfo.website.startsWith('http') ? personalInfo.website : `https://${personalInfo.website}`
                                                            }) : new TextRun({ text: "N/A", size: 16, font: "Trebuchet MS", color: "9CA3AF" })
                                                        ] 
                                                    })
                                                ] 
                                            }),
                                            new TableCell({ 
                                                width: { size: 50, type: WidthType.PERCENTAGE },
                                                children: [
                                                    new Paragraph({ 
                                                        children: [
                                                            new TextRun({ text: "💻 ", size: 16, font: "Trebuchet MS", color: "4B5563" }),
                                                            personalInfo.github ? new ExternalHyperlink({
                                                                children: [new TextRun({ text: "GitHub", size: 16, font: "Trebuchet MS", color: "4B5563", underline: {} })],
                                                                link: personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`
                                                            }) : new TextRun({ text: "N/A", size: 16, font: "Trebuchet MS", color: "9CA3AF" })
                                                        ] 
                                                    })
                                                ] 
                                            })
                                        ]
                                    }) : null
                                ].filter(Boolean)
                            })
                        ].filter(Boolean)
                    })
                ]
            })
        ]
    });

    const createTitle = (title) => new Paragraph({
        children: [
            new TextRun({ text: "◆ ", color: themeColor, size: 26, font: "Trebuchet MS" }),
            new TextRun({ text: title, bold: true, size: 26, font: "Trebuchet MS", color: "111827" })
        ],
        spacing: { before: 400, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 15, color: "E2E8F0" } }
    });

    const buildSection = (sectionName) => {
        switch (sectionName) {
            case 'summary':
                if (!summary) return [];
                return [createTitle('About Me'), new Paragraph({ children: [new TextRun({ text: summary, size: 19, font: "Trebuchet MS", color: "374151" })], spacing: { after: 200, before: 100 } })];
            case 'experience':
                if (experience.length === 0) return [];
                return [createTitle('Experience'), ...experience.flatMap(exp => [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "● ", color: themeColor, size: 18 }),
                            new TextRun({ text: exp.role || '', bold: true, size: 21, font: "Trebuchet MS" }),
                            new TextRun({ text: `\t${exp.startDate || ''} – ${exp.current ? 'Present' : (exp.endDate || '')}`, size: 18, font: "Trebuchet MS", color: themeColor, bold: true })
                        ],
                        tabStops: [{ type: "right", position: 9000 }],
                        spacing: { before: 150 }
                    }),
                    new Paragraph({ children: [new TextRun({ text: exp.company || '', bold: true, size: 19, font: "Trebuchet MS", color: "4B5563" })], indent: { left: 400 } }),
                    new Paragraph({ children: [new TextRun({ text: exp.description || '', size: 18, font: "Trebuchet MS", color: "374151" })], indent: { left: 400 }, spacing: { after: 200 } })
                ])];
            case 'education':
                if (education.length === 0) return [];
                return [createTitle('Education'), ...education.flatMap(edu => [
                    new Paragraph({
                        children: [
                            new TextRun({ text: edu.degree || '', bold: true, size: 21, font: "Trebuchet MS" }),
                            new TextRun({ text: `\t${edu.year || ''}`, size: 18, font: "Trebuchet MS", color: themeColor, bold: true })
                        ],
                        tabStops: [{ type: "right", position: 9000 }],
                        spacing: { before: 150 }
                    }),
                    new Paragraph({ children: [new TextRun({ text: edu.school || '', size: 19, font: "Trebuchet MS", color: "4B5563" })], spacing: { after: 150 } })
                ])];
            case 'projects':
                if (projects.length === 0) return [];
                return [createTitle('Projects'), ...projects.flatMap(proj => [
                    new Paragraph({ 
                        children: [
                            new TextRun({ text: proj.title || '', bold: true, size: 21, font: "Trebuchet MS" }), 
                            new TextRun({ text: `  |  ${proj.category || proj.type || ''}`, size: 18, font: "Trebuchet MS", color: "666666" }),
                            proj.link ? new TextRun({ text: "   " }) : new TextRun({ text: "" }),
                            proj.link ? new ExternalHyperlink({
                                children: [new TextRun({ text: proj.link, size: 18, font: "Trebuchet MS", color: "3B82F6", underline: {} })],
                                link: proj.link.startsWith('http') ? proj.link : `https://${proj.link}`
                            }) : new TextRun({ text: "" })
                        ], 
                        spacing: { before: 150 } 
                    }),
                    new Paragraph({ children: [new TextRun({ text: proj.description || '', size: 18, font: "Trebuchet MS", color: "374151" })], spacing: { after: 150 } })
                ])];
            case 'skills':
                if (skills.length === 0) return [];
                return [createTitle('Skills'), new Paragraph({ 
                    children: skills.flatMap((skill, idx) => [
                        new TextRun({ text: skill, size: 19, font: "Trebuchet MS", bold: true, color: "374151" }),
                        idx < skills.length - 1 ? new TextRun({ text: "   •   ", size: 19, font: "Trebuchet MS", color: themeColor, bold: true }) : null
                    ]).filter(Boolean),
                    spacing: { after: 300, before: 100 } 
                })];
            default: return [];
        }
    };

    const sectionParagraphs = sectionOrder.flatMap(section => buildSection(section));
    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 360, right: 360, bottom: 360, left: 360 } } },
            children: [
                new Paragraph({ 
                    border: { top: { style: BorderStyle.SINGLE, size: 30, color: "000000" } }, 
                    spacing: { after: 200 } 
                }), 
                headerTable, 
                ...sectionParagraphs
            ]
        }]
    });
    return await Packer.toBuffer(doc);
};

// =====================================================
// MAIN DOCX GENERATOR - Standardized Format
// =====================================================
const generateDOCX = async (resume) => {
    const templateName = resume.theme?.template || 'classic';

    console.log(`[DOCX Generator] Generating standardized DOCX for template: ${templateName}`);

    // User requested "Same DOCX format for all templates".
    // We bypass the specific generators (elegant, developer, etc.) and use the
    // robust, ATS-friendly "Classic" generator for everything.
    // This ensures consistent layout structure while preserving theme fonts/colors.
    return await generateClassicDOCX(resume);
};

// Classic/Generic generator (kept for fallback)
const generateClassicDOCX = async (resume) => {
    const {
        personalInfo = {},
        summary = '',
        experience = [],
        education = [],
        projects = [],
        skills = [],
        theme = {},
        sectionOrder = ['summary', 'experience', 'education', 'projects', 'skills']
    } = resume;

    const templateName = theme.template || 'classic';
    const style = getTemplateStyles(templateName, theme.color);

    const contactParts = [
        personalInfo.email,
        personalInfo.phone,
        personalInfo.location,
        personalInfo.linkedin,
        personalInfo.website
    ].filter(Boolean);

    const createSectionTitle = (title) => new Paragraph({
        children: [
            new TextRun({
                text: title.toUpperCase(),
                bold: true,
                size: style.headingSize,
                font: style.font,
                color: style.color
            })
        ],
        alignment: style.sectionAlignment,
        spacing: { before: 300, after: 120 },
        border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: style.color }
        }
    });

    const buildSection = (sectionName) => {
        switch (sectionName) {
            case 'summary':
                if (!summary) return [];
                return [
                    createSectionTitle('Professional Summary'),
                    new Paragraph({
                        children: [new TextRun({ text: summary, size: style.bodySize, font: style.font })],
                        spacing: { after: 200 }
                    })
                ];

            case 'experience':
                if (experience.filter(Boolean).length === 0) return [];
                return [
                    createSectionTitle('Work Experience'),
                    ...experience.filter(Boolean).flatMap(exp => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: exp.role || '', bold: true, size: style.bodySize + 2, font: style.font }),
                                new TextRun({ text: `\t${exp.startDate || ''} - ${exp.current ? 'Present' : (exp.endDate || '')}`, size: style.bodySize, font: style.font })
                            ],
                            tabStops: [{ type: "right", position: 9000 }],
                            spacing: { before: 120 }
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: exp.company || '', italics: true, size: style.bodySize, font: style.font, color: '666666' })]
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: exp.description || '', size: style.bodySize, font: style.font })],
                            spacing: { after: 160 }
                        })
                    ])
                ];

            case 'education':
                if (education.filter(Boolean).length === 0) return [];
                return [
                    createSectionTitle('Education'),
                    ...education.filter(Boolean).flatMap(edu => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: edu.degree || '', bold: true, size: style.bodySize + 2, font: style.font }),
                                new TextRun({ text: `\t${edu.year || ''}`, size: style.bodySize, font: style.font })
                            ],
                            tabStops: [{ type: "right", position: 9000 }],
                            spacing: { before: 80 }
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: edu.school || '', italics: true, size: style.bodySize, font: style.font, color: '666666' })],
                            spacing: { after: 120 }
                        })
                    ])
                ];

            case 'projects':
                if (projects.filter(Boolean).length === 0) return [];
                return [
                    createSectionTitle('Projects'),
                    ...projects.filter(Boolean).flatMap(proj => [
                        new Paragraph({
                            children: [
                                new TextRun({ text: proj.title || '', bold: true, size: style.bodySize + 2, font: style.font }),
                                new TextRun({ text: proj.category || proj.type ? `\t[${proj.category || proj.type}]` : '', size: style.bodySize, font: style.font, color: '888888' })
                            ],
                            tabStops: [{ type: "right", position: 9000 }],
                            spacing: { before: 100 }
                        }),
                        new Paragraph({
                            children: [new TextRun({ text: proj.description || '', size: style.bodySize, font: style.font })],
                            spacing: { after: 140 }
                        })
                    ])
                ];

            case 'skills':
                if (skills.filter(Boolean).length === 0) return [];
                const skillsText = skills.filter(Boolean).map(s => typeof s === 'object' ? (s.name || s.title || JSON.stringify(s)) : String(s)).join('  •  ');
                return [
                    createSectionTitle('Skills'),
                    new Paragraph({
                        children: [new TextRun({ text: skillsText, size: style.bodySize, font: style.font })],
                        spacing: { after: 200 }
                    })
                ];

            default:
                return [];
        }
    };

    const headerParagraphs = [
        new Paragraph({
            children: [new TextRun({ text: personalInfo.fullName || 'Your Name', bold: true, size: style.nameSize, font: style.font, color: style.color })],
            alignment: style.nameAlignment,
            spacing: { after: 60 }
        }),
        personalInfo.profession ? new Paragraph({
            children: [new TextRun({ text: personalInfo.profession.toUpperCase(), size: style.bodySize + 4, font: style.font, color: '666666' })],
            alignment: style.nameAlignment,
            spacing: { after: 100 }
        }) : null,
        new Paragraph({
            children: [new TextRun({ text: contactParts.join('  |  '), size: style.bodySize - 2, font: style.font, color: '888888' })],
            alignment: style.nameAlignment,
            spacing: { after: 300 }
        })
    ].filter(Boolean);

    const sectionParagraphs = sectionOrder.flatMap(section => buildSection(section));

    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 360, right: 360, bottom: 360, left: 360 } } },
            children: [...headerParagraphs, ...sectionParagraphs]
        }]
    });

    return await Packer.toBuffer(doc);
};

export { generatePDF, generateDOCX };

