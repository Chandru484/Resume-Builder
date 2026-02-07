import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, TrendingUp, Search, Briefcase, ArrowRight, Loader2, Upload } from 'lucide-react';
import { aiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const CareerLab = () => {
    const { error: showError, info: showInfo, success: showSuccess } = useToast();
    const [activeTab, setActiveTab] = useState('scan');

    // --- State for Resume Scan ---
    const [scanFile, setScanFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    // --- State for Job Match ---
    const [matchResumeText, setMatchResumeText] = useState('');
    const [matchJobDesc, setMatchJobDesc] = useState('');
    const [isMatching, setIsMatching] = useState(false);
    const [matchResult, setMatchResult] = useState(null);

    // --- Handlers: Resume Scan ---
    const handleScanFileChange = (e) => {
        setScanFile(e.target.files[0]);
        setScanResult(null);
    };

    const handleScan = async () => {
        if (!scanFile) return;
        setIsScanning(true);
        try {
            const { data } = await aiService.analyze(scanFile);
            setScanResult(data);
        } catch (error) {
            console.error(error);
            showError('Analysis failed. Please try again.');
        } finally {
            setIsScanning(false);
        }
    };

    // --- Handlers: Job Match ---
    const handleJobMatch = async () => {
        if (!matchResumeText.trim() || !matchJobDesc.trim()) {
            showError("Please enter both resume text and job description.");
            return;
        }

        setIsMatching(true);
        showInfo("Analyzing job fit...", { duration: 2000 }); // Immediate feedback
        try {
            const { data } = await aiService.jobMatch(matchResumeText, matchJobDesc);
            setMatchResult(data);
            showSuccess("Analysis complete!");
        } catch (error) {
            console.error("Match failed:", error);
            const serverError = error.response?.data?.error || error.message;

            if (serverError.includes('429') || serverError.includes('Quota') || serverError.includes('Too Many Requests')) {
                showError("AI Usage Limit Reached. Please wait ~30 seconds and try again.");
            } else {
                showError(`Job matching failed: ${serverError.substring(0, 100)}...`);
            }
        } finally {
            setIsMatching(false);
        }
    };


    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto pb-20">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-purple-600 border border-purple-100">
                    <TrendingUp className="size-3.5" />
                    Resume Scorer
                </div>
                <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Resume Scorer</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                    Optimize your resume and check your fit for specific roles in seconds.
                </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center p-1.5 bg-slate-100 rounded-[1.5rem] max-w-lg mx-auto">
                {['scan', 'match'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm transition-all duration-300 ${activeTab === tab
                            ? 'bg-white text-slate-900 shadow-lg scale-100'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
                            }`}
                    >
                        {tab === 'scan' && <><Search className="size-4" /> Resume Scan</>}
                        {tab === 'match' && <><Briefcase className="size-4" /> Job Matcher</>}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 min-h-[500px] relative overflow-hidden">

                {/* --- TAB 1: RESUME SCANNER --- */}
                {activeTab === 'scan' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        {!scanResult ? (
                            <div className="text-center space-y-8">
                                <div className="max-w-xl mx-auto space-y-2">
                                    <h2 className="text-2xl font-bold text-slate-900">ATS Compatibility Check</h2>
                                    <p className="text-slate-500">Upload your PDF resume to see how well it parses and get actionable feedback.</p>
                                </div>

                                <div
                                    className={`border-4 border-dashed rounded-[2rem] p-16 transition-all cursor-pointer group hover:border-purple-400 hover:bg-purple-50/10 ${scanFile ? 'border-purple-500 bg-purple-50/20' : 'border-slate-200'}`}
                                    onClick={() => !isScanning && document.getElementById('lab-upload').click()}
                                >
                                    <input id="lab-upload" type="file" className="hidden" accept=".pdf" onChange={handleScanFileChange} />

                                    <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center mb-6 transition-colors ${scanFile ? 'bg-purple-600 text-white shadow-xl shadow-purple-200' : 'bg-slate-100 text-slate-400 group-hover:bg-purple-100 group-hover:text-purple-600'}`}>
                                        {isScanning ? <Loader2 className="size-10 animate-spin" /> : <UploadCloud className="size-10" />}
                                    </div>

                                    {scanFile ? (
                                        <div>
                                            <p className="text-xl font-bold text-slate-900">{scanFile.name}</p>
                                            <p className="text-sm text-purple-600 font-bold mt-2 uppercase tracking-wide">Ready to Analyze</p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xl font-bold text-slate-900">Drop your resume here</p>
                                            <p className="text-slate-400 mt-2 font-medium">Supports PDF up to 10MB</p>
                                        </div>
                                    )}
                                </div>

                                {scanFile && (
                                    <button
                                        onClick={handleScan}
                                        disabled={isScanning}
                                        className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-purple-600 transition-all shadow-xl shadow-purple-200/50 disabled:opacity-70 flex items-center gap-3 mx-auto"
                                    >
                                        {isScanning ? 'Running Diagnostics...' : <>Run Analysis <ArrowRight className="size-5" /></>}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Score Dashboard */}
                                <div className="flex flex-col md:flex-row items-center justify-between bg-slate-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                                    <div className="relative z-10 space-y-2 text-center md:text-left">
                                        <p className="text-purple-300 font-black uppercase tracking-[0.2em] text-xs">
                                            ATS Compatibility Score
                                            {scanResult.isMock && <span className="ml-2 bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px]">DEMO MODE</span>}
                                        </p>
                                        <div className="text-7xl font-black tracking-tighter">{scanResult.score}/100</div>
                                        <p className="text-slate-400 text-sm font-medium">Based on keyword density, formatting, and readability.</p>
                                    </div>
                                    <div className="relative z-10 w-40 h-40 mt-8 md:mt-0">
                                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                            <path className="text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" strokeDasharray={`${scanResult.score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center font-black text-xl">{scanResult.score}%</div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-[2rem]">
                                        <h3 className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
                                            <div className="p-2 bg-emerald-100 rounded-lg"><CheckCircle2 className="text-emerald-600 size-5" /></div>
                                            Key Strengths
                                        </h3>
                                        <ul className="space-y-4">
                                            {scanResult.strengths.map((str, i) => (
                                                <li key={i} className="flex gap-4 text-sm text-slate-700 font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0 shadow-sm" />
                                                    {str}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-amber-50/50 border border-amber-100 p-8 rounded-[2rem]">
                                        <h3 className="flex items-center gap-3 text-lg font-bold text-slate-900 mb-6">
                                            <div className="p-2 bg-amber-100 rounded-lg"><AlertCircle className="text-amber-600 size-5" /></div>
                                            Improvements
                                        </h3>
                                        <ul className="space-y-4">
                                            {scanResult.weaknesses?.map((imp, i) => (
                                                <li key={i} className="flex gap-4 text-sm text-slate-700 font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0 shadow-sm" />
                                                    {imp}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <button
                                    onClick={() => { setScanFile(null); setScanResult(null); }}
                                    className="w-full py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                    Scan Another Resume
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* --- TAB 2: JOB MATCHER --- */}
                {activeTab === 'match' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {!matchResult ? (
                            <div className="space-y-8">
                                <div className="text-center max-w-xl mx-auto space-y-2">
                                    <h2 className="text-2xl font-bold text-slate-900">Job Fit Analyzer</h2>
                                    <p className="text-slate-500">Paste your resume and the job description to see how well you match the role.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Resume Text</label>
                                            <label className="cursor-pointer text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 transition-all">
                                                <Upload className="size-3" />
                                                <span>Upload PDF</span>
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    className="hidden"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;

                                                        showInfo("Extracting text from resume...", { duration: 2000 });
                                                        try {
                                                            e.target.value = ''; // Reset
                                                            const { data } = await aiService.extractText(file);
                                                            setMatchResumeText(data.text);
                                                            showSuccess('Resume extracted successfully!');
                                                        } catch (error) {
                                                            console.error(error);
                                                            showError('Failed to extract text from PDF');
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <textarea
                                            value={matchResumeText}
                                            onChange={(e) => setMatchResumeText(e.target.value)}
                                            placeholder="Paste your full resume content here..."
                                            className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-3xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Job Description</label>
                                        <textarea
                                            value={matchJobDesc}
                                            onChange={(e) => setMatchJobDesc(e.target.value)}
                                            placeholder="Paste the job description here..."
                                            className="w-full h-64 p-6 bg-slate-50 border border-slate-200 rounded-3xl resize-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-sm"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleJobMatch}
                                    disabled={isMatching || !matchResumeText || !matchJobDesc}
                                    className="w-full md:w-auto px-12 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200/50 disabled:opacity-70 disabled:cursor-not-allowed mx-auto block"
                                >
                                    {isMatching ? <><Loader2 className="inline animate-spin mr-2" /> Analyzing Match...</> : 'Calculate Match Score'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex flex-col items-center justify-center bg-slate-900 text-white p-10 rounded-[2.5rem] text-center shadow-xl">
                                    <p className="text-blue-300 font-bold uppercase tracking-[0.2em] text-xs mb-4">
                                        Match Probability
                                        {matchResult.isMock && <span className="ml-2 bg-yellow-500 text-black px-2 py-0.5 rounded text-[10px]">DEMO MODE - QUOTA EXCEEDED</span>}
                                    </p>
                                    <div className="flex items-baseline justify-center gap-1 mb-2">
                                        <span className={`text-8xl font-black tracking-tighter ${matchResult.matchPercentage >= 70 ? 'text-emerald-400' : matchResult.matchPercentage >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                                            {matchResult.matchPercentage}
                                        </span>
                                        <span className="text-4xl font-bold text-slate-500">%</span>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        {matchResult.missingKeywords && matchResult.missingKeywords.slice(0, 3).map(kw => ( // Assuming missingKeywords exists
                                            <span key={kw} className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white/80 line-through decoration-red-400">{kw}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><div className="w-2 h-8 bg-blue-600 rounded-full" />Analysis Report</h3>
                                    <div className="prose prose-sm max-w-none text-slate-600">
                                        {/* Assuming API returns a qualitative analysis string or we render simple feedback */}
                                        <p className="leading-relaxed whitespace-pre-line">{matchResult.analysis || "No detailed analysis provided. Check keyword matches."}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setMatchResult(null)}
                                    className="w-full py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                >
                                    Analyze Another Role
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CareerLab;
