import React from 'react';
import { Plus, Trash2, FolderCode, Link as LinkIcon, Calendar } from 'lucide-react';

const ProjectsForm = ({ data, onUpdate }) => {
    const addProject = () => {
        onUpdate([...data, { title: '', category: '', link: '', description: '' }]);
    };

    const removeProject = (index) => {
        onUpdate(data.filter((_, i) => i !== index));
    };

    const handleChange = (index, field, value) => {
        const newData = [...data];
        newData[index][field] = value;
        onUpdate(newData);
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between sticky top-0 bg-white z-10 py-2 border-b border-gray-50 mb-4">
                <h3 className="text-lg font-bold text-gray-900">Key Projects</h3>
                <button
                    onClick={addProject}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg"
                >
                    <Plus className="size-4" />
                    Add Project
                </button>
            </div>

            <div className="space-y-10">
                {data.map((proj, index) => (
                    <div key={index} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all space-y-6 relative group">
                        <button
                            onClick={() => removeProject(index)}
                            className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <Trash2 className="size-4" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FolderCode className="size-6" />
                            </div>
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-lg">Project #{index + 1}</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Project Name</label>
                                <input
                                    type="text"
                                    value={proj.title || ''}
                                    onChange={(e) => handleChange(index, 'title', e.target.value)}
                                    placeholder="e.g. AI Interview Prep"
                                    className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Type / Category</label>
                                <input
                                    type="text"
                                    value={proj.category || ''}
                                    onChange={(e) => handleChange(index, 'category', e.target.value)}
                                    placeholder="e.g. Full Stack Web App"
                                    className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Project Link (Optional)</label>
                                <div className="relative group/input">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within/input:text-primary-600 transition-colors" />
                                    <input
                                        type="text"
                                        value={proj.link}
                                        onChange={(e) => handleChange(index, 'link', e.target.value)}
                                        placeholder="e.g. https://github.com/user/project"
                                        className="block w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Description</label>
                                <textarea
                                    rows={4}
                                    value={proj.description}
                                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                                    placeholder="Briefly explain what you built and the tools used..."
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

export default ProjectsForm;
