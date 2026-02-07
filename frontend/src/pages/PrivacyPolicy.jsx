import React from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';

const PrivacyPolicy = () => {
    return (
        <div className="font-outfit min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow py-20 px-4 md:px-0">
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight uppercase">
                            Privacy <span className="text-primary-600">Policy</span>
                        </h1>
                        <p className="text-lg text-gray-500 font-medium">
                            Your data privacy is our top priority. Learn how we protect your information.
                        </p>
                    </div>

                    <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-sm space-y-8">
                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-gray-900 uppercase">1. Information Collection</h2>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                We collect only the information necessary to provide you with the best resume building experience. This includes your contact details, education, and professional history that you choose to provide in your resumes.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-gray-900 uppercase">2. Use of AI Technology</h2>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                When you use our "AI Optimization" features, your content is processed through advanced AI models (such as Groq AI). This information is used only to generate improvements and is not used to train the models on your personal data without explicit consent.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-gray-900 uppercase">3. Data Protection</h2>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                We implement state-of-the-art security measures to protect your data from unauthorized access, alteration, or disclosure. Your resumes are stored securely and only accessible by you.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-2xl font-black text-gray-900 uppercase">4. User Rights</h2>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                You have the right to access, edit, or delete your data at any time through your dashboard. If you delete your account, all your personal information and resumes will be permanently removed from our servers.
                            </p>
                        </section>
                    </div>

                    <p className="text-center text-gray-400 text-sm italic font-medium">
                        Last Updated: January 14, 2026
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
