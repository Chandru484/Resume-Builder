
import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import { useParams, useNavigate, Link } from 'react-router-dom';
// HMR Force Update - Ensuring Pencil is imported
import { ChevronLeft, ChevronRight, Save, Share2, Download, Palette, Layout as LayoutIcon, Eye, Settings, Check, X, Target, AlertCircle, CheckCircle2, GripVertical, Shield, Zap, UploadCloud, Loader2, Sparkles, Pencil, FileText, Cloud, Undo } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import PersonalInfoForm from '../components/builder/PersonalInfoForm';
import SummaryForm from '../components/builder/SummaryForm';
import ExperienceForm from '../components/builder/ExperienceForm';
import EducationForm from '../components/builder/EducationForm';
import ProjectsForm from '../components/builder/ProjectsForm';
import SkillsForm from '../components/builder/SkillsForm';
import ResumePreview from '../components/builder/ResumePreview';
import api, { resumeService, aiService, imageService, templateService } from '../services/api';
import { useToast } from '../context/ToastContext';

const ResumeBuilder = () => {
    const { resumeId } = useParams();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showJobMatchModal, setShowJobMatchModal] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [isMatching, setIsMatching] = useState(false);
    const [matchResult, setMatchResult] = useState(null);
    const [sectionOrder, setSectionOrder] = useState(['summary', 'experience', 'education', 'projects', 'skills']);
    const [showReorderModal, setShowReorderModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isTrimming, setIsTrimming] = useState(false);
    const [originalResumeData, setOriginalResumeData] = useState(null);
    const [isTrimmed, setIsTrimmed] = useState(false);
    const [trimTemplate, setTrimTemplate] = useState(null);
    const [showTrimConfirm, setShowTrimConfirm] = useState(false);
    const [showImportConfirm, setShowImportConfirm] = useState(false);
    // Legacy showToast removed

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState('');
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [showMoreActions, setShowMoreActions] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [templates, setTemplates] = useState([]);

    const { success: showSuccess, error: showError } = useToast();

    const [resumeData, setResumeData] = useState({
        title: 'Untitled Resume',
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            profession: '',
            linkedin: '',
            website: '',
            image: null
        },
        summary: '',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        theme: {
            color: '#16a34a',
            template: 'classic',
            spacing: 'normal',
            fontSize: 'medium',
            margins: 'normal',
            showLine: true
        }
    });

    // Autosave Logic
    const [lastSavedData, setLastSavedData] = useState(null);
    const [isAutosaving, setIsAutosaving] = useState(false);
    // Debounce resumeData updates by 2 seconds
    const debouncedResumeData = useDebounce(resumeData, 2000);

    useEffect(() => {
        const autoSave = async () => {
            // verify we have data and it's different from last save
            if (!debouncedResumeData || !resumeId || isLoading) return;

            // If first load, just set baseline
            if (!lastSavedData) {
                setLastSavedData(JSON.stringify(debouncedResumeData));
                return;
            }

            // Check if actual changes happened
            const currentString = JSON.stringify(debouncedResumeData);
            if (currentString === lastSavedData) return;

            setIsAutosaving(true);
            try {
                const saveData = cleanResumeDataForSave(debouncedResumeData);
                await resumeService.update(resumeId, saveData);
                setLastSavedData(currentString);
                // Optional: show minimal toast or just UI indicator
                console.log("[Autosave] Saved successfully");
            } catch (error) {
                console.error("[Autosave] Failed:", error);
                // Don't disturb user with error toasts for autosave unless critical
            } finally {
                setIsAutosaving(false);
            }
        };

        autoSave();
    }, [debouncedResumeData, resumeId, lastSavedData, isLoading]);

    const sectionNames = {
        summary: 'Professional Summary',
        experience: 'Work Experience',
        education: 'Education',
        projects: 'Projects',
        skills: 'Skills'
    };


    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(sectionOrder);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setSectionOrder(items);
        handleUpdate('sectionOrder', items);
    };

    const handleJobMatch = async () => {
        setIsMatching(true);
        try {
            // Construct a text representation of the resume for analysis
            const resumeText = JSON.stringify(resumeData);
            const { data } = await aiService.jobMatch(resumeText, jobDescription);
            setMatchResult(data);
        } catch (error) {
            alert('Job Match Analysis failed');
        } finally {
            setIsMatching(false);
        }
    };

    const handleATSAnalyze = async () => {
        setIsMatching(true);
        try {
            // Send resume text representation
            const resumeText = JSON.stringify(resumeData);
            // We reuse the matchResult state but with cleared jobDescription to indicate general analysis
            setJobDescription('');
            const { data } = await aiService.analyze(resumeText);
            setMatchResult(data);
        } catch (error) {
            console.error('ATS analysis error:', error);
            showError('ATS Analysis failed');
        } finally {
            setIsMatching(false);
        }
    };



    useEffect(() => {
        const handleResize = () => {
            const container = document.getElementById('preview-container');
            if (container) {
                // Helper to get float padding
                const getPadding = (el) => {
                    const style = window.getComputedStyle(el);
                    return (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
                };

                const paddingX = getPadding(container);
                // Use clientWidth (excludes scrollbar/border) minus padding
                const availableWidth = container.clientWidth - paddingX;
                
                // A4 Width in px (96dpi) = 794px. 
                // We add a small safety buffer (e.g., 20px) to prevent flush edges
                const targetWidth = 794;
                
                // Calculate scale, maxing out at 1.5x for large screens
                // On mobile, this will produce values like 0.4, 0.5 etc.
                const scale = Math.min(1.5, (availableWidth - 20) / targetWidth);
                
                // Ensure scale doesn't go below reasonable visibility or negative
                const safeScale = Math.max(0.1, scale);

                document.documentElement.style.setProperty('--preview-scale', safeScale.toString());
            }
        };

        // Run initially and on resize
        // We added a small timeout to ensure DOM is ready after loading state changes
        const timeoutId = setTimeout(handleResize, 100);
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, [isLoading, showMobilePreview, showTemplateModal]); // Re-run when view states change



    const contentRef = useRef(null);

    const handleDownloadPDF = async () => {
        if (!contentRef.current) return;

        // Target the inner resume page specifically (print-safe layer)
        const element = contentRef.current.querySelector('.resume-page');
        if (!element) {
            showError('Could not find resume page to export');
            return;
        }

        // Create a dedicated container for PDF generation
        // This ensures the content is isolated, visible, and unaffected by the main app's layout/scaling
        // We use a temporary visible overlay to ensure html2canvas captures the content correctly
        const printContainer = document.createElement('div');
        printContainer.style.position = 'fixed';
        printContainer.style.top = '0';
        printContainer.style.left = '0';
        printContainer.style.width = '100vw';
        printContainer.style.height = '100vh';
        printContainer.style.zIndex = '10000'; // Top most
        printContainer.style.backgroundColor = '#ffffff'; // Ensure clean background
        printContainer.style.overflow = 'auto';
        
        // Create a clone to avoid messing with the live UI constraints (especially on mobile)
        const clone = element.cloneNode(true);
        
        // Configure clone styles for A4
        clone.style.width = '210mm';
        clone.style.minHeight = '295mm'; // Reduced from 297mm to prevent blank page overflow
        clone.style.height = 'auto'; // allow expansion
        clone.style.transform = 'none'; // No scaling
        clone.style.margin = '0 auto'; // Center it
        clone.style.boxShadow = 'none';
        clone.style.position = 'relative'; // Normal flow within container
        clone.style.boxSizing = 'border-box';
        clone.style.borderRadius = '0'; // Ensure no rounded corners affect dimensions
        
        // Append clone to print container
        printContainer.appendChild(clone);
        
        // Append container to body
        document.body.appendChild(printContainer);

        const opt = {
            margin: 0,
            filename: `${resumeData.title || 'resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                windowWidth: 794 // 210mm @ 96dpi
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: {
                mode: 'css', // Use CSS page-break rules
                avoid: ['.resume-section', '.resume-item']
            }
        };

        setIsSaving(true);
        try {
            await html2pdf().set(opt).from(clone).save();
            showSuccess('PDF downloaded successfully');
        } catch (error) {
            console.error('PDF generation failed:', error);
            showError('Failed to generate PDF. Please try again.');
        } finally {
            // Clean up the overlay container
            if (document.body.contains(printContainer)) {
                document.body.removeChild(printContainer);
            }
            setIsSaving(false);
        }
    };

    const handleDownloadDOCX = async () => {
        try {
            const response = await api.get(`/resumes/${resumeId}/download/docx`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${resumeData.title || 'resume'}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            showSuccess('DOCX downloaded successfully');
        } catch (error) {
            console.error('DOCX generation failed:', error);
            showError('Failed to download DOCX');
        }
    };

    useEffect(() => {
        if (resumeData.title) {
            document.title = `${resumeData.title} | ResumeAI`;
        }
    }, [resumeData.title]);

    // Fetch templates from API
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const { data } = await templateService.getAll();
                setTemplates(data);
            } catch (error) {
                console.error('Failed to fetch templates:', error);
            }
        };
        fetchTemplates();
    }, []);

    useEffect(() => {
        const fetchResume = async () => {
            setIsLoading(true);
            try {
                const { data } = await resumeService.getById(resumeId);
                console.log('[ResumeBuilder] Fetched data from Firestore:', data);
                console.log('[ResumeBuilder] Projects from Firestore:', data.projects);

                // Ensure data has all required objects to prevent TypeErrors
                setResumeData(prev => ({
                    ...prev,
                    ...data,
                    personalInfo: { ...prev.personalInfo, ...(data.personalInfo || {}) },
                    theme: { ...prev.theme, ...(data.theme || {}) },
                    // Explicitly ensure arrays are set from data
                    experience: data.experience || [],
                    education: data.education || [],
                    projects: data.projects || [],
                    skills: data.skills || []
                }));
                if (data.sectionOrder && data.sectionOrder.length > 0) {
                    setSectionOrder(data.sectionOrder);
                }
            } catch (error) {
                console.error('Error loading resume:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchResume();
    }, [resumeId]);

    const steps = [
        { id: 'personalInfo', title: 'Personal Info', component: PersonalInfoForm },
        { id: 'summary', title: 'Professional Summary', component: SummaryForm },
        { id: 'experience', title: 'Experience', component: (props) => <ExperienceForm {...props} onAIEnhance={handleAIEnhance} /> },
        { id: 'education', title: 'Education', component: EducationForm },
        { id: 'projects', title: 'Projects', component: ProjectsForm },
        { id: 'skills', title: 'Skills', component: SkillsForm },
    ];

    const colors = [
        '#ea580c', '#2563eb', '#9333ea', '#db2777', '#dc2626', '#16a34a', '#d97706', '#0891b2', '#0f172a'
    ];



    const handleUpdate = (section, data) => {
        setResumeData(prev => ({
            ...prev,
            [section]: data
        }));
    };

    const handleThemeUpdate = (key, value) => {
        if (key === 'template') {
            if (isTrimmed && trimTemplate !== value && originalResumeData) {
                // User switched template while trimmed -> Revert content but apply new template
                const restored = { 
                    ...originalResumeData, 
                    theme: { 
                        ...originalResumeData.theme, 
                        template: value 
                    } 
                };
                setResumeData(restored);
                setIsTrimmed(false);
                setOriginalResumeData(null);
                setTrimTemplate(null);
                showSuccess("Switched template: Magic Trim changes reverted.");
                return;
            }
        }
        setResumeData(prev => ({
            ...prev,
            theme: { ...prev.theme, [key]: value }
        }));
    };

    const cleanResumeDataForSave = (data) => {
        if (!data) return {};
        // Explicitly extract ONLY the fields we want to save to the backend
        const { title, personalInfo, summary, experience, education, projects, skills, theme, sectionOrder } = data;

        // Helper to ensure an array exists and items match a schema
        const normalizeArray = (arr, schemaDefaults) => {
            if (!Array.isArray(arr)) return [];
            return arr.map(item => {
                const normalizedItem = {};
                Object.keys(schemaDefaults).forEach(key => {
                    normalizedItem[key] = String(item?.[key] || schemaDefaults[key]);
                });
                return normalizedItem;
            });
        };

        const saveData = {
            title: String(title || 'Untitled Resume'),
            personalInfo: {
                fullName: String(personalInfo?.fullName || ''),
                email: String(personalInfo?.email || ''),
                phone: String(personalInfo?.phone || ''),
                location: String(personalInfo?.location || ''),
                profession: String(personalInfo?.profession || ''),
                linkedin: String(personalInfo?.linkedin || ''),
                website: String(personalInfo?.website || ''),
                image: personalInfo?.image || null
            },
            summary: String(summary || ''),
            experience: normalizeArray(experience, {
                company: '', role: '', startDate: '', endDate: '', description: ''
            }),
            education: normalizeArray(education, {
                school: '', degree: '', year: ''
            }),
            projects: normalizeArray(projects, {
                title: '', category: '', link: '', description: ''
            }),
            skills: Array.isArray(skills)
                ? skills.map(s => typeof s === 'object' ? (s.name || s.title || JSON.stringify(s)) : String(s)).filter(Boolean)
                : [],
            theme: theme || { color: '#16a34a', template: 'classic', spacing: 'normal', fontSize: 'medium', margins: 'normal', showLine: true },
            sectionOrder: Array.isArray(sectionOrder) ? sectionOrder : ['summary', 'experience', 'education', 'projects', 'skills']
        };

        return saveData;
    };

    const confirmTrimResume = () => {
        setShowTrimConfirm(true);
    };

    const handleTrimResume = async () => {
        setShowTrimConfirm(false);
        setIsTrimming(true);
        try {
            // Save state before trimming
            const stateSnapshot = JSON.parse(JSON.stringify(resumeData));
            setOriginalResumeData(stateSnapshot);
            setTrimTemplate(resumeData.theme?.template || 'modern');
            
            const currentData = cleanResumeDataForSave(resumeData);
            const { data } = await api.post('/ai/trim', { resumeText: currentData }, { timeout: 90000 });

            // Merge trimmed data
            const merged = { ...currentData, ...data };
            setResumeData(merged);
            setIsTrimmed(true);

            showSuccess("Resume trimmed successfully! Please review the changes.");
        } catch (error) {
            console.error("Trim failed:", error);
            const errMsg = error.response?.data?.message || error.message || "Unknown error";
            const errDetail = error.response?.data?.error || "";
            showError(`Failed to trim resume: ${errMsg} ${errDetail}`);
            setIsTrimmed(false); // Reset on failure
            setOriginalResumeData(null);
        } finally {
            setIsTrimming(false);
        }
    };

    const handleRevertTrim = () => {
        if (originalResumeData) {
            setResumeData(originalResumeData);
            setOriginalResumeData(null);
            setIsTrimmed(false);
            setTrimTemplate(null);
            showSuccess("Magic Trim changes reverted.");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const saveData = cleanResumeDataForSave(resumeData);
            await resumeService.update(resumeId, saveData);
            showSuccess('Resume saved successfully!'); // Global toast
        } catch (error) {
            console.error('Save failed:', error);
            const msg = error.response?.data?.message || 'Failed to save resume';
            const detail = error.response?.data?.error || '';
            showError(`${msg} ${detail ? `- ${detail}` : ''} `);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAIEnhance = async (text, type, index = null, mode = 'professional') => {
        try {
            const { data } = await aiService.enhance(text, type, mode); // Pass mode
            if (type === 'summary') {
                handleUpdate('summary', data.enhancedText);
            } else if (type === 'experience' && index !== null) {
                const newExp = [...resumeData.experience];
                newExp[index].description = data.enhancedText;
                handleUpdate('experience', newExp);
            }
        } catch (error) {
            showError('AI Enhancement failed');
        }
    };

    const handleImportResume = async (e) => {
        if (e) e.preventDefault();
        console.log("ResumeBuilder: handleImportResume called");

        const fileInput = document.getElementById('resume-import-upload');
        if (!fileInput) return;
        const file = fileInput.files?.[0];
        if (!file) return showError('Please select a file');

        if (resumeData?.personalInfo?.fullName || resumeData?.experience?.length > 0) {
            // If we are triggered from event (e exists), it means user clicked button.
            // We pause here to show modal if needed
            if (e) {
                setShowImportConfirm(true);
                return; // Wait for modal confirmation
            }
        }

        // If we reach here, it's safe to proceed (either empty resume or confirmed via modal calling this function again without event)
        setIsParsing(true);
        try {
            const { data: parsedData } = await aiService.parse(file);
            console.log("ResumeBuilder: Parsed AI Data:", parsedData);

            // 1. Prepare new data objects
            const newData = {
                ...resumeData,
                ...parsedData,
                theme: resumeData.theme,
                title: resumeData.title
            };

            // 2. Clean for save
            const saveData = cleanResumeDataForSave(newData);

            // 3. Save to backend first (to ensure consistency)
            await resumeService.update(resumeId, saveData);

            // 4. Then update state to reflect the new data in UI
            setResumeData(newData);
            setShowImportModal(false);
            setShowImportConfirm(false); // Close confirm modal if open
            showSuccess('Import successful');
        } catch (error) {
            console.error('Import failed:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to parse resume';
            showError(`Import Error: ${msg} `);
        } finally {
            setIsParsing(false);
            const fileInput = document.getElementById('resume-import-upload');
            if (fileInput) fileInput.value = '';
            setSelectedFileName('');
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading your resume...</p>
                </div>
            </div>
        );
    }

    if (!resumeData) return null;

    const ActiveForm = steps[activeStep].component;

    return (
        <div className="min-h-screen bg-primary-50 flex flex-col font-outfit">
            {/* Builder Header */}
            <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/app" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-all">
                        <ChevronLeft className="size-5" />
                    </Link>
                    <div className="h-6 w-px bg-gray-100" />

                    {isEditingTitle ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                className="font-bold text-gray-900 border-b-2 border-primary-600 focus:outline-none bg-transparent py-1 min-w-[200px]"
                                autoFocus
                                onBlur={() => {
                                    setIsEditingTitle(false);
                                    if (tempTitle.trim() && tempTitle !== resumeData.title) {
                                        setResumeData(prev => ({ ...prev, title: tempTitle }));
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setIsEditingTitle(false);
                                        if (tempTitle.trim() && tempTitle !== resumeData.title) {
                                            setResumeData(prev => ({ ...prev, title: tempTitle }));
                                        }
                                    }
                                    if (e.key === 'Escape') {
                                        setIsEditingTitle(false);
                                    }
                                }}
                            />
                            <button
                                onClick={() => {
                                    setIsEditingTitle(false);
                                    if (tempTitle.trim() && tempTitle !== resumeData.title) {
                                        setResumeData(prev => ({ ...prev, title: tempTitle }));
                                    }
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                            >
                                <Check className="size-4" />
                            </button>
                        </div>
                    ) : (
                        <div
                            className="flex items-center gap-2 group cursor-pointer py-1 px-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors max-w-[120px] sm:max-w-[200px]"
                            onClick={() => {
                                setTempTitle(resumeData.title);
                                setIsEditingTitle(true);
                            }}
                        >
                            <h2 className="font-black text-gray-900 group-hover:text-primary-700 transition-colors truncate text-sm sm:text-base">
                                {resumeData.title || 'Untitled Resume'}
                            </h2>
                            <Pencil className="size-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 lg:gap-3 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                    <div className="flex items-center gap-1.5 mr-1 text-[10px] lg:text-xs font-medium text-gray-400 select-none whitespace-nowrap">
                        {isAutosaving ? (
                            <><Loader2 className="size-3 lg:size-3.5 animate-spin" /> <span className="hidden sm:inline">Saving...</span></>
                        ) : (
                            <><Cloud className="size-3 lg:size-3.5" /> <span className="hidden sm:inline">Saved</span></>
                        )}
                    </div>

                    {/* Desktop Toolbar - Hidden on Mobile */}
                    <div className="hidden lg:flex items-center gap-2">
                        <button onClick={() => setShowThemeModal(true)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Theme"><Palette className="size-5" /></button>
                        <button onClick={() => setShowReorderModal(true)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Sections"><GripVertical className="size-5" /></button>
                        <button onClick={confirmTrimResume} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Magic Trim"><Sparkles className="size-5" /></button>
                        {isTrimmed && (
                            <button onClick={handleRevertTrim} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Revert Trim"><Undo className="size-5" /></button>
                        )}
                        <button onClick={() => setShowTemplateModal(true)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Template"><LayoutIcon className="size-5" /></button>
                        <button onClick={() => setShowJobMatchModal(true)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Job Match"><Target className="size-5" /></button>
                        <button onClick={() => setShowImportModal(true)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Import"><UploadCloud className="size-5" /></button>
                        <div className="h-6 w-px bg-gray-100 mx-1" />
                        <button onClick={handleATSAnalyze} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                            {isMatching ? <Loader2 className="size-4 animate-spin" /> : <Shield className="size-4" />} Score
                        </button>
                    </div>

                    {/* Mobile More Actions Dropdown */}
                    <div className="relative lg:hidden">
                        <button
                            onClick={() => setShowMoreActions(!showMoreActions)}
                            className={`p-2 rounded-lg transition-all ${showMoreActions ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:bg-gray-100'}`}
                        >
                            <Settings className="size-5" />
                        </button>

                        {showMoreActions && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 z-[110] animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => { setShowThemeModal(true); setShowMoreActions(false); }} className="flex w-full items-center gap-3 p-3 text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all">
                                    <Palette className="size-4" /> Design & Theme
                                </button>
                                <button onClick={() => { setShowTemplateModal(true); setShowMoreActions(false); }} className="flex w-full items-center gap-3 p-3 text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all">
                                    <LayoutIcon className="size-4" /> Templates
                                </button>
                                <button onClick={() => { setShowReorderModal(true); setShowMoreActions(false); }} className="flex w-full items-center gap-3 p-3 text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all">
                                    <GripVertical className="size-4" /> Reorder Sections
                                </button>
                                <button onClick={() => { confirmTrimResume(); setShowMoreActions(false); }} className="flex w-full items-center gap-3 p-3 text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all">
                                    <Sparkles className="size-4 text-primary-500" /> Magic 1-Page Trim
                                </button>
                                <div className="h-px bg-gray-100 my-1 mx-2" />
                                <button onClick={() => { setShowImportModal(true); setShowMoreActions(false); }} className="flex w-full items-center gap-3 p-3 text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all">
                                    <UploadCloud className="size-4" /> AI Smart Import
                                </button>
                                <button onClick={() => { setShowJobMatchModal(true); setShowMoreActions(false); }} className="flex w-full items-center gap-3 p-3 text-sm font-bold text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-all">
                                    <Target className="size-4" /> Job Match Analysis
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowImportModal(true)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-200 flex items-center gap-1.5"
                    >
                        <Sparkles className="size-3.5 lg:size-4" />
                        <span className="hidden sm:inline">AI Import</span>
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary-600 text-white px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5 lg:size-4" />}
                        <span className="hidden sm:inline">Save</span>
                    </button>

                    <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <button
                            onClick={handleDownloadPDF}
                            className="px-2.5 lg:px-3 py-2 text-[10px] lg:text-sm font-black text-gray-700 hover:bg-gray-50 border-r border-gray-200 flex items-center gap-1.5"
                            title="Download PDF"
                        >
                            <Download className="size-3.5 lg:size-4 text-primary-600" /> PDF
                        </button>
                        <button
                            onClick={handleDownloadDOCX}
                            className="px-2.5 lg:px-3 py-2 text-[10px] lg:text-sm font-black text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                            title="Download Word"
                        >
                            <FileText className="size-3.5 lg:size-4 text-blue-600" /> DOCX
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Builder Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Side - Forms */}
                <div className="w-full lg:w-[45%] overflow-y-auto p-6 lg:p-10 space-y-10 border-r border-gray-100 bg-white shadow-sm z-10">
                    {/* Progress Indicator */}
                    {/* Progress Indicator */}
                    {/* Progress Indicator */}
                    <div className="flex flex-row items-center gap-6 mb-6 lg:mb-10 w-full overflow-hidden">
                        {/* Step & Title */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div
                                className="size-10 sm:size-14 rounded-2xl flex items-center justify-center font-black text-lg sm:text-2xl transition-all shadow-sm shrink-0"
                                style={{ backgroundColor: `${resumeData?.theme?.color || '#ea580c'}15`, color: resumeData?.theme?.color || '#ea580c' }}
                            >
                                {activeStep + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mb-0.5 sm:mb-1 opacity-70" style={{ color: resumeData.theme.color }}>Step {activeStep + 1} of 6</p>
                                <h1 className="text-xl sm:text-3xl font-black text-gray-900 leading-none truncate w-full">{steps[activeStep].title}</h1>
                            </div>
                        </div>

                        {/* Top Navigation Buttons */}
                        <div className="flex items-center gap-2 shrink-0 z-20">
                            <button
                                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                                disabled={activeStep === 0}
                                className="p-2 sm:p-3 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-20 disabled:hover:bg-transparent transition-all bg-white shadow-sm flex-shrink-0"
                            >
                                <ChevronLeft className="size-5 sm:size-6" />
                            </button>
                            <button
                                onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                                disabled={activeStep === steps.length - 1}
                                className="p-2 sm:p-3 text-white rounded-xl shadow-lg shadow-primary-500/20 disabled:opacity-30 transition-all active:scale-95 flex-shrink-0 bg-primary-600"
                                style={{ backgroundColor: resumeData?.theme?.color || undefined }}
                            >
                                <ChevronRight className="size-5 sm:size-6" />
                            </button>
                        </div>
                    </div>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeStep === 1 ? (
                            <SummaryForm
                                data={resumeData.summary}
                                onUpdate={(data) => handleUpdate('summary', data)}
                                onAIEnhance={(text) => handleAIEnhance(text, 'summary')}
                            />
                        ) : activeStep === 2 ? (
                            <ExperienceForm
                                data={resumeData.experience}
                                onUpdate={(data) => handleUpdate('experience', data)}
                                onAIEnhance={(text, index) => handleAIEnhance(text, 'experience', index)}
                            />
                        ) : (
                            <ActiveForm
                                data={resumeData[steps[activeStep].id] || {}}
                                onUpdate={(data) => handleUpdate(steps[activeStep].id, data)}
                            />
                        )}
                    </div>

                    {/* Bottom Navigation for Mobile/Long Forms */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                        <button
                            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                            disabled={activeStep === 0}
                            className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent font-bold text-gray-600 transition-all flex items-center gap-2"
                        >
                            <ChevronLeft className="size-4" /> Back
                        </button>
                        <button
                            onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                            disabled={activeStep === steps.length - 1}
                            className="px-8 py-3 bg-primary-600 text-white rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 disabled:opacity-50 disabled:shadow-none transition-all font-bold flex items-center gap-2"
                        >
                            {activeStep === steps.length - 1 ? 'Finish' : 'Next Step'} <ChevronRight className="size-4" />
                        </button>
                    </div>

                    {/* Navigation Bottom */}
                    <div className="pt-10 flex justify-between">
                        <button
                            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                            className={`flex items - center gap - 2 font - bold transition - all ${activeStep === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-gray-900'} `}
                        >
                            <ChevronLeft className="size-5" />
                            Previous Step
                        </button>
                        <button
                            onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                            className={`flex items - center gap - 2 font - bold transition - all ${activeStep === steps.length - 1 ? 'opacity-0 pointer-events-none' : ''} `}
                            style={{ color: steps.length - 1 === activeStep ? 'transparent' : resumeData.theme.color }}
                        >
                            Next Step
                            <ChevronRight className="size-5" />
                        </button>
                    </div>
                </div>

                {/* Right Side - Preview */}
                <div id="preview-container" className={`
                    ${showMobilePreview ? 'fixed inset-0 z-[100] flex bg-white p-4' : 'hidden'} 
                    lg:relative lg:inset-auto lg:z-auto lg:flex lg:w-[60%] lg:bg-gray-50 lg:items-start lg:justify-center lg:p-12 overflow-y-auto overflow-x-hidden relative
                `}>
                    {/* Mobile Close Button */}
                    {showMobilePreview && (
                        <button
                            onClick={() => setShowMobilePreview(false)}
                            className="absolute top-4 right-4 z-[110] p-3 bg-gray-900 text-white rounded-full shadow-2xl lg:hidden"
                        >
                            <X className="size-6" />
                        </button>
                    )}

                    <div ref={contentRef} className="resume-wrapper">
                        <ResumePreview data={resumeData} />
                    </div>
                </div>

                {/* Floating Mobile Preview Toggle */}
                <button
                    onClick={() => setShowMobilePreview(true)}
                    className="fixed bottom-8 right-8 z-40 lg:hidden flex items-center gap-2 bg-primary-600 text-white px-6 py-4 rounded-full font-black shadow-2xl shadow-primary-500/40 animate-bounce active:scale-95 transition-all"
                >
                    <Eye className="size-5" />
                    Preview
                </button>
            </div>

            {/* Theme Modal */}
            {showThemeModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setShowThemeModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900"><X /></button>
                        <h2 className="text-2xl font-bold mb-6">Design & Theme</h2>

                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Accent Color</h3>
                                <div className="flex items-center gap-2">
                                     <span className="text-xs font-medium text-gray-500 uppercase">{resumeData.theme.color}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => handleThemeUpdate('color', c)}
                                        className="aspect-square rounded-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg ring-2 ring-transparent hover:ring-offset-2"
                                        style={{ backgroundColor: c, '--tw-ring-color': c }}
                                    >
                                        {resumeData.theme.color === c && <Check className="text-white size-5" />}
                                    </button>
                                ))}
                                {/* Custom Color Picker */}
                                <label className="aspect-square rounded-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg ring-2 ring-gray-200 hover:ring-offset-2 cursor-pointer relative overflow-hidden bg-white group border-2 border-dashed border-gray-300">
                                    <div className="absolute inset-0 bg-[conic-gradient(at_center,_red,_yellow,_lime,_cyan,_blue,_magenta,_red)] opacity-20 group-hover:opacity-100 transition-opacity" />
                                    <input
                                        type="color"
                                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                        value={resumeData.theme.color}
                                        onChange={(e) => handleThemeUpdate('color', e.target.value)}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <Palette className="size-5 text-gray-600 group-hover:text-white transition-colors" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                            <div className="md:col-span-2">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Typography</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { name: 'Inter', value: 'Inter, sans-serif' },
                                        { name: 'Roboto', value: 'Roboto, sans-serif' },
                                        { name: 'Open Sans', value: '"Open Sans", sans-serif' },
                                        { name: 'Lato', value: 'Lato, sans-serif' },
                                        { name: 'Montserrat', value: 'Montserrat, sans-serif' },
                                        { name: 'Merriweather', value: 'Merriweather, serif' },
                                        { name: 'Playfair', value: '"Playfair Display", serif' },
                                        { name: 'Lora', value: 'Lora, serif' },
                                        { name: 'Mono', value: '"Roboto Mono", monospace' }
                                    ].map(font => (
                                        <button
                                            key={font.name}
                                            onClick={() => handleThemeUpdate('fontFamily', font.value)}
                                            className={`px-3 py-2 rounded-lg text-sm transition-all border text-left ${resumeData?.theme?.fontFamily === font.value || (!resumeData?.theme?.fontFamily && font.name === 'Inter') ? 'bg-gray-900 text-white border-gray-900 shadow-md ring-2 ring-gray-200 ring-offset-1' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                                            style={{ fontFamily: font.value }}
                                        >
                                            <span className="font-medium block">{font.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Spacing</h3>
                                <div className="flex bg-gray-50 p-1 rounded-xl">
                                    {['compact', 'normal', 'relaxed'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleThemeUpdate('spacing', s)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${resumeData?.theme?.spacing === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Font Size</h3>
                                <div className="flex bg-gray-50 p-1 rounded-xl">
                                    {['small', 'medium', 'large'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleThemeUpdate('fontSize', s)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${resumeData?.theme?.fontSize === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Margins</h3>
                                <div className="flex bg-gray-50 p-1 rounded-xl">
                                    {['compact', 'normal', 'wide'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => handleThemeUpdate('margins', s)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all ${resumeData?.theme?.margins === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Header Line</h3>
                                <button
                                    onClick={() => handleThemeUpdate('showLine', !resumeData?.theme?.showLine)}
                                    className={`w-12 h-7 rounded-full transition-all relative ${resumeData?.theme?.showLine ? 'bg-primary-600' : 'bg-gray-200'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${resumeData?.theme?.showLine ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>

                        <button onClick={() => setShowThemeModal(false)} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200">Apply Design</button>
                    </div>
                </div>
            )}

            {/* Template Modal */}
            {showTemplateModal && (
                <div 
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setShowTemplateModal(false)}
                >
                    <div 
                        className="bg-white rounded-[2rem] w-full max-w-lg p-6 sm:p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto no-scrollbar"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button onClick={() => setShowTemplateModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900"><X /></button>
                        <h2 className="text-2xl font-bold mb-8">Select Template</h2>
                        <div className="space-y-4">
                            {templates.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => handleThemeUpdate('template', t.id)}
                                    className={`w-full flex items-center gap-6 p-6 rounded-3xl border-2 transition-all ${resumeData?.theme?.template === t.id ? 'border-primary-600 bg-primary-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                >
                                    <div className="w-24 h-28 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 group">
                                        <img
                                            src={t.thumbnail}
                                            alt={t.name}
                                            className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-gray-900">{t.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Job Match Modal */}
            {showJobMatchModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowJobMatchModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900"><X /></button>

                        {!matchResult ? (
                            <>
                                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                    <Target className="text-primary-600" /> Target Job Match
                                </h2>
                                <p className="text-gray-500 mb-6">Paste the job description below to check your resume's compatibility score.</p>

                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste Job Description here..."
                                    className="w-full h-64 p-6 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none mb-6 text-sm"
                                />

                                <button
                                    onClick={handleJobMatch}
                                    disabled={!jobDescription || isMatching}
                                    className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isMatching ? 'Analyzing Compatibility...' : 'Check Match Score'}
                                </button>
                            </>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">Match Analysis</h2>
                                    <button
                                        onClick={() => { setMatchResult(null); setJobDescription(''); }}
                                        className="text-sm font-bold text-gray-500 hover:text-primary-600"
                                    >
                                        Check Another Job
                                    </button>
                                </div>

                                <div className="bg-gray-900 text-white p-8 rounded-[2rem] flex items-center justify-between">
                                    <div>
                                        <p className="text-primary-300 uppercase tracking-widest text-xs font-bold mb-1">Match Score</p>
                                        <p className="text-5xl font-black">{matchResult.matchScore}%</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full border-4 border-primary-500 flex items-center justify-center text-xl font-bold">
                                        {matchResult.matchScore}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <AlertCircle className="size-5 text-orange-500" /> Missing Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {matchResult.missingKeywords?.map(kw => (
                                            <span key={kw} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium border border-orange-100">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <CheckCircle2 className="size-5 text-green-500" /> Matching Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {matchResult.matchingKeywords?.map(kw => (
                                            <span key={kw} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-100">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-2">Analysis</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{matchResult.gapAnalysis}</p>
                                </div>

                                {matchResult.tailoringSuggestions?.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <Sparkles className="size-5 text-purple-500" /> Tailoring Suggestions
                                        </h3>
                                        <ul className="space-y-3">
                                            {matchResult.tailoringSuggestions.map((suggestion, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-gray-700 bg-purple-50 p-3 rounded-xl border border-purple-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Reorder Modal */}
            {showReorderModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 relative shadow-2xl animate-in zoom-in-95 duration-300">
                        <button onClick={() => setShowReorderModal(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900"><X /></button>
                        <h2 className="text-xl font-bold mb-6">Reorder Sections</h2>
                        <p className="text-sm text-gray-500 mb-6">Drag and drop to change the order of sections on your resume.</p>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="sections">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                        {sectionOrder.map((sectionId, index) => (
                                            <Draggable key={sectionId} draggableId={sectionId} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`p - 4 rounded - xl border - 2 flex items - center gap - 4 bg - white transition - all ${snapshot.isDragging ? 'border-primary-600 shadow-lg scale-105 z-50' : 'border-gray-100 hover:border-gray-200'} `}
                                                    >
                                                        <GripVertical className="text-gray-400" />
                                                        <span className="font-bold text-gray-700">{sectionNames[sectionId]}</span>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        <button onClick={() => setShowReorderModal(false)} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold hover:bg-primary-700 transition-all mt-8">Done</button>
                    </div>
                </div>
            )}
            {/* ATS Analysis Modal */}
            {matchResult && !jobDescription && (

                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-4xl p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setMatchResult(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900"><X /></button>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Shield className="text-primary-600 size-8" />
                                    Resume Audit Report
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Main Score */}
                                <div className="bg-gray-900 text-white p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-2xl shadow-primary-900/20 col-span-1">
                                    <p className="text-primary-300 uppercase tracking-widest text-xs font-bold mb-4">ATS Compatibility Score</p>
                                    <div className="relative mb-2">
                                        <svg className="w-40 h-40 transform -rotate-90">
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                stroke="currentColor"
                                                strokeWidth="10"
                                                fill="transparent"
                                                className="text-gray-800"
                                            />
                                            <circle
                                                cx="80"
                                                cy="80"
                                                r="70"
                                                stroke="currentColor"
                                                strokeWidth="10"
                                                fill="transparent"
                                                strokeDasharray={440}
                                                strokeDashoffset={440 - (440 * (matchResult.score || 0)) / 100}
                                                className={`transition - all duration - 1000 ${matchResult.score >= 70 ? 'text-green-500' : matchResult.score >= 50 ? 'text-yellow-500' : 'text-red-500'} `}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center text-4xl font-black">
                                            {matchResult.score || 0}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">out of 100</p>
                                </div>

                                {/* Section Scores */}
                                <div className="col-span-1 md:col-span-2 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <Target className="size-5 text-gray-400" /> Section Breakdown
                                    </h3>
                                    <div className="space-y-4">
                                        {Object.entries(matchResult.sectionScores || {}).map(([section, score]) => (
                                            <div key={section} className="space-y-1.5">
                                                <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-gray-500">
                                                    <span>{section}</span>
                                                    <span>{score}/10</span>
                                                </div>
                                                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h - full rounded - full transition - all duration - 1000 ${score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-yellow-400' : 'bg-red-400'} `}
                                                        style={{ width: `${score * 10}% ` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Critical Issues */}
                            {matchResult.criticalIssues?.length > 0 && (
                                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                                    <h3 className="font-bold text-red-900 flex items-center gap-2 mb-4">
                                        <AlertCircle className="size-5 text-red-600" /> Critical Issues
                                    </h3>
                                    <ul className="space-y-2">
                                        {matchResult.criticalIssues.map((issue, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-red-700 font-medium">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                                {issue}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Missing Keywords (New) */}
                            {matchResult.missingKeywords?.length > 0 && (
                                <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
                                    <h3 className="font-bold text-orange-900 flex items-center gap-2 mb-4">
                                        <Target className="size-5 text-orange-600" /> Missing Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {matchResult.missingKeywords.map((keyword, i) => (
                                            <span key={i} className="px-3 py-1 bg-white border border-orange-200 text-orange-800 text-xs font-bold rounded-full shadow-sm">
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actionable Steps */}
                            {matchResult.actionableSteps?.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4 text-lg">
                                        <Zap className="size-5 text-yellow-500" /> Recommended Actions
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {matchResult.actionableSteps.map((step, i) => (
                                            <div key={i} className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                                <div className="text-xs font-bold uppercase tracking-widest text-primary-600 mb-2">{step.section}</div>
                                                <p className="text-sm text-gray-700 leading-relaxed font-medium">{step.feedback}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                        <CheckCircle2 className="size-5 text-green-500" /> Strengths
                                    </h3>
                                    <ul className="space-y-3">
                                        {matchResult.strengths?.map((str, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-gray-600 bg-green-50 p-3 rounded-xl border border-green-100">
                                                <Check className="size-4 text-green-600 shrink-0 mt-0.5" />
                                                {str}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                                        <AlertCircle className="size-5 text-red-500" /> General Improvements
                                    </h3>
                                    <ul className="space-y-3">
                                        {matchResult.weaknesses?.map((weak, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-gray-600 bg-red-50 p-3 rounded-xl border border-red-100">
                                                <X className="size-4 text-red-600 shrink-0 mt-0.5" />
                                                {weak}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* AI Import Modal */}
            {showImportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 sm:p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto no-scrollbar">
                        <button
                            onClick={() => setShowImportModal(false)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <X className="size-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Smart Import</h2>
                        <p className="text-gray-500 mb-8">Upload your existing PDF to extract and auto-fill your resume with AI.</p>

                        {isParsing ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
                                    <Loader2 className="size-8 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900 animate-pulse">Extracting Data...</p>
                                    <p className="text-sm text-gray-500 mt-1">This takes about 5-10 seconds</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleImportResume} className="space-y-6">
                                <label
                                    htmlFor="resume-import-upload"
                                    className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group block ${selectedFileName ? 'border-primary-600 bg-primary-50/10' : 'border-gray-200 hover:border-primary-600 hover:bg-primary-50/10'}`}
                                >
                                    <input
                                        id="resume-import-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            console.log("ResumeBuilder: File input changed:", file?.name);
                                            setSelectedFileName(file?.name || '');
                                        }}
                                    />
                                    <UploadCloud className={`size-10 mx-auto mb-4 transition-colors ${selectedFileName ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}`} />
                                    <p className="text-sm font-bold text-gray-700 leading-none">
                                        {selectedFileName || 'Click to upload PDF'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {selectedFileName ? 'File selected' : 'Max file size 5MB'}
                                    </p>
                                </label>
                                <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all">
                                    Apply Extracted Data
                                </button>
                                <p className="text-[10px] text-center text-gray-400 uppercase font-bold tracking-widest">
                                    Note: Current data will be replaced
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            )}


            {/* Trim Confirmation Modal */}
            {showTrimConfirm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="size-8 text-primary-600" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Magic Trim to 1 Page?</h3>
                        <p className="text-gray-500 font-medium mb-8">This will use AI to rewrite your summary and experience to be more concise. This action overwrites current text.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowTrimConfirm(false)}
                                className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTrimResume}
                                className="flex-1 py-3 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg shadow-primary-200 transition-colors"
                            >
                                Yes, Trim It
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Import Confirmation Modal */}
            {showImportConfirm && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="size-8 text-yellow-500" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Overwrite Data?</h3>
                        <p className="text-gray-500 font-medium mb-8">Importing will replace your current resume content. This cannot be undone.</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowImportConfirm(false)}
                                className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleImportResume(null)}
                                className="flex-1 py-3 text-sm font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-xl shadow-lg shadow-yellow-200 transition-colors"
                            >
                                Overwrite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// FileText is imported from lucide-react

export default ResumeBuilder;
