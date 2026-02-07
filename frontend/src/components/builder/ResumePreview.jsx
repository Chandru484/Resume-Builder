import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Globe, ExternalLink } from 'lucide-react';

const ResumePreview = ({ data }) => {
    if (!data) return null;
    const { personalInfo = {}, summary = '', experience = [], education = [], projects = [], skills = [], theme = {} } = data;
    const themeColor = theme?.color || '#ea580c';
    // const fontFamilyClass = theme?.fontFamily === 'serif' ? 'font-serif' : theme?.fontFamily === 'mono' ? 'font-mono' : 'font-sans';
    // Using inline style for specific fonts
    const fontStyle = { fontFamily: theme?.fontFamily || 'Inter, sans-serif' };
    const fontFamilyClass = ''; // Deprecated but kept for cleaner diffs in template strings until fully removed

    const sectionOrder = data.sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills'];

    // Dynamic spacing configurations
    const getSpacing = () => {
        const spacing = theme?.spacing || 'normal';
        switch (spacing) {
            case 'compact':
                return {
                    containerGap: 'gap-2',
                    sectionGap: 'space-y-1.5',
                    itemGap: 'gap-1.5',
                    headerPadding: 'pb-3',
                    sectionMargin: 'mb-2'
                };
            case 'relaxed':
                return {
                    containerGap: 'gap-4',
                    sectionGap: 'space-y-3',
                    itemGap: 'gap-3',
                    headerPadding: 'pb-5',
                    sectionMargin: 'mb-4'
                };
            default: // normal
                return {
                    containerGap: 'gap-3',
                    sectionGap: 'space-y-2',
                    itemGap: 'gap-2.5',
                    headerPadding: 'pb-4',
                    sectionMargin: 'mb-3'
                };
        }
    };

    // Dynamic font size configurations
    const getFontSize = () => {
        const fontSize = theme?.fontSize || 'medium';
        switch (fontSize) {
            case 'small':
                return {
                    name: 'text-4xl',
                    profession: 'text-lg',
                    sectionTitle: 'text-base',
                    jobTitle: 'text-sm',
                    bodyText: 'text-xs',
                    dateText: 'text-[10px]',
                    contactText: 'text-xs',
                    skillText: 'text-[10px]'
                };
            case 'large':
                return {
                    name: 'text-6xl',
                    profession: 'text-2xl',
                    sectionTitle: 'text-xl',
                    jobTitle: 'text-lg',
                    bodyText: 'text-base',
                    dateText: 'text-sm',
                    contactText: 'text-base',
                    skillText: 'text-sm'
                };
            default: // medium
                return {
                    name: 'text-5xl',
                    profession: 'text-xl',
                    sectionTitle: 'text-lg',
                    jobTitle: 'text-base',
                    bodyText: 'text-sm',
                    dateText: 'text-xs',
                    contactText: 'text-sm',
                    skillText: 'text-[11px]'
                };
        }
    };

    // Dynamic margins configurations
    const getMargins = () => {
        const margins = theme?.margins || 'normal';
        switch (margins) {
            case 'compact':
                return '15px';
            case 'wide':
                return '35px';
            default: // normal
                return '25px';
        }
    };

    const spacing = getSpacing();
    const fontSize = getFontSize();
    const margins = getMargins();

    const formatUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `https://${url}`;
    };

    /* MultiPageStyles moved to index.css */

    const renderClassic = () => (
        <div className={`resume-page flex flex-col gap-6 text-black text-base ${fontFamilyClass} bg-white min-h-[295mm] p-10`} style={fontStyle}>
            {/* Header */}
            <div className={`flex justify-between items-start pb-6 border-b-2 border-gray-900 mb-6`}>
                <div className="flex-1 pr-8 space-y-3">
                    <h1 className="text-4xl font-extrabold uppercase tracking-wide text-gray-900 leading-none">
                        {personalInfo.fullName || 'NAME'}
                    </h1>
                    {personalInfo.profession && (
                        <p className="text-lg font-medium text-gray-600 uppercase tracking-widest">
                            {personalInfo.profession}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 font-medium mt-4">
                        {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 hover:text-black transition-colors"><Mail className="size-4" /> {personalInfo.email}</a>}
                        {personalInfo.phone && <div className="flex items-center gap-2"><Phone className="size-4" /> {personalInfo.phone}</div>}
                        {personalInfo.location && <div className="flex items-center gap-2"><MapPin className="size-4" /> {personalInfo.location}</div>}
                        {personalInfo.linkedin && <a href={formatUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-black transition-colors"><Linkedin className="size-4" /> LinkedIn</a>}
                        {personalInfo.website && <a href={formatUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-black transition-colors"><Globe className="size-4" /> Portfolio</a>}
                    </div>
                </div>

                {personalInfo.image && (
                    <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm shrink-0">
                        <img src={personalInfo.image} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {sectionOrder.map(section => {
                switch (section) {
                    case 'summary':
                        return summary && (
                            <div key="summary" className="resume-section mb-6">
                                <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-2 mb-3">Professional Summary</h2>
                                <p className="text-gray-700 leading-7 text-base text-justify">{summary}</p>
                            </div>
                        );
                    case 'experience':
                        return experience.length > 0 && (
                            <div key="experience" className="resume-section mb-6">
                                <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-2 mb-4">Work Experience</h2>
                                <div className="flex flex-col gap-6">
                                    {experience.map((exp, idx) => (
                                        <div key={idx} className="space-y-2 resume-item">
                                            <div className="flex justify-between items-baseline border-b border-dashed border-gray-200 pb-2">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">{exp.role}</h3>
                                                    <p className="text-base font-semibold text-gray-600">{exp.company}</p>
                                                </div>
                                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{exp.startDate} — {exp.endDate}</p>
                                            </div>
                                            <p className="text-gray-700 text-base whitespace-pre-line leading-7 text-justify pt-1">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    case 'projects':
                        return projects.length > 0 && (
                            <div key="projects" className="resume-section mb-6">
                                <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-2 mb-4">Projects</h2>
                                <div className="flex flex-col gap-5">
                                    {projects.map((proj, idx) => (
                                        <div key={idx} className="space-y-1 resume-item">
                                            <div className="flex justify-between items-baseline">
                                                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                    {proj.title}
                                                </h3>
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded">{proj.category || proj.type}</span>
                                            </div>
                                            <p className="text-gray-700 text-base leading-7 text-justify">{proj.description}</p>
                                            {proj.link && <a href={formatUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mt-1 font-medium"><ExternalLink className="size-3" /> View Project</a>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    case 'education':
                        return education.length > 0 && (
                            <div key="education" className="resume-section mb-6">
                                <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-2 mb-4">Education</h2>
                                <div className="flex flex-col gap-4">
                                    {education.map((edu, idx) => (
                                        <div key={idx} className="flex justify-between items-center resume-item bg-gray-50 p-4 rounded border border-gray-100">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">{edu.degree}</h3>
                                                <p className="text-gray-600 font-medium text-base">{edu.school}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest rounded bg-white px-3 py-1 border border-gray-200 shadow-sm">{edu.year}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    case 'skills':
                        return skills.length > 0 && (
                            <div key="skills" className="resume-section mb-6">
                                <h2 className="text-lg font-bold uppercase tracking-widest text-gray-900 border-b border-gray-300 pb-2 mb-4">Technical Skills</h2>
                                <div className="flex flex-wrap gap-2.5">
                                    {skills.map((skill, idx) => (
                                        <span key={idx} className="px-4 py-2 bg-white text-gray-800 rounded border border-gray-300 font-semibold shadow-sm text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    default:
                        return null;
                }
            })}
        </div>
    );

    const renderModern = () => (
        <div
            className={`resume-page flex text-black text-base ${fontFamilyClass} min-h-[295mm]`}
            style={{
                background: 'linear-gradient(to right, #f9fafb 32%, white 32%)',
                minHeight: '295mm',
                ...fontStyle
            }}
        >
            {/* Left Sidebar */}
            <div className="w-[32%] bg-transparent p-5 pt-8 space-y-6 border-r border-gray-100 min-h-full flex flex-col">
                {personalInfo.image && (
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-2">
                        <img src={personalInfo.image} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Contact Info */}
                <div className={`${spacing.sectionGap} ${fontSize.bodyText}`}>
                    <h3 className={`font-black uppercase tracking-widest text-gray-400 ${fontSize.dateText} border-b border-gray-200 pb-1.5`}>Contact</h3>
                    <div className="space-y-2">
                        {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 text-gray-600 break-all hover:text-primary-600 transition-colors"><Mail className="size-3.5 shrink-0" /> {personalInfo.email}</a>}
                        {personalInfo.phone && <div className="flex items-center gap-2 text-gray-600"><Phone className="size-3.5 shrink-0" /> {personalInfo.phone}</div>}
                        {personalInfo.location && <div className="flex items-center gap-2 text-gray-600"><MapPin className="size-3.5 shrink-0" /> {personalInfo.location}</div>}
                        {personalInfo.linkedin && <a href={formatUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 break-all hover:text-primary-600 transition-colors"><Linkedin className="size-3.5 shrink-0" /> {personalInfo.linkedin}</a>}
                        {personalInfo.website && <a href={formatUrl(personalInfo.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 break-all hover:text-primary-600 transition-colors"><Globe className="size-3.5 shrink-0" /> {personalInfo.website}</a>}
                    </div>
                </div>

                {/* Education Sidebar */}
                {education.length > 0 && (
                    <div className={spacing.sectionGap}>
                        <h3 className={`font-black uppercase tracking-widest text-gray-400 ${fontSize.dateText} border-b border-gray-200 pb-1.5`}>Education</h3>
                        <div className={spacing.sectionGap}>
                            {education.map((edu, idx) => (
                                <div key={idx} className="resume-item">
                                    <div className={`font-bold text-gray-900 leading-tight ${fontSize.bodyText}`}>{edu.degree}</div>
                                    <div className={`${fontSize.dateText} text-gray-500 mt-0.5`}>{edu.school}</div>
                                    <div className={`${fontSize.dateText} text-gray-400 font-bold mt-0.5`}>{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills Sidebar */}
                {skills.length > 0 && (
                    <div className={spacing.sectionGap}>
                        <h3 className={`font-black uppercase tracking-widest text-gray-400 ${fontSize.dateText} border-b border-gray-200 pb-1.5`}>Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, idx) => (
                                <span key={idx} className={`bg-white border border-gray-200 px-2 py-1 rounded ${fontSize.dateText} font-bold text-gray-600`}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className={`flex-1 p-6 pt-8 ${spacing.containerGap}`}>
                <div>
                    <h1 className={`${fontSize.name.replace('text-5xl', 'text-4xl')} font-black uppercase tracking-tighter text-gray-900 leading-none`}>
                        {personalInfo.fullName || 'NAME'}
                    </h1>
                    {personalInfo.profession && (
                        <p className={`${fontSize.profession} font-bold uppercase tracking-widest mt-1.5`} style={{ color: themeColor }}>
                            {personalInfo.profession}
                        </p>
                    )}
                </div>

                {summary && (
                    <div className="resume-section">
                        <h3 className={`${fontSize.dateText} font-black uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-2`}>
                            <span className="w-8 h-0.5 bg-gray-200"></span>
                            Profile
                        </h3>
                        <p className={`text-gray-600 leading-relaxed ${fontSize.bodyText}`}>{summary}</p>
                    </div>
                )}

                {experience.length > 0 && (
                    <div className="resume-section">
                        <h3 className={`${fontSize.dateText} font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2`}>
                            <span className="w-8 h-0.5 bg-gray-200"></span>
                            Experience
                        </h3>
                        <div className={spacing.containerGap}>
                            {experience.map((exp, idx) => (
                                <div key={idx} className="relative pl-5 border-l-2 border-gray-100 resume-item">
                                    <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2" style={{ borderColor: themeColor }}></span>
                                    <div className="flex justify-between items-baseline mb-1.5">
                                        <h4 className={`font-bold text-gray-900 ${fontSize.jobTitle}`}>{exp.role}</h4>
                                        <span className={`${fontSize.dateText} font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded`}>{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <div className={`${fontSize.bodyText} font-semibold text-gray-500 mb-1.5`}>{exp.company}</div>
                                    <p className={`${fontSize.bodyText} text-gray-600 leading-relaxed whitespace-pre-line`}>{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {projects.length > 0 && (
                    <div className="resume-section">
                        <h3 className={`${fontSize.dateText} font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2`}>
                            <span className="w-8 h-0.5 bg-gray-200"></span>
                            Projects
                        </h3>
                        <div className={`grid grid-cols-1 ${spacing.itemGap}`}>
                            {projects.map((proj, idx) => (
                                <div key={idx} className="bg-gray-50 p-3 rounded-lg resume-item">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className={`font-bold text-gray-900 ${fontSize.bodyText}`}>{proj.title}</h4>
                                        <span className={`${fontSize.dateText} uppercase font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded bg-white`}>{proj.category || proj.type}</span>
                                    </div>
                                    <p className={`${fontSize.dateText} text-gray-600 leading-relaxed mb-1.5`}>{proj.description}</p>
                                    {proj.link && <div className={`${fontSize.dateText} text-blue-600 flex items-center gap-1`}><a href={formatUrl(proj.link)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline"><ExternalLink className="size-3" /> Link</a></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderElegant = () => (
        <div
            className={`resume-page flex flex-col ${spacing.containerGap} text-black text-base ${fontFamilyClass}`}
            style={{
                background: '#ffffff',
                ...fontStyle
            }}
        >
            {/* MultiPageStyles removed */}

            <div className={`text-center pb-6 border-b border-gray-100 ${spacing.sectionMargin}`}>
                <h1 className={`${fontSize.name.replace('text-5xl', 'text-5xl')} text-gray-900 ${fontFamilyClass} tracking-tight mb-3`}>
                    {personalInfo.fullName || 'Your Name'}
                </h1>
                {personalInfo.profession && (
                    <p className={`${fontSize.profession} text-gray-500 uppercase tracking-widest text-sm mb-4`}>
                        {personalInfo.profession}
                    </p>
                )}
                <div className={`flex justify-center flex-wrap gap-x-6 gap-y-2 ${fontSize.bodyText} text-gray-500 ${fontFamilyClass} italic`}>
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="hover:text-black transition-colors">{personalInfo.email}</a>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.linkedin && <a href={formatUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">LinkedIn</a>}
                </div>
            </div>

            {sectionOrder.map(section => {
                const sectionTitleClass = `${fontSize.sectionTitle} text-gray-900 text-center uppercase tracking-widest mb-6 ${fontFamilyClass}`;

                switch (section) {
                    case 'summary':
                        return summary && (
                            <div key="summary" className={`resume-section ${spacing.sectionMargin}`}>
                                <h2 className={sectionTitleClass} style={{ color: themeColor }}>Profile</h2>
                                <p className={`text-center text-gray-600 leading-relaxed ${fontFamilyClass} text-lg max-w-2xl mx-auto`}>{summary}</p>
                            </div>
                        );
                    case 'experience':
                        return experience.length > 0 && (
                            <div key="experience" className={`resume-section ${spacing.sectionMargin}`}>
                                <h2 className={sectionTitleClass} style={{ color: themeColor }}>Experience</h2>
                                <div className={`${spacing.containerGap} relative`}>
                                   {/* Central Line */}
                                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-100 -translate-x-1/2 hidden md:block"></div>
                                    {experience.map((exp, idx) => (
                                        <div key={idx} className="grid md:grid-cols-2 gap-8 resume-item relative">
                                            <div className="md:text-right hidden md:block">
                                                <div className={`font-bold text-gray-900 ${fontSize.profession}`}>{exp.company}</div>
                                                <div className={`${fontSize.bodyText} text-gray-400 italic mt-1 ${fontFamilyClass}`}>{exp.startDate} - {exp.endDate}</div>
                                            </div>
                                            {/* Mobile layout for left col */}
                                            <div className="md:hidden mb-2">
                                                <div className={`font-bold text-gray-900 ${fontSize.profession}`}>{exp.company}</div>
                                                <div className={`${fontSize.bodyText} text-gray-400 italic mt-1 ${fontFamilyClass}`}>{exp.startDate} - {exp.endDate}</div>
                                            </div>
                                            
                                            <div className="md:pl-8 relative">
                                                <div className="absolute left-0 top-2 w-2 h-2 rounded-full bg-gray-200 -translate-x-[5px] hidden md:block"></div>
                                                <div className={`font-bold text-gray-900 ${fontSize.profession} mb-2`}>{exp.role}</div>
                                                <p className={`text-gray-600 leading-relaxed ${fontSize.bodyText} ${fontFamilyClass}`}>{exp.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    case 'education':
                        return education.length > 0 && (
                            <div key="education" className={`resume-section ${spacing.sectionMargin}`}>
                                <h2 className={sectionTitleClass} style={{ color: themeColor }}>Education</h2>
                                <div className={`grid md:grid-cols-2 gap-8 max-w-4xl mx-auto`}>
                                    {education.map((edu, idx) => (
                                        <div key={idx} className="text-center resume-item bg-gray-50 p-6 rounded-xl border border-gray-100">
                                            <div className={`font-bold ${fontSize.profession} text-gray-900 mb-1`}>{edu.school}</div>
                                            <div className={`italic text-gray-500 mb-2 ${fontFamilyClass} ${fontSize.bodyText}`}>{edu.degree}</div>
                                            <div className={`${fontSize.dateText} font-bold text-gray-400 uppercase tracking-widest`}>{edu.year}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    case 'projects':
                        return projects.length > 0 && (
                            <div key="projects" className={`resume-section ${spacing.sectionMargin}`}>
                                <h2 className={sectionTitleClass} style={{ color: themeColor }}>Selected Works</h2>
                                <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                                    {projects.map((proj, idx) => (
                                        <div key={idx} className="resume-item text-center">
                                            <div className="mb-2">
                                                <span className={`font-bold text-gray-900 ${fontSize.bodyText}`}>{proj.title}</span>
                                                <span className="mx-2 text-gray-300">•</span>
                                                <span className={`${fontSize.bodyText} italic text-gray-500 ${fontFamilyClass}`}>{proj.category || proj.type}</span>
                                            </div>
                                            <p className={`${fontSize.bodyText} text-gray-600 leading-relaxed max-w-2xl mx-auto`}>{proj.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    case 'skills':
                        return skills.length > 0 && (
                            <div key="skills" className={`resume-section ${spacing.sectionMargin}`}>
                                <h2 className={sectionTitleClass} style={{ color: themeColor }}>Expertise</h2>
                                <div className={`flex flex-wrap justify-center gap-4 max-w-3xl mx-auto`}>
                                    {skills.map((skill, idx) => (
                                        <span key={idx} className={`${fontSize.bodyText} px-4 py-1.5 border border-gray-200 rounded-full text-gray-600 ${fontFamilyClass} italic`}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    default: return null;
                }
            })}
        </div>
    );

    const renderDeveloper = () => (
        <div
            className={`resume-page flex text-white text-base ${fontFamilyClass}`}
            style={{
                background: '#0f172a',
                ...fontStyle
            }}
        >
            {/* MultiPageStyles removed */}

            <div className="flex gap-6">
                {/* Dark Sidebar - Compact */}
                <div className="w-[30%] flex flex-col gap-4 border-r border-white/10 text-[11px] pr-5">
                    <div className="space-y-1.5">
                        {personalInfo.image && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 mb-2">
                                <img src={personalInfo.image} alt="Profile" className="w-full h-full object-cover grayscale" />
                            </div>
                        )}
                        <div className="w-8 h-1 bg-blue-500"></div>
                        <h1 className="text-xl font-black uppercase tracking-tighter leading-none">{personalInfo.fullName || 'Dev Name'}</h1>
                        {personalInfo.profession && (
                            <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.2em]">{personalInfo.profession}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-[9px] font-black uppercase text-white/30 tracking-[0.3em]">Environment</h3>
                        <div className="space-y-1 text-[10px] text-white/60">
                            {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="break-all hover:text-white transition-colors">{personalInfo.email}</a>}
                            {personalInfo.phone && <p>{personalInfo.phone}</p>}
                            {personalInfo.location && <p>{personalInfo.location}</p>}
                            {personalInfo.linkedin && <a href={formatUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 break-all">{personalInfo.linkedin}</a>}
                        </div>
                    </div>

                    {skills.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-[9px] font-black uppercase text-white/30 tracking-[0.3em]">Stack</h3>
                            <div className="flex flex-wrap gap-1">
                                {skills.map((s, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-white/10 rounded border border-white/5 text-[9px] font-bold text-blue-300">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content - Compact */}
                <div className="flex-1 p-5 space-y-4">
                    {summary && (
                        <div className="space-y-1.5 resume-section">
                            <div className="text-[9px] font-black text-blue-500/50 uppercase tracking-[0.5em]">System.initialize()</div>
                            <p className="text-xs text-white/70 leading-relaxed font-medium text-justify">{summary}</p>
                        </div>
                    )}

                    {experience.length > 0 && (
                        <div className="space-y-3 resume-section">
                            <div className="text-[9px] font-black text-blue-500/50 uppercase tracking-[0.5em]">Work_History[]</div>
                            {experience.map((exp, idx) => (
                                <div key={idx} className="space-y-1 resume-item">
                                    <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-lg border border-white/5">
                                        <h3 className="font-bold text-blue-400 text-xs">{exp.role}</h3>
                                        <span className="text-[9px] font-black text-white/30">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline px-3">
                                        <p className="text-[10px] font-black uppercase text-white/50">{exp.company}</p>
                                    </div>
                                    <p className="text-[11px] text-white/60 leading-relaxed px-3 whitespace-pre-line text-justify">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {projects.length > 0 && (
                        <div className="space-y-4 resume-section">
                            <div className="text-[9px] font-black text-blue-500/50 uppercase tracking-[0.5em]">Repository.getProjects()</div>
                            <div className="grid grid-cols-1 gap-2">
                                {projects.map((proj, idx) => (
                                    <div key={idx} className="p-3 border border-white/10 rounded-xl hover:bg-white/5 transition-all group resume-item">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className="font-bold text-white text-xs group-hover:text-blue-400 transition-colors">{proj.title}</h3>
                                            <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black rounded uppercase tracking-widest">{proj.category || proj.type}</span>
                                        </div>
                                        <p className="text-[10px] text-white/50 leading-normal text-justify">{proj.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {education.length > 0 && (
                        <div className="space-y-4 resume-section">
                            <div className="text-[9px] font-black text-blue-500/50 uppercase tracking-[0.5em]">Academia[]</div>
                            {education.map((edu, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-1 mb-1 resume-item">
                                    <div>
                                        <h3 className="font-bold text-white text-xs">{edu.school}</h3>
                                        <p className="text-[10px] text-white/50">{edu.degree}</p>
                                    </div>
                                    <span className="text-[9px] font-bold text-blue-400/70">{edu.year}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderSimple = () => (
        <div className={`resume-page flex flex-col text-gray-900 text-base ${fontFamilyClass}`} style={fontStyle}>
            <div className="border-b-[3px] border-gray-900 pb-4 mb-5">
                <h1 className="text-4xl font-extrabold tracking-tighter mb-1">{personalInfo.fullName || 'Your Name'}</h1>
                <div className="text-sm font-bold text-gray-400 flex flex-wrap gap-x-3">
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="hover:text-gray-900 transition-colors">{personalInfo.email}</a>}
                    {personalInfo.phone && <span>{personalInfo.phone}</span>}
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.linkedin && <a href={formatUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">LinkedIn</a>}
                </div>
            </div>

            <div className="space-y-5">
                {sectionOrder.map(section => {
                    const sectionTitleClass = "text-sm font-black uppercase text-gray-900 mb-2 tracking-widest";

                    switch (section) {
                        case 'summary':
                            return summary && (
                                <div key="summary" className="resume-section">
                                    <h2 className={sectionTitleClass}>Summary</h2>
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{summary}</p>
                                </div>
                            );
                        case 'experience':
                            return experience.length > 0 && (
                                <div key="experience" className="resume-section">
                                    <h2 className={sectionTitleClass}>Experience</h2>
                                    <div className="space-y-4">
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="resume-item">
                                                <div className="flex justify-between font-bold text-base mb-0.5">
                                                    <h3>{exp.role} | {exp.company}</h3>
                                                    <span className="text-sm text-gray-400">{exp.startDate} – {exp.endDate}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 leading-normal whitespace-pre-line font-medium">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'education':
                            return education.length > 0 && (
                                <div key="education" className="resume-section">
                                    <h2 className={sectionTitleClass}>Education</h2>
                                    <div className="space-y-3">
                                        {education.map((edu, idx) => (
                                            <div key={idx} className="flex justify-between items-baseline text-sm resume-item">
                                                <span className="font-bold">{edu.degree} | {edu.school}</span>
                                                <span className="text-gray-400 font-bold">{edu.year}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'skills':
                            return skills.length > 0 && (
                                <div key="skills" className="resume-section">
                                    <h2 className={sectionTitleClass}>Skills</h2>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {skills.join(' • ')}
                                    </p>
                                </div>
                            );
                        case 'projects':
                            return projects.length > 0 && (
                                <div key="projects" className="resume-section">
                                    <h2 className={sectionTitleClass}>Projects</h2>
                                    <div className="space-y-4">
                                        {projects.map((proj, idx) => (
                                            <div key={idx} className="resume-item">
                                                <h3 className="font-bold text-sm mb-1">{proj.title} <span className="text-gray-400 font-normal ml-2">[{proj.category || proj.type}]</span></h3>
                                                <p className="text-sm text-gray-600 leading-snug">{proj.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        default: return null;
                    }
                })}
            </div>
        </div>
    );

    const renderATS = () => (
        <div
            className={`resume-page flex flex-col text-black text-base ${fontFamilyClass}`}
        >
            <div className={`text-center ${spacing.sectionMargin}`}>
                <h1 className={`${fontSize.name.replace('text-5xl', 'text-3xl')} font-bold uppercase tracking-tight mb-2`}>
                    {personalInfo.fullName || 'YOUR NAME'}
                </h1>
                <div className={`${fontSize.bodyText} text-gray-700 flex justify-center flex-wrap gap-x-3 gap-y-1`}>
                    {personalInfo.location && <span>{personalInfo.location}</span>}
                    {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                    {personalInfo.email && <span>• {personalInfo.email}</span>}
                    {personalInfo.linkedin && <span>• LinkedIn</span>}
                    {personalInfo.website && <span>• Portfolio</span>}
                </div>
            </div>

            <div className={spacing.containerGap}>
                {sectionOrder.map(section => {
                    const sectionTitleClass = `${fontSize.jobTitle} font-bold uppercase border-b border-black mb-2 pb-0.5 tracking-wider`;

                    switch (section) {
                        case 'summary':
                            return summary && (
                                <div key="summary" className="resume-section">
                                    <h2 className={sectionTitleClass}>Professional Summary</h2>
                                    <p className={`${fontSize.bodyText} leading-normal text-justify`}>{summary}</p>
                                </div>
                            );
                        case 'experience':
                            return experience.length > 0 && (
                                <div key="experience" className="resume-section">
                                    <h2 className={sectionTitleClass}>Experience</h2>
                                    <div className={spacing.sectionGap}>
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="resume-item">
                                                <div className={`flex justify-between font-bold ${fontSize.jobTitle}`}>
                                                    <span>{exp.company}</span>
                                                    <span>{exp.startDate} – {exp.endDate}</span>
                                                </div>
                                                <div className={`italic ${fontSize.bodyText} mb-1`}>{exp.role}</div>
                                                <p className={`${fontSize.bodyText} leading-normal whitespace-pre-line text-gray-800`}>
                                                    {exp.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'projects':
                            return projects.length > 0 && (
                                <div key="projects" className="resume-section">
                                    <h2 className={sectionTitleClass}>Projects</h2>
                                    <div className="space-y-3">
                                        {projects.map((proj, idx) => (
                                            <div key={idx} className="resume-item">
                                                <div className={`font-bold ${fontSize.jobTitle}`}>{proj.title} <span className={`font-normal italic ${fontSize.dateText} opacity-70`}>| {proj.category || proj.type}</span></div>
                                                <p className={`${fontSize.bodyText} leading-normal`}>{proj.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'education':
                            return education.length > 0 && (
                                <div key="education" className="resume-section">
                                    <h2 className={sectionTitleClass}>Education</h2>
                                    <div className="space-y-2">
                                        {education.map((edu, idx) => (
                                            <div key={idx} className="flex justify-between items-baseline resume-item">
                                                <div>
                                                    <span className={`font-bold ${fontSize.jobTitle}`}>{edu.school}</span>
                                                    <span className={fontSize.bodyText}>, {edu.degree}</span>
                                                </div>
                                                <span className={`${fontSize.bodyText} font-medium`}>{edu.year}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'skills':
                            return skills.length > 0 && (
                                <div key="skills" className="resume-section">
                                    <h2 className={sectionTitleClass}>Technical Skills</h2>
                                    <p className={fontSize.bodyText}>
                                        <span className="font-bold">Core Competencies:</span> {skills.join(', ')}
                                    </p>
                                </div>
                            );
                        default: return null;
                    }
                })}
            </div>
        </div>
    );

    const renderCreative = () => (
        <div className="resume-page flex flex-col text-black relative overflow-hidden px-8" style={fontStyle}>
            {/* Decorative top bar */}
            <div className="absolute top-0 left-0 right-0 h-2" style={{ background: `linear-gradient(90deg, ${theme.color}, ${theme.color}99)` }}></div>

            {/* Header with creative layout */}
            <div className={`${spacing.sectionMargin} pt-4`}>
                <div className="flex items-start gap-4">
                    {/* Left side - Photo placeholder */}
                    <div
                        className="w-20 h-20 rounded-xl flex items-center justify-center text-white font-black text-2xl shrink-0 overflow-hidden"
                        style={{ backgroundColor: theme.color }}
                    >
                        {personalInfo.image ? (
                            <img src={personalInfo.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            personalInfo.fullName ? personalInfo.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'YN'
                        )}
                    </div>

                    {/* Right side - Info */}
                    <div className="flex-1">
                        <h1 className={`${fontSize.name} font-black tracking-tight mb-2`} style={{ color: theme.color }}>
                            {personalInfo.fullName || 'YOUR NAME'}
                        </h1>
                        {personalInfo.profession && (
                            <p className={`${fontSize.jobTitle} font-bold text-gray-700 mb-3`}>
                                {personalInfo.profession}
                            </p>
                        )}
                        <div className={`${fontSize.bodyText} text-gray-600 grid grid-cols-2 gap-x-3 gap-y-1 mt-1`}>
                            {personalInfo.email && <span className="flex items-center gap-1">✉ <a href={`mailto:${personalInfo.email}`} className="hover:underline">{personalInfo.email}</a></span>}
                            {personalInfo.phone && <span>☎ {personalInfo.phone}</span>}
                            {personalInfo.location && <span>📍 {personalInfo.location}</span>}
                            {personalInfo.linkedin && (
                                <a 
                                    href={formatUrl(personalInfo.linkedin)} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-1 hover:underline font-medium text-gray-600"
                                >
                                    🔗 {personalInfo.linkedin}
                                </a>
                            )}
                            {personalInfo.github && (
                                <a 
                                    href={formatUrl(personalInfo.github)} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-1 hover:underline font-medium text-gray-600 col-span-2"
                                >
                                    💻 {personalInfo.github}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className={spacing.containerGap}>
                {sectionOrder.map(section => {
                    const sectionTitleClass = `${fontSize.sectionTitle} font-black uppercase tracking-wider mb-2 pb-1.5 border-b-4 relative`;

                    switch (section) {
                        case 'summary':
                            return summary && (
                                <div key="summary" className="resume-section">
                                    <h2 className={sectionTitleClass} style={{ borderColor: `${theme.color}40` }}>
                                        <span style={{ color: theme.color }}>◆</span> About Me
                                    </h2>
                                    <p className={`${fontSize.bodyText} leading-relaxed text-gray-700`}>{summary}</p>
                                </div>
                            );
                        case 'experience':
                            return experience.length > 0 && (
                                <div key="experience" className="resume-section">
                                    <h2 className={sectionTitleClass} style={{ borderColor: `${theme.color}40` }}>
                                        <span style={{ color: theme.color }}>◆</span> Experience
                                    </h2>
                                    <div className={spacing.sectionGap}>
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="relative pl-6 resume-item">
                                                <div
                                                    className="absolute left-0 top-2 w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: theme.color }}
                                                ></div>
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className={`${fontSize.jobTitle} font-bold`}>{exp.role}</h3>
                                                    <span className={`${fontSize.dateText} font-semibold`} style={{ color: theme.color }}>
                                                        {exp.startDate} – {exp.endDate}
                                                    </span>
                                                </div>
                                                <p className={`${fontSize.bodyText} font-semibold text-gray-600 mb-2`}>{exp.company}</p>
                                                <p className={`${fontSize.bodyText} leading-relaxed text-gray-700 whitespace-pre-line`}>{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'education':
                            return education.length > 0 && (
                                <div key="education" className="resume-section">
                                    <h2 className={sectionTitleClass} style={{ borderColor: `${theme.color}40` }}>
                                        <span style={{ color: theme.color }}>◆</span> Education
                                    </h2>
                                    <div className={spacing.sectionGap}>
                                        {education.map((edu, idx) => (
                                            <div key={idx} className="flex justify-between items-baseline resume-item">
                                                <div>
                                                    <h3 className={`${fontSize.jobTitle} font-bold`}>{edu.degree}</h3>
                                                    <p className={`${fontSize.bodyText} text-gray-600`}>{edu.school}</p>
                                                </div>
                                                <span className={`${fontSize.dateText} font-semibold`} style={{ color: theme.color }}>
                                                    {edu.year}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'projects':
                            return projects.length > 0 && (
                                <div key="projects" className="resume-section">
                                    <h2 className={sectionTitleClass} style={{ borderColor: `${theme.color}40` }}>
                                        <span style={{ color: theme.color }}>◆</span> Projects
                                    </h2>
                                    <div className={spacing.sectionGap}>
                                        {projects.map((proj, idx) => (
                                            <div key={idx} className="resume-item">
                                                <h3 className={`${fontSize.jobTitle} font-bold mb-1`}>
                                                    {proj.title} <span className={`${fontSize.dateText} font-normal text-gray-500`}>| {proj.category || proj.type}</span>
                                                </h3>
                                                <p className={`${fontSize.bodyText} leading-relaxed text-gray-700`}>{proj.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'skills':
                            return skills.length > 0 && (
                                <div key="skills" className="resume-section">
                                    <h2 className={sectionTitleClass} style={{ borderColor: `${theme.color}40` }}>
                                        <span style={{ color: theme.color }}>◆</span> Skills
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className={`${fontSize.bodyText} font-semibold px-3 py-1 rounded-full`}
                                                style={{ backgroundColor: `${theme.color}15`, color: theme.color }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        default: return null;
                    }
                })}
            </div>
        </div>
    );

    const renderBold = () => (
        <div className="resume-page flex flex-col text-black p-0 bg-white" style={fontStyle}>
            {/* Bold Header Section */}
            <div
                className="p-8 text-white relative overflow-hidden"
                style={{ backgroundColor: theme.color }}
            >
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIvPjxwYXRoIGQ9Ik0xIDEwaDJNMTAgMXYyIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')]"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-5xl font-black uppercase tracking-tight mb-2 leading-none">
                            {personalInfo.fullName || 'YOUR NAME'}
                        </h1>
                        {personalInfo.profession && (
                            <p className="text-2xl font-bold opacity-90 tracking-wide bg-black/20 inline-block px-3 py-1 rounded">
                                {personalInfo.profession}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 text-sm font-semibold opacity-95 text-right">
                        {personalInfo.email && <span className="bg-white/10 px-3 py-1 rounded backdrop-blur-sm">{personalInfo.email} ✉</span>}
                        {personalInfo.phone && <span className="bg-white/10 px-3 py-1 rounded backdrop-blur-sm">{personalInfo.phone} ☎</span>}
                        {personalInfo.location && <span className="bg-white/10 px-3 py-1 rounded backdrop-blur-sm">{personalInfo.location} 📍</span>}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-8 space-y-6">
                {sectionOrder.map(section => {
                    const sectionTitleClass = `${fontSize.sectionTitle} font-black uppercase tracking-wider mb-4 pb-2 border-b-4 flex items-center gap-3`;

                    switch (section) {
                        case 'summary':
                            return summary && (
                                <div key="summary" className="resume-section">
                                    <h2 className={sectionTitleClass} style={{ borderColor: theme.color, color: theme.color }}>
                                        <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.color }}></span>
                                        Profile
                                    </h2>
                                    <div className="bg-gray-50 border-l-4 p-4 rounded-r-lg" style={{ borderColor: theme.color }}>
                                        <p className={`${fontSize.bodyText} leading-relaxed text-gray-800 font-medium text-justify`}>{summary}</p>
                                    </div>
                                </div>
                            );
                        case 'experience':
                            return experience.length > 0 && (
                                <div key="experience" className="resume-section">
                                    <h2 className={sectionTitleClass} style={{ borderColor: theme.color, color: theme.color }}>
                                        <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.color }}></span>
                                        Experience
                                    </h2>
                                    <div className="space-y-5">
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="resume-item relative pl-5 border-l-2 border-gray-100">
                                                <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full border-4 border-white shadow-sm" style={{ backgroundColor: theme.color }}></div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className={`${fontSize.jobTitle} font-black uppercase tracking-wide text-gray-900`}>
                                                            {exp.role}
                                                        </h3>
                                                        <p className={`${fontSize.bodyText} font-bold text-gray-500`}>{exp.company}</p>
                                                    </div>
                                                    <div
                                                        className={`${fontSize.dateText} font-black uppercase tracking-wider px-3 py-1 rounded bg-gray-900 text-white`}
                                                    >
                                                        {exp.startDate} – {exp.endDate}
                                                    </div>
                                                </div>
                                                <p className={`${fontSize.bodyText} leading-relaxed text-gray-700 whitespace-pre-line text-justify`}>{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'education':
                            return education.length > 0 && (
                                <div key="education" className="resume-section">
                                    <h2 className={sectionTitleClass} style={{ borderColor: theme.color, color: theme.color }}>
                                        <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.color }}></span>
                                        Education
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {education.map((edu, idx) => (
                                            <div key={idx} className="resume-item bg-gray-50 p-4 rounded-lg border-2 border-transparent hover:border-gray-200 transition-colors">
                                                <h3 className={`${fontSize.jobTitle} font-black text-gray-900`}>{edu.school}</h3>
                                                <p className={`${fontSize.bodyText} text-gray-600 font-bold mb-2`}>{edu.degree}</p>
                                                <span
                                                    className={`${fontSize.dateText} font-black uppercase px-3 py-1 rounded-full text-white inline-block`}
                                                    style={{ backgroundColor: theme.color }}
                                                >
                                                    {edu.year}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'projects':
                            return projects.length > 0 && (
                                <div key="projects" className="resume-section">
                                    <h2 className={sectionTitleClass} style={{ borderColor: theme.color, color: theme.color }}>
                                        <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.color }}></span>
                                        Projects
                                    </h2>
                                    <div className="space-y-4">
                                        {projects.map((proj, idx) => (
                                            <div key={idx} className="resume-item bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200">
                                                    <h3 className={`${fontSize.jobTitle} font-black text-gray-900`}>
                                                        {proj.title}
                                                    </h3>
                                                    <span className={`${fontSize.dateText} font-bold text-gray-500 uppercase tracking-widest bg-white px-2 py-1 rounded border border-gray-200`}>{proj.category || proj.type}</span>
                                                </div>
                                                <p className={`${fontSize.bodyText} leading-relaxed text-gray-700`}>{proj.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'skills':
                            return skills.length > 0 && (
                                <div key="skills" className="resume-section">
                                    <h2 className={sectionTitleClass} style={{ borderColor: theme.color, color: theme.color }}>
                                        <span className="w-4 h-4 rounded-sm" style={{ backgroundColor: theme.color }}></span>
                                        Skills
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {skills.map((skill, idx) => (
                                            <div
                                                key={idx}
                                                className={`${fontSize.bodyText} font-bold px-5 py-2.5 bg-gray-900 text-white transform skew-x-[-10deg] hover:skew-x-0 transition-transform`}
                                            >
                                                <span className="skew-x-[10deg] inline-block">{skill}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        default: return null;
                    }
                })}
            </div>
        </div>
    );

    const renderMinimalist = () => (
        <div className={`resume-page flex flex-col text-black ${fontFamilyClass} bg-white p-6`} style={fontStyle}>
            {/* MultiPageStyles removed */}
            <div className={`text-left border-b border-gray-100 ${spacing.sectionMargin} pb-6`}>
                <h1 className="text-6xl font-extralight tracking-tight text-gray-900 mb-2 leading-none">
                    {personalInfo.fullName || 'Your Name'}
                </h1>
                {personalInfo.profession && (
                    <p className="text-xl text-gray-500 font-medium tracking-widest uppercase mb-6">
                        {personalInfo.profession}
                    </p>
                )}
                <div className="flex flex-wrap gap-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {personalInfo.email && <a href={`mailto:${personalInfo.email}`} className="hover:text-black transition-colors border-l-2 border-gray-100 pl-3 break-all">{personalInfo.email}</a>}
                    {personalInfo.phone && <span className="border-l-2 border-gray-100 pl-3 whitespace-nowrap">{personalInfo.phone}</span>}
                    {personalInfo.location && <span className="border-l-2 border-gray-100 pl-3 whitespace-nowrap">{personalInfo.location}</span>}
                    {personalInfo.linkedin && <a href={formatUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors border-l-2 border-gray-100 pl-3 whitespace-nowrap">LinkedIn Profile</a>}
                </div>
            </div>
            <div className="space-y-8">
                {sectionOrder.map(section => {
                    const sectionTitleClass = `${fontSize.sectionTitle} font-bold uppercase tracking-[0.2em] text-gray-900 mb-4`;
                    switch (section) {
                        case 'summary':
                            return summary && (
                                <div key="summary" className="resume-section grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6">
                                    <h2 className={sectionTitleClass} style={{ color: theme.color }}>About</h2>
                                    <p className={`${fontSize.bodyText} text-gray-600 leading-relaxed font-normal`}>{summary}</p>
                                </div>
                            );
                        case 'experience':
                            return experience.length > 0 && (
                                <div key="experience" className="resume-section grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6">
                                    <h2 className={sectionTitleClass} style={{ color: theme.color }}>Experience</h2>
                                    <div className="space-y-6">
                                        {experience.map((exp, idx) => (
                                            <div key={idx} className="resume-item relative">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <h3 className={`${fontSize.jobTitle} font-bold text-gray-900`}>{exp.role}</h3>
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{exp.startDate} – {exp.endDate}</span>
                                                </div>
                                                <p className={`${fontSize.bodyText} text-gray-500 font-medium mb-2`}>{exp.company}</p>
                                                <p className={`${fontSize.bodyText} text-gray-600 leading-relaxed whitespace-pre-line text-justify`}>{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'education':
                            return education.length > 0 && (
                                <div key="education" className="resume-section grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6">
                                    <h2 className={sectionTitleClass} style={{ color: theme.color }}>Education</h2>
                                    <div className="space-y-4">
                                        {education.map((edu, idx) => (
                                            <div key={idx} className="resume-item border-l-2 border-gray-100 pl-4">
                                                <h3 className={`${fontSize.bodyText} font-bold text-gray-900`}>{edu.school}</h3>
                                                <p className={`${fontSize.dateText} text-gray-500 mt-0.5`}>{edu.degree}</p>
                                                <span className="text-xs font-bold text-gray-300 mt-1 block">{edu.year}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'projects':
                            return projects.length > 0 && (
                                <div key="projects" className="resume-section grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6">
                                    <h2 className={sectionTitleClass} style={{ color: theme.color }}>Works</h2>
                                    <div className="space-y-5">
                                        {projects.map((proj, idx) => (
                                            <div key={idx} className="resume-item">
                                                <h3 className={`${fontSize.bodyText} font-bold text-gray-900 mb-1`}>{proj.title} <span className="font-normal text-gray-400">/ {proj.category || proj.type}</span></h3>
                                                <p className={`${fontSize.bodyText} text-gray-600 leading-relaxed text-justify`}>{proj.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'skills':
                            return skills.length > 0 && (
                                <div key="skills" className="resume-section grid grid-cols-1 md:grid-cols-[150px_1fr] gap-6">
                                    <h2 className={sectionTitleClass} style={{ color: theme.color }}>Skills</h2>
                                    <div className={`${fontSize.bodyText} text-gray-600 font-medium leading-loose flex flex-wrap gap-x-2`}>
                                        {skills.map((skill, i) => (
                                            <span key={i} className="bg-gray-50 px-3 py-1 rounded text-sm text-gray-700">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        default: return null;
                    }
                })}
            </div>
        </div>
    );

    const renderExecutive = () => (
        <div className={`resume-page flex flex-col text-black ${fontFamilyClass} bg-white`} style={{ background: 'linear-gradient(to right, #f8f9fa 30%, white 30%)', ...fontStyle }}>
            {/* Sidebar Column Layout */}
            <div className="flex h-full min-h-[295mm]">
                {/* Left Sidebar (30%) */}
                <div className="w-[30%] p-6 pt-10 space-y-8 text-right border-r border-gray-200">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight uppercase tracking-wider">
                            {personalInfo.fullName ? personalInfo.fullName.split(' ').map((n,i) => <span key={i} className="block">{n}</span>) : 'YOUR NAME'}
                        </h1>
                        {personalInfo.profession && <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">{personalInfo.profession}</p>}
                    </div>

                    <div className="space-y-3 pt-6 border-t border-gray-200">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Contact</h3>
                        <div className="text-sm space-y-2 text-gray-600 font-medium">
                           {personalInfo.phone && <div className="break-words">{personalInfo.phone}</div>}
                           {personalInfo.email && <div className="break-words underline decoration-gray-300">{personalInfo.email}</div>}
                           {personalInfo.location && <div className="break-words">{personalInfo.location}</div>}
                           {personalInfo.linkedin && <div className="break-words text-xs">{personalInfo.linkedin}</div>}
                        </div>
                    </div>

                    {education.length > 0 && (
                        <div className="space-y-3 pt-6 border-t border-gray-200">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Education</h3>
                            <div className="space-y-4">
                                {education.map((edu, idx) => (
                                    <div key={idx}>
                                        <div className="font-bold text-gray-800 text-sm leading-tight">{edu.degree}</div>
                                        <div className="text-xs text-gray-500 mt-1 italic">{edu.school}</div>
                                        <div className="text-xs text-gray-400 font-bold mt-0.5">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {skills.length > 0 && (
                        <div className="space-y-3 pt-6 border-t border-gray-200">
                             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Core Expertise</h3>
                             <div className="flex flex-wrap justify-end gap-2">
                                {skills.map((skill, idx) => (
                                    <span key={idx} className="bg-white border border-gray-200 px-2 py-1 rounded text-xs font-bold text-gray-700 shadow-sm">
                                        {skill}
                                    </span>
                                ))}
                             </div>
                        </div>
                    )}
                </div>

                {/* Main Content (70%) */}
                <div className="flex-1 p-8 pt-12 space-y-8">
                    {summary && (
                        <div className="space-y-3">
                             <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-3">Executive Profile</h2>
                             <p className="text-gray-700 leading-relaxed text-justify">{summary}</p>
                        </div>
                    )}

                    {experience.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-4">Professional Experience</h2>
                            {experience.map((exp, idx) => (
                                <div key={idx} className="relative pl-6 border-l-2 border-gray-200">
                                    <div className="absolute -left-[5px] top-2 w-2 h-2 bg-gray-900 rounded-full"></div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-xl font-bold text-gray-900">{exp.role}</h3>
                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">{exp.startDate} – {exp.endDate}</span>
                                    </div>
                                    <div className="text-lg font-serif italic text-gray-600 mb-3">{exp.company}</div>
                                    <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-line">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {projects.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-4">Key Projects</h2>
                            {projects.map((proj, idx) => (
                                <div key={idx} className="space-y-1">
                                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                        {proj.title}
                                        <span className="text-xs font-normal text-gray-500 uppercase border border-gray-300 px-1.5 rounded">{proj.category}</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">{proj.description}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderTechStack = () => (
        <div className={`resume-page flex text-black ${fontFamilyClass} text-sm h-full min-h-[295mm]`} style={fontStyle}>
            {/* MultiPageStyles removed */}
            
            {/* Dark Tech Sidebar */}
            <div className="w-[35%] bg-gray-900 text-gray-300 p-6 space-y-8 flex flex-col">
                <div className="border-b border-gray-700 pb-6">
                    <div className="w-12 h-1 mb-4" style={{ backgroundColor: themeColor }}></div>
                    <h1 className="text-3xl font-bold text-white mb-2 break-words leading-none">
                        {personalInfo.fullName ? personalInfo.fullName.toLowerCase().replace(/\s+/g, '_') : 'dev_name'}
                    </h1>
                    {personalInfo.profession && (
                        <p className="text-sm font-bold uppercase tracking-widest" style={{ color: themeColor }}>
                            {`> ${personalInfo.profession}`}
                        </p>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <span className="text-green-500">./</span> Contact info
                    </h3>
                    <div className="space-y-2 text-xs font-medium">
                        {personalInfo.email && <div className="break-all hover:text-white transition-colors cursor-pointer">{personalInfo.email}</div>}
                        {personalInfo.phone && <div>{personalInfo.phone}</div>}
                        {personalInfo.location && <div>{personalInfo.location}</div>}
                        {personalInfo.linkedin && (
                            <a href={formatUrl(personalInfo.linkedin)} target="_blank" rel="noopener noreferrer" className="block break-all hover:text-white transition-colors">
                                {personalInfo.linkedin.replace('https://www.', '')}
                            </a>
                        )}
                        {personalInfo.github && (
                            <a href={formatUrl(personalInfo.github)} target="_blank" rel="noopener noreferrer" className="block break-all hover:text-white">
                                {personalInfo.github.replace('https://', '')}
                            </a>
                        )}
                    </div>
                </div>

                {skills.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <span className="text-green-500">./</span> Tech stack
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill, idx) => (
                                <span key={idx} className="bg-gray-800 text-green-400 px-2 py-1 rounded border border-gray-700 text-xs font-bold hover:bg-gray-700 transition-colors">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {education.length > 0 && (
                    <div className="space-y-4">
                         <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            <span className="text-green-500">./</span> Education
                        </h3>
                        <div className="space-y-4">
                            {education.map((edu, idx) => (
                                <div key={idx} className="relative pl-3 border-l border-gray-700">
                                    <div className="text-white font-bold text-xs">{edu.degree}</div>
                                    <div className="text-gray-500 text-[10px] mt-0.5">{edu.school}</div>
                                    <div className="text-green-500 text-[10px] font-mono mt-0.5">{edu.year}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 bg-white text-gray-800 space-y-8">
                {summary && (
                    <div className="resume-section">
                        <h2 className="text-sm font-black uppercase tracking-widest mb-3 pb-1 border-b-2 border-gray-100 flex items-center gap-2">
                            <span className="text-xl" style={{ color: themeColor }}>//</span> About Me
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-lg font-medium text-gray-600 border border-gray-100">
                            <p className="leading-relaxed text-sm">{summary}</p>
                        </div>
                    </div>
                )}

                {experience.length > 0 && (
                    <div className="resume-section">
                        <h2 className="text-sm font-black uppercase tracking-widest mb-4 pb-1 border-b-2 border-gray-100 flex items-center gap-2">
                            <span className="text-xl" style={{ color: themeColor }}>//</span> Experience_Log
                        </h2>
                        <div className="space-y-6">
                            {experience.map((exp, idx) => (
                                <div key={idx} className="resume-item group">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-lg font-bold text-gray-900">{exp.role}</h3>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">{exp.startDate} - {exp.endDate}</span>
                                    </div>
                                    <p className="text-sm font-bold mb-2" style={{ color: themeColor }}>@{exp.company}</p>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line pl-3 border-l-2 border-gray-100 group-hover:border-gray-300 transition-colors">
                                        {exp.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {projects.length > 0 && (
                    <div className="resume-section">
                        <h2 className="text-sm font-black uppercase tracking-widest mb-4 pb-1 border-b-2 border-gray-100 flex items-center gap-2">
                             <span className="text-xl" style={{ color: themeColor }}>//</span> Git_Repos
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {projects.map((proj, idx) => (
                                <div key={idx} className="resume-item border border-gray-200 p-3 rounded hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-sm font-bold text-gray-900">{proj.title}</h3>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 border border-gray-200 px-1 rounded">{proj.category || 'Repo'}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed font-medium">{proj.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderGradient = () => (
        <div className={`resume-page flex flex-col text-black ${fontFamilyClass} overflow-hidden`} style={fontStyle}>
            {/* MultiPageStyles removed */}
            <div className="p-4 text-white relative" style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 50%, ${themeColor}aa 100%)` }}>
                <div className="relative z-10">
                    <h1 className="text-5xl font-black mb-0.5 tracking-tight">{personalInfo.fullName || 'Your Name'}</h1>
                    {personalInfo.profession && <p className="text-xl font-semibold mb-1.5 opacity-95">{personalInfo.profession}</p>}
                    <div className="flex flex-wrap gap-2 text-sm font-medium opacity-90">
                        {personalInfo.email && <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>}
                        {personalInfo.phone && <span>{personalInfo.phone}</span>}
                        {personalInfo.location && <span>{personalInfo.location}</span>}
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-0 p-4">
                {sectionOrder.map(section => {
                    const sectionTitleClass = `${fontSize.sectionTitle} font-bold uppercase tracking-wider mb-1.5 flex items-center gap-2 mt-0`;
                    switch (section) {
                        case 'summary':
                            return summary && <div key="summary" className="resume-section mb-3"><h2 className={sectionTitleClass}><span className="w-1 h-4 rounded-full" style={{ backgroundColor: themeColor }}></span>Professional Summary</h2><div className="bg-gray-50 p-2.5 rounded-lg border-l-4" style={{ borderColor: themeColor }}><p className={`${fontSize.bodyText} text-gray-700 leading-relaxed`}>{summary}</p></div></div>;
                        case 'experience':
                            return experience.length > 0 && <div key="experience" className="resume-section mb-3"><h2 className={sectionTitleClass}><span className="w-1 h-4 rounded-full" style={{ backgroundColor: themeColor }}></span>Work Experience</h2><div className="space-y-1.5">{experience.map((exp, idx) => <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-100 shadow-sm resume-item"><div className="flex justify-between items-start mb-1"><div><h3 className={`${fontSize.jobTitle} font-bold text-gray-900`}>{exp.role}</h3><p className={`${fontSize.bodyText} font-semibold mt-0.5`} style={{ color: themeColor }}>{exp.company}</p></div><span className={`${fontSize.dateText} text-gray-400 font-semibold px-2 py-0.5 bg-gray-50 rounded-full`}>{exp.startDate} – {exp.endDate}</span></div><p className={`${fontSize.bodyText} text-gray-600 leading-relaxed whitespace-pre-line`}>{exp.description}</p></div>)}</div></div>;
                        case 'education':
                            return education.length > 0 && <div key="education" className="resume-section mb-3"><h2 className={sectionTitleClass}><span className="w-1 h-4 rounded-full" style={{ backgroundColor: themeColor }}></span>Education</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">{education.map((edu, idx) => <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-100 resume-item"><h3 className={`${fontSize.bodyText} font-bold text-gray-900`}>{edu.degree}</h3><p className={`${fontSize.dateText} text-gray-600 mt-0.5`}>{edu.school}</p><p className={`${fontSize.dateText} font-semibold mt-0.5`} style={{ color: themeColor }}>{edu.year}</p></div>)}</div></div>;
                        case 'projects':
                            return projects.length > 0 && <div key="projects" className="resume-section mb-3"><h2 className={sectionTitleClass}><span className="w-1 h-4 rounded-full" style={{ backgroundColor: themeColor }}></span>Featured Projects</h2><div className="space-y-1.5">{projects.map((proj, idx) => <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-100 resume-item"><h3 className={`${fontSize.bodyText} font-bold text-gray-900 mb-1`}>{proj.title}</h3><p className={`${fontSize.bodyText} text-gray-600 leading-relaxed`}>{proj.description}</p></div>)}</div></div>;
                        case 'skills':
                            return skills.length > 0 && (
                                <div key="skills" className="resume-section mb-3">
                                    <h2 className={sectionTitleClass}>
                                        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: themeColor }}></span>
                                        Skills & Expertise
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {skills.map((skill, idx) => (
                                            <span 
                                                key={idx} 
                                                className={`${fontSize.bodyText} font-semibold px-4 py-1.5 rounded-lg text-white shadow-sm`}
                                                style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)` }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        default: return null;
                    }
                })}
            </div>
        </div>
    );


    const renderSwitch = () => {
        switch (theme.template) {
            case 'gradient':
                return renderGradient();
            case 'techstack':
                return renderTechStack();
            case 'executive':
                return renderExecutive();
            case 'minimalist':
                return renderMinimalist();
            case 'bold':
                return renderBold();
            case 'creative':
                return renderCreative();
            case 'developer':
                return renderDeveloper();
            case 'simple':
                return renderSimple();
            case 'modern':
                return renderModern();
            case 'elegant':
                return renderElegant();
            case 'classic':
            default:
                return renderClassic();
        }
    };

    return renderSwitch();
};

export default ResumePreview;
