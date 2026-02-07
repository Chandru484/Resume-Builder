import React, { useState } from 'react';
import { Settings, Lock, Trash2, AlertTriangle, Shield, CreditCard, Bell } from 'lucide-react';
import { updatePassword, deleteUser } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const Account = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { success: showSuccess, error: showError } = useToast();
    
    // Password States
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // UI States
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // 1. Handle Password Update
    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            showError("New passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            showError("Password should be at least 6 characters");
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        setIsLoading(true);

        try {
            await updatePassword(user, newPassword);
            showSuccess('Password updated successfully');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                showError('Please log out and log in again to change password');
            } else {
                showError('Failed to update password: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Handle Account Deletion
    const handleDeleteAccount = async () => {
        setIsLoading(true);
        const user = auth.currentUser;
        
        try {
            // In a real app, you might want to call backend to delete user data from DB first
            // await api.delete('/users/me'); 
            
            await deleteUser(user);
            showSuccess('Account deleted successfully');
            navigate('/');
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                 showError('Please log out and log in again to delete account');
            } else {
                showError('Failed to delete account: ' + error.message);
            }
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">Account Settings</h1>
                    <p className="text-gray-500 mt-2">Manage your security, subscription, and account preferences.</p>
                </div>
            </div>

            {/* Subscription Section */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                        <CreditCard className="size-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Subscription Plan</h2>
                        <p className="text-sm text-gray-500">Manage your billing and plan details</p>
                    </div>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 bg-primary-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg">Pro Plan</div>
                        <span className="text-gray-600 font-medium">Billed Monthly</span>
                    </div>
                    <button className="text-primary-600 font-bold hover:text-primary-700 hover:underline">
                        Manage Subscription
                    </button>
                </div>
            </div>

            {/* Security Section */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-700">
                        <Shield className="size-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Security</h2>
                        <p className="text-sm text-gray-500">Update your password and security settings</p>
                    </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all"
                                placeholder="Enter new password"
                                minLength={6}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all"
                                placeholder="Confirm new password"
                                minLength={6}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !newPassword || !confirmPassword}
                        className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            {/* Notification Section (Placeholder) */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Bell className="size-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                        <p className="text-sm text-gray-500">Manage your email preferences</p>
                    </div>
                </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <span className="font-medium text-gray-700">Marketing Emails</span>
                        <div className="w-11 h-6 bg-gray-200 rounded-full cursor-not-allowed relative">
                            <div className="w-4 h-4 bg-white rounded-full absolute left-1 top-1"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="font-medium text-gray-700">Security Alerts</span>
                        <div className="w-11 h-6 bg-primary-600 rounded-full cursor-not-allowed relative">
                             <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-100 bg-red-50/30 rounded-[2rem] p-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                        <AlertTriangle className="size-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Danger Zone</h2>
                        <p className="text-sm text-gray-500">Irreversible account actions</p>
                    </div>
                </div>

                {!showDeleteConfirm ? (
                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 text-red-600 font-bold hover:bg-red-50 px-4 py-2 rounded-xl border border-red-200 bg-white transition-all shadow-sm"
                    >
                        <Trash2 className="size-4" />
                        Delete Account
                    </button>
                ) : (
                    <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm animate-in fade-in zoom-in-95">
                        <h3 className="font-bold text-gray-900 mb-2">Are you absolutely sure?</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            This action cannot be undone. This will permanently delete your account and remove your access to all your resumes.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
                            >
                                {isLoading ? 'Deleting...' : 'Yes, Delete Account'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Account;
