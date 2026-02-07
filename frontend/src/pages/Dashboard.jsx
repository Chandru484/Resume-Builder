import React, { useState, useEffect, useRef } from 'react';
import { Plus, UploadCloud, FileText, Trash2, Edit3, ExternalLink, MoreVertical, Eye, X, Loader2, Download, Sparkles, RotateCcw } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import api, { resumeService, aiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import ResumePreview from '../components/builder/ResumePreview';

const Dashboard = () => {
    const navigate = useNavigate();
    const { searchTerm = '' } = useOutletContext() || {};
    const { user } = useAuth();
    const { success: showSuccess, error: showError } = useToast();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creationMode, setCreationMode] = useState('blank'); // 'blank' or 'ai'
    const [isParsing, setIsParsing] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [resumeTitle, setResumeTitle] = useState('');
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('active'); // 'active' | 'archived'

    // Preview Modal State
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [viewingResumeData, setViewingResumeData] = useState(null);
    const [viewingTitle, setViewingTitle] = useState('');
    const [isViewerLoading, setIsViewerLoading] = useState(false);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [resumeToDelete, setResumeToDelete] = useState(null);

    const contentRef = useRef(null);

    const filteredResumes = resumes.filter(resume =>
        resume.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchResumes();
    }, [viewMode]);

    // Refresh resumes when the page becomes visible (e.g., navigating back from builder)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchResumes();
            }
        };

        const handleFocus = () => {
            fetchResumes();
        };

        // Listen for visibility changes
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [viewMode]);

    const fetchResumes = async () => {
        try {
            const { data } = await resumeService.getAll({ archived: viewMode === 'archived' });
            setResumes(data);
        } catch (error) {
            console.error('Error fetching resumes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await resumeService.create(resumeTitle);
            navigate(`/app/builder/${data.id}`);
        } catch (error) {
            showError('Failed to create resume');
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        console.log("Dashboard: handleUpload triggered");
        const fileInput = document.getElementById('resume-upload');
        const file = fileInput.files?.[0];
        console.log("Dashboard: selected file:", file?.name);
        if (!file) return showError('Please select a file');

        setIsParsing(true);
        try {
            const { data: parsedData } = await aiService.parse(file);
            console.log("Dashboard: Parsed AI Data:", parsedData);
            const { data: newResume } = await resumeService.create(resumeTitle || file.name.replace('.pdf', ''));
            console.log("Dashboard: Created new resume:", newResume.id);

            // Clean internal fields just in case they were hallucinated/included
            const { _id, user, createdAt, updatedAt, __v, sectionOrder, ...sanitizedData } = parsedData;

            // SAFETY CLEAN: Ensure data types match schema (Mongoose Cast Fix)
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
                ...sanitizedData,
                experience: normalizeArray(sanitizedData.experience, {
                    company: '', role: '', startDate: '', endDate: '', description: ''
                }),
                education: normalizeArray(sanitizedData.education, {
                    school: '', degree: '', year: ''
                }),
                projects: normalizeArray(sanitizedData.projects, {
                    title: '', category: '', link: '', description: ''
                }),
                skills: Array.isArray(sanitizedData.skills)
                    ? sanitizedData.skills.map(s => typeof s === 'object' ? (s.name || s.title || JSON.stringify(s)) : String(s)).filter(Boolean)
                    : [],
                summary: String(sanitizedData.summary || '')
            };

            // Remove any field that is null/undefined or not in our expected list to be super safe
            const allowList = ['title', 'personalInfo', 'summary', 'experience', 'education', 'projects', 'skills', 'theme'];
            Object.keys(saveData).forEach(key => {
                if (!allowList.includes(key)) delete saveData[key];
            });

            await resumeService.update(newResume.id, saveData);
            console.log("Dashboard: Updated resume with AI data, navigating...");
            navigate(`/app/builder/${newResume.id}`);
        } catch (error) {
            console.error('Upload failed:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to parse and create resume';
            const detail = error.response?.data?.error || '';
            showError(`Upload Error: ${msg}\n${detail ? `Details: ${detail}` : ''}`);
        } finally {
            setIsParsing(false);
            if (fileInput) fileInput.value = '';
            setSelectedFileName('');
        }
    };

    const confirmDelete = (id) => {
        setResumeToDelete(id);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!resumeToDelete) return;
        try {
            if (viewMode === 'archived') {
                await resumeService.permanentDelete(resumeToDelete);
                showSuccess('Resume permanently deleted');
            } else {
                await resumeService.delete(resumeToDelete);
                showSuccess('Resume archived');
            }
            fetchResumes();
            setShowDeleteModal(false);
            setResumeToDelete(null);
        } catch (error) {
            showError('Failed to delete resume');
        }
    };

    const handleRestore = async (id) => {
        try {
            await resumeService.restore(id);
            fetchResumes();
            showSuccess('Resume restored');
        } catch (error) {
            showError('Failed to restore resume');
        }
    };

    const handleView = async (id, title) => {
        setIsViewerLoading(true);
        setViewingTitle(title);
        setShowPreviewModal(true);
        try {
            const { data } = await resumeService.getById(id);
            // Ensure data has all required objects to match ResumeBuilder expectations
            setViewingResumeData({
                ...data,
                personalInfo: { ...(data.personalInfo || {}) },
                theme: { ...(data.theme || { color: '#ea580c', template: 'classic', spacing: 'normal', showLine: true }) }
            });
        } catch (error) {
            console.error('View failed:', error);
            showError('Failed to load resume preview.');
            setShowPreviewModal(false);
        } finally {
            setIsViewerLoading(false);
        }
    };

    const handleDownload = async (url, title) => {
        // If we have a URL (legacy PDF blob), download it directly
        if (url) {
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title || 'resume'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // Ensure content is ready
        if (!contentRef.current) {
            showError('Preview not ready. Please try again.');
            return;
        }

        const element = contentRef.current;

        // Save original styles to restore later
        const originalTransform = element.style.transform;
        const originalMarginBottom = element.style.marginBottom;
        const originalShadow = element.style.boxShadow;
        const originalOverflow = element.style.overflow;
        const originalMinHeight = element.style.minHeight;
        const originalHeight = element.style.height;

        // Reset all transformations for proper PDF rendering
        element.style.setProperty('--preview-scale', '1');
        element.style.transform = 'scale(1)';
        element.style.marginBottom = '0';
        element.style.boxShadow = 'none';
        element.style.borderRadius = '0';
        element.style.minHeight = 'auto';
        element.style.height = 'auto';

        const opt = {
            margin: 0,
            filename: `${viewingTitle || 'resume'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                scrollY: 0,
                windowWidth: 794  // A4 width at 96dpi
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: {
                mode: 'avoid-all',  // Prevent automatic page breaks
                avoid: ['.resume-container', '.resume-section', '.resume-item']
            }
        };

        try {
            await html2pdf().set(opt).from(element).save();
            showSuccess('PDF downloaded successfully');
        } catch (error) {
            console.error('PDF generation failed:', error);
            showError('Failed to generate PDF. Please try again.');
        } finally {
            // Restore original styles
            element.style.removeProperty('--preview-scale');
            element.style.transform = originalTransform;
            element.style.marginBottom = originalMarginBottom;
            element.style.boxShadow = originalShadow;
            if (originalOverflow) element.style.overflow = originalOverflow;
            else element.style.removeProperty('overflow');
            if (originalMinHeight) element.style.minHeight = originalMinHeight;
            else element.style.removeProperty('min-height');
            if (originalHeight) element.style.height = originalHeight;
            else element.style.removeProperty('height');
        }
    };

    // Handle scaling for the preview modal
    useEffect(() => {
        const handleResize = () => {
            if (!showPreviewModal) return;
            const container = document.getElementById('dashboard-preview-container');
            if (container) {
                const padding = window.innerWidth < 1024 ? 32 : 64; // Less padding on mobile
                const width = container.offsetWidth - padding;
                // Calculate scale to fit 794px (A4 width) into the container
                const scale = Math.min(1.2, width / 794);
                document.documentElement.style.setProperty('--preview-scale', scale.toString());
            }
        };

        if (showPreviewModal && !isViewerLoading) {
            // Delay slightly to ensure DOM is ready
            const timer = setTimeout(handleResize, 100);
            window.addEventListener('resize', handleResize);
            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [showPreviewModal, isViewerLoading, viewingResumeData]);


    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-gray-900 rounded-[3rem] p-10 lg:p-14 text-white relative overflow-hidden shadow-2xl shadow-primary-200/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px] -z-10" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] -z-10" />

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary-400">
                        <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                        Elite Account
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight uppercase">Welcome, <span className="text-primary-500">{user?.name || 'User'}</span></h1>
                    <p className="text-gray-400 text-lg font-medium max-w-lg">Your career journey is looking great. Ready to craft your next masterpiece?</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => {
                            setCreationMode('blank');
                            setShowCreateModal(true);
                        }}
                        className="group flex items-center gap-3 bg-primary-600 text-white px-8 py-5 rounded-[2rem] font-bold hover:bg-white hover:text-gray-900 transition-all shadow-[0_20px_50px_-15px_rgba(22,163,74,0.4)] active:scale-95"
                    >
                        <Plus className="size-6 group-hover:rotate-90 transition-transform" />
                        Create New Resume
                    </button>
                    <button
                        onClick={() => {
                            setCreationMode('ai');
                            setShowCreateModal(true);
                        }}
                        className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-5 rounded-[2rem] font-bold hover:bg-white/10 transition-all backdrop-blur-sm active:scale-95"
                    >
                        <UploadCloud className="size-6 text-primary-400" />
                        AI Smart Import
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {[
                    { label: 'Total Resumes', value: resumes.length, color: 'text-primary-600', bg: 'bg-primary-50' },
                    { label: 'AI Score Avg', value: '92%', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Views (30d)', value: '1,280', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Downloads', value: '42', color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-8 px-4 lg:px-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                        {viewMode === 'archived' ? 'Archived Resumes' : 'Recent Projects'}
                    </h2>
                    <button 
                        onClick={() => setViewMode(prev => prev === 'active' ? 'archived' : 'active')}
                        className="text-sm font-bold text-primary-600 hover:underline flex items-center gap-2"
                    >
                        {viewMode === 'active' ? (
                            <>
                                <Trash2 className="size-4" />
                                View Archive
                            </>
                        ) : (
                            <>
                                <FileText className="size-4" />
                                View Active Resumes
                            </>
                        )}
                    </button>
                </div>
                {/* Resume Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredResumes.length === 0 && !loading && (
                        <div className="col-span-full py-20 bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 bg-gray-100/50 rounded-full flex items-center justify-center">
                                <FileText className="size-10 text-gray-300" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-gray-900 uppercase">No Resumes Found</h3>
                                <p className="text-gray-500 font-medium max-w-xs">
                                    {viewMode === 'archived' ? 'Your archive is empty.' : 'Start your career journey by creating your first professional resume.'}
                                </p>
                            </div>
                        </div>
                    )}

                    {filteredResumes.map((resume) => (
                        <div key={resume.id} className="group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between min-h-[280px] overflow-hidden">

                            <div className="space-y-6 relative">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform decoration-clone"
                                    style={{ backgroundColor: `${resume.theme?.color || '#ea580c'}15`, color: resume.theme?.color || '#ea580c' }}
                                >
                                    <FileText className="size-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-primary-600 transition-colors leading-tight truncate px-0.5">{resume.title}</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        <span>Last Mod: {resume.updatedAt?._seconds ? new Date(resume.updatedAt._seconds * 1000).toLocaleDateString() : new Date(resume.updatedAt).toLocaleDateString()}</span>
                                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                        <span>A4 Format</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-8 relative">
                                {viewMode === 'active' ? (
                                    <>
                                        <button
                                            onClick={() => navigate(`/app/builder/${resume.id}`)}
                                            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-primary-100 active:scale-95"
                                        >
                                            <Edit3 className="size-4" />
                                            Edit Resume
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(resume.id)}
                                            className="p-4 rounded-2xl border border-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-90"
                                            title="Archive Resume"
                                        >
                                            <Trash2 className="size-5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleRestore(resume.id)}
                                            className="flex-1 bg-primary-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                        >
                                            <RotateCcw className="size-4" />
                                            Restore
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(resume.id)}
                                            className="p-4 rounded-2xl border border-gray-100 text-red-500 bg-red-50 hover:bg-red-100 hover:border-red-200 transition-all active:scale-90"
                                            title="Delete Permanently"
                                        >
                                            <Trash2 className="size-5" />
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => handleView(resume.id, resume.title)}
                                    className="p-4 rounded-2xl border border-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-90"
                                    title="View PDF"
                                >
                                    <Eye className="size-5" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Add New Empty Card */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="group border-2 border-dashed border-gray-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-primary-600 hover:bg-primary-50/20 transition-all duration-500 min-h-[280px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                            <Plus className="size-8 text-gray-300 group-hover:text-primary-600 group-hover:rotate-90 transition-all" />
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-gray-900 uppercase tracking-tight">Create New</p>
                            <p className="text-xs text-gray-400 font-medium">Start blank or use AI</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Unified Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[110] overflow-y-auto w-screen">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowCreateModal(false)} />
                    
                    {/* Modal Panel - Centered using min-h-full flex approach */}
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 md:p-10 relative shadow-2xl animate-in zoom-in-95 duration-300 text-left transform transition-all my-8" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all z-10"
                            >
                                <X className="size-6" />
                            </button>

                            <div className="flex gap-4 p-1 bg-gray-50 rounded-2xl mb-8 relative z-0">
                                <button
                                    onClick={() => setCreationMode('blank')}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${creationMode === 'blank' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Start Blank
                                </button>
                                <button
                                    onClick={() => setCreationMode('ai')}
                                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${creationMode === 'ai' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        <Sparkles className="size-3" />
                                        AI Import
                                    </span>
                                </button>
                            </div>

                            {isParsing ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
                                        <Loader2 className="size-8 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-gray-900 animate-pulse">Analysing your resume...</p>
                                        <p className="text-sm text-gray-500 mt-1">This will take a few seconds</p>
                                    </div>
                                </div>
                            ) : (
                                creationMode === 'blank' ? (
                                    <form onSubmit={handleCreate} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Resume Title</label>
                                            <input
                                                type="text"
                                                required
                                                autoFocus
                                                value={resumeTitle}
                                                onChange={(e) => setResumeTitle(e.target.value)}
                                                placeholder="e.g. Senior Software Engineer"
                                                className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                                            />
                                        </div>
                                        <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all">
                                            Build Resume
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleUpload} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Resume Title</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Senior Software Engineer"
                                                value={resumeTitle}
                                                onChange={(e) => setResumeTitle(e.target.value)}
                                                className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                                            />
                                        </div>
                                        <label
                                            htmlFor="resume-upload"
                                            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group block ${selectedFileName ? 'border-primary-600 bg-primary-50/10' : 'border-gray-200 hover:border-primary-600 hover:bg-primary-50/10'}`}
                                        >
                                            <input
                                                id="resume-upload"
                                                type="file"
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    console.log("Dashboard: File input changed:", file?.name);
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
                                            Parse with AI
                                        </button>
                                    </form>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Visual Resume Preview Modal */}
            {(showPreviewModal) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                    <FileText className="size-5 text-primary-600" />
                                    {viewingTitle || 'Resume Preview'}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">High Fidelity Preview</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handleDownload()}
                                    className="p-3 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all border border-gray-200 group"
                                    title="Download PDF"
                                >
                                    <Download className="size-5 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPreviewModal(false);
                                        setViewingResumeData(null);
                                    }}
                                    className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div id="dashboard-preview-container" className="flex-1 bg-gray-100 relative overflow-auto p-4 lg:p-8 flex justify-center">
                            {isViewerLoading ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/50">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
                                        <Loader2 className="size-8 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-600 animate-pulse lowercase tracking-widest">Loading Preview...</p>
                                </div>
                            ) : (
                                viewingResumeData && (
                                    <div ref={contentRef} className="shadow-2xl transition-transform duration-300 origin-top">
                                        <ResumePreview data={viewingResumeData} />
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash2 className="size-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">
                            {viewMode === 'archived' ? 'Permanently Delete?' : 'Archive Resume?'}
                        </h3>
                        <p className="text-gray-500 font-medium mb-8">
                            {viewMode === 'archived' 
                                ? 'This action cannot be undone. Are you sure you want to permanently remove this resume?' 
                                : 'This resume will be moved to the archive. You can restore it later.'}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className={`flex-1 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-colors ${
                                    viewMode === 'archived' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                                }`}
                            >
                                {viewMode === 'archived' ? 'Delete Forever' : 'Archive'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
