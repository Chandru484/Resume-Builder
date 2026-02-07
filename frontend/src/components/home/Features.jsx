import React from 'react';
import { Pencil, Zap, MousePointer2, Share2 } from 'lucide-react';

const Features = () => {
    const features = [
        {
            step: "01",
            title: "AI Smart Import",
            description: "Upload your current resume and our AI extracts your career history in seconds.",
            icon: <Zap className="size-7" />,
            color: "from-amber-400 to-orange-600",
            bg: "bg-amber-50"
        },
        {
            step: "02",
            title: "Elite Templates",
            description: "Choose from recruiter-approved templates designed for high-impact readability.",
            icon: <Pencil className="size-7" />,
            color: "from-primary-400 to-primary-600",
            bg: "bg-primary-50"
        },
        {
            step: "03",
            title: "AI Optimization",
            description: "Let AI rewrite your bullet points to match job descriptions and pass ATS filters.",
            icon: <MousePointer2 className="size-7" />,
            color: "from-blue-400 to-indigo-600",
            bg: "bg-blue-50"
        },
        {
            step: "04",
            title: "Ready to Land",
            description: "Download your PDF or share a live link to impress recruiters instantly.",
            icon: <Share2 className="size-7" />,
            color: "from-purple-400 to-fuchsia-600",
            bg: "bg-purple-50"
        }
    ];

    return (
        <section id="features" className="py-32 bg-white relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-24 max-w-3xl mx-auto space-y-4">
                    <h2 className="text-sm font-black text-primary-600 tracking-[0.3em] uppercase">The Elite Process</h2>
                    <p className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1] uppercase">
                        Four Steps to <br />
                        <span className="text-primary-600">Your Dream Job.</span>
                    </p>
                    <p className="text-lg text-gray-500 font-medium">
                        Our world-class AI removes the friction from resume building, so you can focus on nailing the interview.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {/* Connection Lines (Desktop) */}
                    <div className="hidden lg:block absolute top-[4.5rem] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-gray-100 to-transparent -z-10" />

                    {features.map((feature, index) => (
                        <div key={index} className="group relative bg-white p-10 rounded-[2.5rem] border border-gray-100 hover:border-primary-100 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2">
                            <div className="absolute top-6 right-8 text-4xl font-black text-gray-100 group-hover:text-primary-50 transition-colors uppercase italic">{feature.step}</div>

                            <div className={`p-4 rounded-2xl w-fit mb-8 shadow-lg bg-gradient-to-br ${feature.color} text-white transform group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tight group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-medium text-sm">
                                {feature.description}
                            </p>

                            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Powered by AI</span>
                                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full group-hover:scale-[3] transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
