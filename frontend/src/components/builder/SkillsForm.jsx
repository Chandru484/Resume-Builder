import React, { useState } from 'react';
import { Plus, X, Sparkles, Wand2 } from 'lucide-react';

const SkillsForm = ({ data, onUpdate }) => {
    const [newSkill, setNewSkill] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (newSkill && !data.includes(newSkill)) {
            onUpdate([...data, newSkill]);
            setNewSkill('');
        }
    };

    const removeSkill = (skillToRemove) => {
        onUpdate(data.filter(s => s !== skillToRemove));
    };

    return (
        <div className="space-y-10">
            <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600 rounded-full -mr-16 -mt-16 blur-3xl opacity-20 transition-all group-hover:scale-150" />

                <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2">Technical Skills</h3>
                    <p className="text-gray-400 text-sm">Add your core competencies and technologies you work with.</p>
                </div>

                <form onSubmit={handleAdd} className="relative z-10 flex gap-3">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="e.g. React.js, Python, Figma..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-primary-500 transition-all text-white font-medium"
                    />
                    <button type="submit" className="bg-primary-600 text-white px-6 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg flex items-center gap-2 py-4">
                        <Plus className="size-5" />
                        Add
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Added Skills</label>
                <div className="flex flex-wrap gap-3">
                    {data.length === 0 && (
                        <div className="w-full py-10 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 text-gray-400 text-sm font-medium">
                            Start adding skills above...
                        </div>
                    )}
                    {data.map((skill, index) => (
                        <div
                            key={index}
                            className="group flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-2xl hover:border-primary-600 hover:shadow-lg transition-all animate-in zoom-in duration-200"
                        >
                            <span className="font-bold text-gray-700">{skill}</span>
                            <button
                                onClick={() => removeSkill(skill)}
                                className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-all"
                            >
                                <X className="size-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-primary-50 rounded-3xl border border-primary-100 space-y-4">
                <div className="flex items-center gap-2 text-primary-700 font-bold">
                    <Wand2 className="size-5" />
                    Recommended Skills
                </div>
                <div className="flex flex-wrap gap-2">
                    {['Javascript', 'TypeScript', 'Node.js', 'React', 'Next.js', 'Tailwind CSS', 'SQL', 'Git'].map(s => (
                        <button
                            key={s}
                            onClick={() => !data.includes(s) && onUpdate([...data, s])}
                            className="px-4 py-2 bg-white border border-primary-200 rounded-xl text-xs font-bold text-primary-600 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                        >
                            + {s}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SkillsForm;
