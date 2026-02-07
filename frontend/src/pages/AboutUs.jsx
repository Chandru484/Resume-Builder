import React from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';

const AboutUs = () => {
    return (
        <div className="font-outfit min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow py-20 px-4 md:px-0">
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight uppercase">
                            About <span className="text-primary-600">ResumeAI</span>
                        </h1>
                        <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                            We are on a mission to empower job seekers with cutting-edge AI technology to build professional resumes and land their dream jobs.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 pt-10">
                        <div className="bg-gray-50 p-8 rounded-[2rem] space-y-4 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-black text-gray-900 uppercase">Our Vision</h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                To make high-quality professional resume building accessible to everyone through the power of Artificial Intelligence, removing the barriers and stress of job applications.
                            </p>
                        </div>
                        <div className="bg-primary-50 p-8 rounded-[2rem] space-y-4 shadow-sm border border-primary-100">
                            <h2 className="text-2xl font-black text-gray-900 uppercase">What We Offer</h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                From AI-powered content enhancement to elite recruiter-approved templates, we provide a comprehensive suite of tools to ensure your resume stands out from the crowd.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6 pt-10 text-center">
                        <h2 className="text-3xl font-black text-gray-900 uppercase italic">The Innovation Behind</h2>
                        <p className="text-gray-500 font-medium leading-[1.8] max-w-3xl mx-auto">
                            ResumeAI combines advanced language models with human-centric design. Our platform analyzes thousands of successful resumes to give you an edge in the competitive job market.
                            We believe that every candidate has a story to tell, and our job is to help you tell it perfectly.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AboutUs;
