import React from 'react';
import { Plus, Trash2, Calendar, Building2, Briefcase, Sparkles, GripVertical, Loader2, Zap } from 'lucide-react';

const ExperienceForm = ({ data, onUpdate, onAIEnhance }) => {
    const addExperience = () => {
        onUpdate([...data, { company: '', role: '', startDate: '', endDate: '', description: '', current: false }]);
    };

    const removeExperience = (index) => {
        onUpdate(data.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const newData = [...data];
        newData[index][field] = value;
        onUpdate(newData);
    };

    const handleAIEnhance = (index) => {
        onAIEnhance(data[index].description, index);
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between sticky top-0 bg-white z-10 py-2 border-b border-gray-50 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Work Experience</h3>
                <button
                    onClick={addExperience}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg"
                >
                    <Plus className="size-4" />
                    Add Experience
                </button>
            </div>

            {data.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                    <Briefcase className="size-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No experience added yet. Click above to start.</p>
                </div>
            )}

            <div className="space-y-12">
                {data.map((exp, index) => (
                    <div key={index} className="relative group animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 p-1 text-gray-200 group-hover:text-gray-400 cursor-grab active:cursor-grabbing transition-colors hidden lg:block">
                            <GripVertical className="size-5" />
                        </div>

                        <div className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm group-hover:shadow-xl group-hover:border-primary-100 transition-all space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                        <Building2 className="size-5" />
                                    </div>
                                    <h4 className="font-black text-gray-900 uppercase tracking-widest">Experience #{index + 1}</h4>
                                </div>
                                <button
                                    onClick={() => removeExperience(index)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Company</label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => handleChange(index, 'company', e.target.value)}
                                        placeholder="e.g. Google"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl underline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Role / Designation</label>
                                    <input
                                        type="text"
                                        value={exp.role}
                                        onChange={(e) => handleChange(index, 'role', e.target.value)}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl underline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                                        <Calendar className="size-3" /> Start Date
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.startDate}
                                        onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                                        placeholder="Jan 2020"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                                        <Calendar className="size-3" /> End Date
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.endDate}
                                        onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                                        placeholder="Present"
                                        className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Job Description</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative group/ai">
                                            <button
                                                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-all border border-primary-100"
                                            >
                                                <Sparkles className="size-3" />
                                                Improve with AI
                                            </button>
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hidden group-hover/ai:block z-50 animate-in fade-in zoom-in-95 duration-200">
                                                <button onClick={() => onAIEnhance(data[index].description, index, 'professional')} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-2">
                                                    <Briefcase className="size-3.5 text-blue-500" /> Professional
                                                </button>
                                                <button onClick={() => onAIEnhance(data[index].description, index, 'impact')} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-2">
                                                    <Sparkles className="size-3.5 text-purple-500" /> High Impact
                                                </button>
                                                <button onClick={() => onAIEnhance(data[index].description, index, 'concise')} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 font-medium text-gray-700 flex items-center gap-2">
                                                    <Zap className="size-3.5 text-yellow-500" /> Concise
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <textarea
                                    rows={6}
                                    value={exp.description}
                                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                                    placeholder="Describe your achievements and responsibilities..."
                                    className="block w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] focus:bg-white transition-all resize-none text-sm"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExperienceForm;
