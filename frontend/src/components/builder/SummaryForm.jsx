import React from 'react';
import { Sparkles } from 'lucide-react';

const SummaryForm = ({ data, onUpdate, onAIEnhance }) => {
    const handleChange = (e) => {
        onUpdate(e.target.value);
    };

    const handleAIEnhance = () => {
        onAIEnhance(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700 ml-1">Professional Summary</label>
                <button
                    onClick={handleAIEnhance}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-all border border-primary-100 group"
                >
                    <Sparkles className="size-3.5 group-hover:rotate-12 transition-transform" />
                    AI Enhance
                </button>
            </div>

            <div className="relative group">
                <textarea
                    rows={10}
                    value={data || ''}
                    onChange={handleChange}
                    placeholder="e.g. Passionate software engineer with 5+ years of experience in building scalable web applications..."
                    className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[2rem] focus:bg-white focus:ring-8 focus:ring-primary-600/5 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400 text-gray-900 leading-relaxed font-medium resize-none shadow-inner"
                />
                <div className="absolute bottom-6 right-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest pointer-events-none">
                    {data?.length || 0} Characters
                </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                    <Sparkles className="size-4 text-blue-600" />
                </div>
                <p className="text-xs text-blue-700 leading-relaxed">
                    <span className="font-bold">Pro Tip:</span> A good summary should highlight your key achievements and top skills in 3-4 concise sentences. Use our <span className="underline cursor-pointer">AI Enhance</span> to perfect it.
                </p>
            </div>
        </div>
    );
};

export default SummaryForm;
