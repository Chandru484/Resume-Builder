import React from 'react';
import { Plus, Trash2, GraduationCap, School, Calendar } from 'lucide-react';

const EducationForm = ({ data, onUpdate }) => {
    const addEducation = () => {
        onUpdate([...data, { school: '', degree: '', year: '' }]);
    };

    const removeEducation = (index) => {
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
                <h3 className="text-lg font-bold text-gray-900">Education Details</h3>
                <button
                    onClick={addEducation}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg"
                >
                    <Plus className="size-4" />
                    Add Education
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {data.map((edu, index) => (
                    <div key={index} className="p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all space-y-6 relative group">
                        <button
                            onClick={() => removeEducation(index)}
                            className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                            <Trash2 className="size-4" />
                        </button>

                        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                            <GraduationCap className="size-5" />
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Institute / University</label>
                                <div className="relative group/input">
                                    <School className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-gray-300 group-focus-within/input:text-primary-600 transition-colors" />
                                    <input
                                        type="text"
                                        value={edu.school}
                                        onChange={(e) => handleChange(index, 'school', e.target.value)}
                                        placeholder="e.g. Stanford University"
                                        className="block w-full pl-11 pr-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Degree / Course</label>
                                <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) => handleChange(index, 'degree', e.target.value)}
                                    placeholder="e.g. Bachelor of Science in CS"
                                    className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 flex items-center gap-1.5">
                                    <Calendar className="size-3" /> Graduation Year
                                </label>
                                <input
                                    type="text"
                                    value={edu.year}
                                    onChange={(e) => handleChange(index, 'year', e.target.value)}
                                    placeholder="e.g. 2024"
                                    className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EducationForm;
