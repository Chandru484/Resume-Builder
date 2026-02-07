import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Share2, ChevronLeft, Printer } from 'lucide-react';
import ResumePreview from '../components/builder/ResumePreview';
import { resumeService } from '../services/api';

const Preview = () => {
    const { resumeId } = useParams();
    const [resumeData, setResumeData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const { data } = await resumeService.getById(resumeId);
                setResumeData(data);
            } catch (error) {
                console.error('Error fetching resume:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResume();
    }, [resumeId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!resumeData) return <div className="min-h-screen flex items-center justify-center">Resume not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-outfit print:bg-white">
            {/* Header */}
            <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 sticky top-0 z-50 print:hidden">
                <div className="flex items-center gap-4">
                    <Link to="/app" className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-all">
                        <ChevronLeft className="size-5" />
                    </Link>
                    <div className="h-6 w-px bg-gray-100" />
                    <h2 className="font-bold text-gray-900">Preview: {resumeData.title}</h2>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePrint}
                        className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2"
                    >
                        <Printer className="size-4" />
                        Print / Download PDF
                    </button>
                    <button className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all flex items-center gap-2">
                        <Share2 className="size-4" />
                        Share Link
                    </button>
                </div>
            </header>

            {/* Preview Area */}
            <div className="flex-1 overflow-y-auto p-8 lg:p-20 flex justify-center items-start print:p-0">
                <div className="w-full max-w-[850px] print:max-w-none">
                    <ResumePreview data={resumeData} />
                </div>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          body { background: white !important; }
          .min-h-screen { height: auto !important; min-height: 0 !important; }
          .preview-container { scale: 1 !important; transform: none !important; width: 100% !important; margin: 0 !important; }
        }
      `}} />
        </div>
    );
};

export default Preview;
