import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Briefcase, Wand2, Copy, Download, ArrowLeft, Loader2, CheckCircle2, Upload } from 'lucide-react';
import { aiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import html2pdf from 'html2pdf.js';

const CoverLetter = () => {
    const { success: showSuccess, error: showError } = useToast();
    const [step, setStep] = useState(1);
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedLetter, setGeneratedLetter] = useState('');

    const handleGenerate = async () => {
        if (!resumeText || !jobDescription) return;

        setIsGenerating(true);
        try {
            const { data } = await aiService.coverLetter(resumeText, jobDescription);
            setGeneratedLetter(data.coverLetter);
            setStep(2);
        } catch (error) {
            console.error(error);
            showError('Failed to generate cover letter. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter);
        showSuccess('Copied to clipboard!');
    };

    const handleDownload = () => {
        const element = document.getElementById('cover-letter-content');
        // Optimized settings for A4 single page
        const opt = {
            margin: [15, 15, 15, 15], // Standard standard margins
            filename: 'My_Cover_Letter.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                    <Wand2 className="size-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Cover Letter Generator</h1>
                    <p className="text-gray-500">Create a tailored cover letter in seconds.</p>
                </div>
            </div>

            {step === 1 ? (
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <FileText className="size-5 text-gray-400" /> Your Resume Content
                                </h2>
                                <label className="cursor-pointer bg-white border border-gray-200 hover:border-primary-500 text-gray-600 hover:text-primary-600 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm">
                                    <Upload className="size-4" />
                                    <span>Upload Resume (PDF)</span>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            // Show loading state if needed, or just toast
                                            const loadingToastId = document.createElement('div'); // simple hack or use state
                                            // Better to use state
                                            try {
                                                // Assuming we want to show some loading feedback
                                                e.target.value = ''; // Reset input
                                                const { data } = await aiService.extractText(file);
                                                setResumeText(data.text);
                                                showSuccess('Resume text extracted successfully!');
                                            } catch (error) {
                                                console.error(error);
                                                showError('Failed to extract text from PDF');
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">Paste or upload your resume text.</p>
                            <textarea
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your resume text here..."
                                className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none text-sm"
                            />
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Briefcase className="size-5 text-gray-400" /> Job Description
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">Paste the job description you are applying for.</p>
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste job description here..."
                                className="w-full h-64 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none text-sm"
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={!resumeText || !jobDescription || isGenerating}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:-translate-y-1"
                        >
                            {isGenerating ? (
                                <><Loader2 className="animate-spin" /> Generating Magic...</>
                            ) : (
                                <><Wand2 /> Generate Cover Letter</>
                            )}
                        </button>
                    </div>

                    {/* Preview / Instructions */}
                    <div className="hidden lg:block">
                        <div className="bg-primary-50 rounded-[2.5rem] p-10 h-full flex flex-col items-center justify-center text-center space-y-6">
                            <img
                                src="/cover-letter-quill.png"
                                alt="Cover Letter Helper"
                                className="w-64 opacity-90 hover:scale-105 transition-transform duration-500"
                            />
                            <h3 className="text-2xl font-bold text-gray-900">Why use AI?</h3>
                            <p className="text-gray-600 max-w-md">
                                Our AI analyzes your unique skills and matches them directly to the job requirements, creating a persuasive narrative that recruiters love.
                            </p>
                            <ul className="text-left space-y-3 bg-white/50 p-6 rounded-2xl w-full max-w-sm">
                                <li className="flex items-center gap-2 text-sm font-bold text-gray-700"><CheckCircle2 className="size-4 text-green-500" /> ATS Optimized Keywords</li>
                                <li className="flex items-center gap-2 text-sm font-bold text-gray-700"><CheckCircle2 className="size-4 text-green-500" /> Persuasive Tone</li>
                                <li className="flex items-center gap-2 text-sm font-bold text-gray-700"><CheckCircle2 className="size-4 text-green-500" /> Perfect Formatting</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
                    <button
                        onClick={() => setStep(1)}
                        className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft className="size-4" /> Edit Input
                    </button>

                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-900 text-white p-6 flex items-center justify-between">
                            <h2 className="font-bold flex items-center gap-2"><CheckCircle2 className="text-green-400" /> Generated Successfully</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCopy}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Copy className="size-4" /> Copy Text
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Download className="size-4" /> Download PDF
                                </button>
                            </div>
                        </div>
                        <div className="p-12 bg-white">
                            <div id="cover-letter-content" className="max-w-none font-sans text-base leading-loose text-gray-900 whitespace-pre-wrap text-justify">
                                {generatedLetter}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoverLetter;
