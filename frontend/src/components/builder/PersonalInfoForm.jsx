import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Linkedin, Globe, Camera } from 'lucide-react';
import { imageService } from '../../services/api';

const PersonalInfoForm = ({ data = {}, onUpdate }) => {
    // const [isRemovingBg, setIsRemovingBg] = useState(false); - Removed

    const handleChange = (e) => {
        onUpdate({ ...data, [e.target.name]: e.target.value });
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const { data: uploadData } = await imageService.upload(file);
                onUpdate({ ...data, image: uploadData.url });
            } catch (error) {
                alert('Image upload failed');
            }
        }
    };

    const fields = [
        { name: 'fullName', label: 'Full Name', icon: User, placeholder: 'Your Name' },
        { name: 'email', label: 'Email Address', icon: Mail, placeholder: 'email@example.com', type: 'email' },
        { name: 'phone', label: 'Phone Number', icon: Phone, placeholder: '+1 234 567 8900' },
        { name: 'location', label: 'Location', icon: MapPin, placeholder: 'New York, USA' },
        { name: 'profession', label: 'Profession', icon: Briefcase, placeholder: 'Software Engineer' },
        { name: 'linkedin', label: 'LinkedIn URL', icon: Linkedin, placeholder: 'linkedin.com/in/johndoe' },
        { name: 'website', label: 'Personal Website', icon: Globe, placeholder: 'johndoe.com' },
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Image Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-100">
                <div className="relative group">
                    <div className="size-20 sm:size-24 rounded-2xl bg-white border-2 border-gray-100 overflow-hidden flex items-center justify-center shadow-sm">
                        {data.image ? (
                            <img src={data.image} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <User className="size-10 text-gray-300" />
                        )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-xl shadow-lg cursor-pointer hover:bg-primary-700 transition-all border-2 border-white">
                        <Camera className="size-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                </div>
                <div className="text-center sm:text-left">
                    <h3 className="font-bold text-gray-900">Profile Image</h3>
                    <p className="text-sm text-gray-500 mt-1">Upload a professional photo. Max size 2MB.</p>
                </div>
            </div>

            {/* Basic Info Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                            <field.icon className="size-4 text-primary-600" />
                            {field.label}
                        </label>
                        <input
                            type={field.type || 'text'}
                            name={field.name}
                            value={data[field.name] || ''}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            className="block w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PersonalInfoForm;
