import React from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTA = () => {
    return (
        <section id="cta" className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="bg-gray-900 rounded-[4rem] p-12 lg:p-24 text-center relative overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]">
                    {/* Background Grid */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-primary-600/20 rounded-full blur-[120px] -mr-32 -mt-32 transition-transform group-hover:scale-125 duration-1000" />
                    <div className="absolute bottom-0 left-0 w-[50%] h-full bg-purple-600/10 rounded-full blur-[100px] -ml-32 -mb-32 transition-transform group-hover:scale-125 duration-1000" />

                    <div className="relative z-10 space-y-12 animate-in slide-in-from-bottom-8 duration-1000">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] text-primary-400">
                            Launch Your Career
                        </div>

                        <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9] max-w-4xl mx-auto uppercase">
                            Stop Applying. <br />
                            <span className="text-primary-500">Start Landing.</span>
                        </h2>

                        <p className="text-gray-400 text-xl lg:text-2xl max-w-2xl mx-auto font-medium">
                            The AI revolution in hiring is here. Build a resume that outsmarts the algorithms and impresses the humans.
                        </p>

                        <div className="flex flex-col items-center gap-8">
                            <Link to="/app" className="group relative inline-flex items-center gap-3 bg-primary-600 text-white px-12 py-6 rounded-[2.5rem] text-xl font-black uppercase tracking-tight hover:bg-white hover:text-gray-900 transition-all shadow-[0_20px_50px_-15px_rgba(22,163,74,0.5)] active:scale-95">
                                Create My Elite Resume
                                <ChevronRight className="size-6 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <Check className="size-4 text-primary-600" /> No Card Required
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <Check className="size-4 text-primary-600" /> Free Templates
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <Check className="size-4 text-primary-600" /> AI Suggestions
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTA;
