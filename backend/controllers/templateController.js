import db from '../config/firestore.js';

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
const getTemplates = async (req, res) => {
    try {
        const templatesSnapshot = await db.collection('templates').get();
        const templates = templatesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(templates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Seed initial templates (run once to populate Firestore)
// @route   POST /api/templates/seed
// @access  Private (Admin only)
const seedTemplates = async (req, res) => {
    const sampleData = {
        personalInfo: {
            fullName: 'Alex Rivera',
            profession: 'Senior Full Stack Developer',
            email: 'alex.rivera@example.com',
            phone: '+1 (555) 000-1234',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/alexrivera',
            website: 'alexrivera.dev'
        },
        summary: 'Innovative Full Stack Developer with 8+ years of experience in building scalable web applications. Expert in React, Node.js, and Cloud Architecture. Passionate about creating seamless user experiences and mentoring junior developers.',
        experience: [
            {
                company: 'TechFlow Systems',
                role: 'Lead Frontend Engineer',
                startDate: 'Jan 2020',
                endDate: 'Present',
                current: true,
                description: '• Spearheaded the migration from monolithic to micro-frontends architecture.\\n• Improved page load speeds by 40% through advanced caching and optimization.\\n• Led a team of 12 developers across 3 agile squads.'
            },
            {
                company: 'Innovate Digital',
                role: 'Senior Web Developer',
                startDate: 'Mar 2016',
                endDate: 'Dec 2019',
                description: '• Developed and maintained 15+ high-traffic client websites.\\n• Introduced automated testing reducing production bugs by 25%.\\n• Collaborated with UX designers to implement pixel-perfect interfaces.'
            }
        ],
        education: [
            {
                school: 'Stanford University',
                degree: 'B.S. in Computer Science',
                year: '2015'
            }
        ],
        projects: [
            {
                title: 'CloudScale Dashboard',
                category: 'Open Source',
                description: 'A real-time monitoring dashboard for AWS infrastructure with automated alerts.'
            }
        ],
        skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL', 'Docker', 'PostgreSQL', 'System Design'],
        sectionOrder: ['summary', 'experience', 'education', 'projects', 'skills']
    };

    const initialTemplates = [
        {
            id: 'classic',
            name: 'Classic Professional',
            description: 'Timeless and clean. Perfect for corporate roles, banking, and law.',
            color: '#16a34a',
            thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
            tags: ['ATS Friendly', 'Single Column'],
            sampleData: { ...sampleData, theme: { template: 'classic', color: '#16a34a', spacing: 'normal' } }
        },
        {
            id: 'modern',
            name: 'Modern Sidebar',
            description: 'A clean split-column layout with a sidebar for skills and education.',
            color: '#ea580c',
            thumbnail: 'https://images.unsplash.com/photo-1626197031507-c17099753214?w=800&q=80',
            tags: ['Visual', 'Sidebar', 'Modern'],
            sampleData: { ...sampleData, theme: { template: 'modern', color: '#ea580c', spacing: 'normal' } }
        },
        {
            id: 'elegant',
            name: 'Elegant Serif',
            description: 'Sophisticated typography and centered layout for high-level executives.',
            color: '#0f172a',
            thumbnail: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=800&q=80',
            tags: ['Serif', 'Centered', 'Sophisticated'],
            sampleData: { ...sampleData, theme: { template: 'elegant', color: '#0f172a', spacing: 'normal' } }
        },
        {
            id: 'creative',
            name: 'Creative Professional',
            description: 'Eye-catching design for designers, marketers, and creative professionals.',
            color: '#8b5cf6',
            thumbnail: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80',
            tags: ['Creative', 'Colorful', 'Designer'],
            sampleData: { ...sampleData, theme: { template: 'creative', color: '#8b5cf6', spacing: 'normal' } }
        },
        {
            id: 'bold',
            name: 'Bold Impact',
            description: 'Strong visual hierarchy with bold typography for maximum impact.',
            color: '#dc2626',
            thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
            tags: ['Bold', 'Modern', 'Impactful'],
            sampleData: { ...sampleData, theme: { template: 'bold', color: '#dc2626', spacing: 'normal' } }
        },
        {
            id: 'minimalist',
            name: 'Minimalist Pro',
            description: 'Ultra-clean design with maximum white space for modern professionals.',
            color: '#2563eb',
            thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
            tags: ['Clean', 'Minimal', 'Modern'],
            sampleData: { ...sampleData, theme: { template: 'minimalist', color: '#2563eb', spacing: 'normal' } }
        },
        {
            id: 'executive',
            name: 'Executive Premium',
            description: 'Sophisticated serif layout designed for C-suite and senior leadership.',
            color: '#7c3aed',
            thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
            tags: ['Executive', 'Premium', 'Leadership'],
            sampleData: { ...sampleData, theme: { template: 'executive', color: '#7c3aed', spacing: 'normal' } }
        },
        {
            id: 'techstack',
            name: 'Tech Stack',
            description: 'Developer-focused design with prominent technical skills showcase.',
            color: '#10b981',
            thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
            tags: ['Developer', 'Technical', 'Skills-Focused'],
            sampleData: { ...sampleData, theme: { template: 'techstack', color: '#10b981', spacing: 'normal' } }
        },
        {
            id: 'gradient',
            name: 'Gradient Modern',
            description: 'Contemporary card-based design with eye-catching gradient accents.',
            color: '#ec4899',
            thumbnail: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&q=80',
            tags: ['Modern', 'Gradient', 'Creative'],
            sampleData: { ...sampleData, theme: { template: 'gradient', color: '#ec4899', spacing: 'normal' } }
        }
    ];

    try {
        // Delete all existing templates
        const existingTemplates = await db.collection('templates').get();
        const batch = db.batch();
        existingTemplates.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        // Insert new templates
        const promises = initialTemplates.map(template =>
            db.collection('templates').doc(template.id).set(template)
        );
        await Promise.all(promises);

        res.status(201).json({ message: 'Templates seeded successfully', count: initialTemplates.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { getTemplates, seedTemplates };

