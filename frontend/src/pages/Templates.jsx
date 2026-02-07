import React, { useState, useEffect } from 'react';
import { Check, Star, LayoutTemplate, ArrowRight, Eye, X, ZoomIn, UploadCloud, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resumeService, templateService, aiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import ResumePreview from '../components/builder/ResumePreview';

// Templates now fetched from API

const Templates = () => {
    const navigate = useNavigate();
    const { error: showError } = useToast();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedPreview, setSelectedPreview] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [resumeTitle, setResumeTitle] = useState('');

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const { data } = await templateService.getAll();
                // If no templates, try seeding (dev convenience)
                if (data.length === 0) {
                    await templateService.seed();
                    // Fetch again after seeding
                    const { data: refreshedTemplates } = await templateService.getAll();
                    setTemplates(refreshedTemplates);
                } else {
                    setTemplates(data);
                }
            } catch (error) {
                console.error('Failed to fetch templates:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    const handleUseTemplate = async (template) => {
        setIsCreating(true);
        try {
            // Create a resume with the selected template name as partial title
            const { data } = await resumeService.create(`${template.name} Resume`);
            // Update the theme preference
            // Ideally should be one update call or passed in create
            await resumeService.update(data.id, {
                theme: {
                    template: template.id,
                    color: template.color || '#000000',
                    spacing: 'normal',
                    showLine: true
                }
            });

            navigate(`/app/builder/${data.id}`);
        } catch (error) {
            showError('Failed to create resume from template');
            setIsCreating(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('resume-upload');
        const file = fileInput.files[0];
        if (!file) return showError('Please select a file');

        setIsParsing(true);
        try {
            const { data: parsedData } = await aiService.parse(file);
            const { data: newResume } = await resumeService.create(resumeTitle || file.name.replace('.pdf', ''));
            await resumeService.update(newResume.id, parsedData);
            navigate(`/app/builder/${newResume.id}`);
        } catch (error) {
            console.error('Upload failed:', error);
            const msg = error.response?.data?.message || error.message || 'Failed to parse and create resume';
            showError(`Upload Error: ${msg}`);
        } finally {
            setIsParsing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-xl text-gray-400">Loading templates...</div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-primary-50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-primary-600">
                    <LayoutTemplate className="size-3" />
                    Template Gallery
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                    Choose your <span className="text-primary-600">perfect design</span>
                </h1>
                <p className="text-lg text-gray-500">
                    Start with a professionally designed template or use AI to extract data from your current resume.
                </p>
                <div className="pt-4">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary-600 transition-all shadow-xl active:scale-95"
                    >
                        <UploadCloud className="size-5" />
                        AI Smart Import
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        className="group bg-white border border-gray-100 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary-600/10 transition-all duration-500 hover:-translate-y-2"
                    >
                        <div
                            className="bg-gray-100 relative overflow-hidden group-hover:opacity-90 transition-opacity cursor-pointer text-center"
                            onClick={() => setSelectedPreview(template)}
                        >
                            <div className="h-64 relative overflow-hidden">
                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />

                                <img
                                    src={template.thumbnail}
                                    alt={template.name}
                                    className="w-full h-full object-cover object-top"
                                />

                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 translate-y-20 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUseTemplate(template);
                                        }}
                                        disabled={isCreating}
                                        className="bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-primary-50 hover:text-primary-600 border-none cursor-pointer w-48 justify-center active:scale-95"
                                    >
                                        {isCreating ? 'Creating...' : <>Use Template <ArrowRight className="size-4" /></>}
                                    </button>
                                    <div className="text-white font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                                        <Eye className="size-4" /> Click to Preview
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                        {template.name}
                                    </h3>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {template.tags.map(tag => (
                                            <span key={tag} className="text-[10px] uppercase font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {template.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            {/* Template Preview Modal */}
            {selectedPreview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-5xl h-[85vh] rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Image Preview */}
                        <div className="lg:w-2/3 bg-gray-100 relative overflow-hidden flex justify-center p-8 overflow-y-auto preview-zoom-container">
                            <div className="scale-[0.8] origin-top h-fit shadow-2xl">
                                <ResumePreview data={selectedPreview.sampleData} />
                            </div>
                            <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full border border-gray-100 shadow-sm text-xs font-bold text-gray-600 z-30">
                                <ZoomIn className="size-4 text-primary-600" />
                                Live Design Preview
                            </div>
                        </div>

                        {/* Details Sidebar */}
                        <div className="lg:w-1/3 p-12 flex flex-col justify-between bg-white overflow-y-auto">
                            <div className="space-y-8">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-[0.2em]">
                                            <Star className="size-4 fill-primary-600" /> Premium Template
                                        </div>
                                        <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{selectedPreview.name}</h2>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPreview(null)}
                                        className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all"
                                    >
                                        <X className="size-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Description</p>
                                        <p className="text-lg text-gray-600 leading-relaxed font-medium">
                                            {selectedPreview.description}
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Core Features</p>
                                        <div className="space-y-3">
                                            {selectedPreview.tags.map(tag => (
                                                <div key={tag} className="flex items-center gap-3 text-gray-700 font-bold">
                                                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                                        <Check className="size-3.5 text-green-600" strokeWidth={3} />
                                                    </div>
                                                    {tag}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-2">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Style Hint</p>
                                        <p className="text-sm text-gray-500 font-medium">This template optimizes for readability and automated scanning systems (ATS).</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 space-y-4">
                                <button
                                    onClick={() => handleUseTemplate(selectedPreview)}
                                    disabled={isCreating}
                                    className="w-full py-5 bg-gray-900 text-white rounded-[1.5rem] font-black text-lg hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-primary-900/20 active:scale-[0.98]"
                                >
                                    {isCreating ? 'Creating Workspace...' : 'Use This Template'}
                                    {!isCreating && <ArrowRight className="size-5" />}
                                </button>
                                <button
                                    onClick={() => setSelectedPreview(null)}
                                    className="w-full py-4 text-gray-500 font-bold hover:text-gray-900 transition-all text-sm"
                                >
                                    Back to Gallery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 relative shadow-2xl animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <X className="size-6" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Smart Import</h2>
                        <p className="text-gray-500 mb-8">Upload your existing PDF to extract your info with AI.</p>

                        {isParsing ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
                                    <Loader2 className="size-8 text-primary-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-gray-900 animate-pulse">Scanning your resume...</p>
                                    <p className="text-sm text-gray-500 mt-1">Extracting skills and experience</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpload} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">Resume Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Project Manager Resume"
                                        value={resumeTitle}
                                        onChange={(e) => setResumeTitle(e.target.value)}
                                        className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                                    />
                                </div>
                                <div
                                    className="relative border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-primary-600 hover:bg-primary-50/10 transition-all cursor-pointer group"
                                    onClick={() => document.getElementById('resume-upload').click()}
                                >
                                    <input
                                        id="resume-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf"
                                    />
                                    <UploadCloud className="size-10 text-gray-400 mx-auto mb-4 group-hover:text-primary-600 transition-colors" />
                                    <p className="text-sm font-bold text-gray-700 leading-none">Click to upload PDF</p>
                                    <p className="text-xs text-gray-400 mt-2">Max file size 5MB</p>
                                </div>
                                <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all">
                                    Start AI Extraction
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Templates;
