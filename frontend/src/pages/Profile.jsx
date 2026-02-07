import React, { useState, useEffect } from 'react';
import { User, Mail, Save, Camera } from 'lucide-react';
import { imageService } from '../services/api';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Profile = () => {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        image: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { success: showSuccess, error: showError } = useToast();

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            setUserData(prev => ({
                ...prev,
                name: parsed.name,
                email: parsed.email,
                image: parsed.image || ''
            }));
        }
    }, []);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const { data } = await imageService.upload(file);
            setUserData(prev => ({ ...prev, image: data.url }));
        } catch (error) {
            console.error(error);
            showError('Failed to upload image');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);
        try {
            const { data } = await api.put('/users/profile', {
                name: userData.name,
                email: userData.email,
                image: userData.image
            });

            // Update local storage
            localStorage.setItem('userInfo', JSON.stringify(data));
            setIsEditing(false);
            showSuccess('Profile updated successfully!');
        } catch (error) {
            console.error(error);
            showError('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Profile Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your account settings and preferences.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-600 transition-all shadow-lg hover:shadow-primary-200"
                    >
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div
                            onClick={() => isEditing && document.getElementById('profile-image-input').click()}
                            className={`w-32 h-32 rounded-3xl bg-primary-100 flex items-center justify-center text-4xl font-black text-primary-600 relative group shadow-inner overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
                        >
                            {userData.image ? (
                                <img src={userData.image} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                userData.name.charAt(0)
                            )}

                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="text-white size-8" />
                                </div>
                            )}
                            <input
                                type="file"
                                id="profile-image-input"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Profile Picture</p>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={userData.name}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 size-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-primary-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-200 disabled:opacity-70 flex items-center gap-2"
                                >
                                    {isLoading ? 'Saving...' : <><Save className="size-4" /> Save Changes</>}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
