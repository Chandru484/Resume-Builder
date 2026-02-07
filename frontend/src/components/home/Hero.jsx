import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Star, Shield, Zap } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';

const Hero = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <div ref={ref} className="relative min-h-[calc(100vh-80px)] flex items-center pt-32 pb-20 overflow-hidden bg-white perspective-1000">

            {/* Parallax Background Elements */}
            <motion.div
                style={{ y: backgroundY }}
                className="absolute inset-0 z-0 pointer-events-none will-change-transform"
            >
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/30 rounded-full blur-[80px] -mr-20 -mt-20 sm:w-[800px] sm:h-[800px] sm:blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-100/40 rounded-full blur-[60px] -ml-10 -mb-10 sm:w-[600px] sm:h-[600px] sm:blur-[100px]" />
            </motion.div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">

                {/* Left Content */}
                <motion.div
                    style={{ y: textY }}
                    className="space-y-8 will-change-transform"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-full px-4 py-1.5"
                    >
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </span>
                        <span className="text-sm font-bold text-gray-700 tracking-wide uppercase text-[10px]">v2.0 Now Live</span>
                    </motion.div>

                    <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1]">
                        Build your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-orange-500">Dream Career</span>
                    </h1>

                    <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
                        Create a professional, ATS-friendly resume in minutes with our AI-powered builder. Stand out from the crowd.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link to="/login" className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2">
                            Build My Resume <ArrowRight className="size-5" />
                        </Link>
                        <Link to="/app/templates" className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center gap-2">
                            View Templates
                        </Link>
                    </div>

                    <div className="flex items-center gap-8 pt-4">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                            ))}
                        </div>
                        <div className="text-sm font-bold text-gray-600">
                            Trusted by 10,000+ <br /> Professionals
                        </div>
                    </div>
                </motion.div>

                {/* Right 3D Visual */}
                <TiltCard />

            </div>
        </div>
    );
};

const TiltCard = () => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    function onMouseMove({ currentTarget, clientX, clientY }) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        x.set(clientX - left - width / 2);
        y.set(clientY - top - height / 2);
    }

    const rotateX = useTransform(mouseY, [-400, 400], [15, -15]);
    const rotateY = useTransform(mouseX, [-400, 400], [-15, 15]);

    return (
        <motion.div
            style={{ perspective: 2000 }}
            className="hidden lg:block h-[600px] w-full flex items-center justify-center relative cursor-grab active:cursor-grabbing"
            onMouseMove={onMouseMove}
            onMouseLeave={() => {
                x.set(0);
                y.set(0);
            }}
        >
            <motion.div
                style={{
                    rotateX: rotateX,
                    rotateY: rotateY,
                }}
                className="w-[450px] h-[600px] bg-white rounded-[2rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex flex-col overflow-hidden relative group will-change-transform"
            >
                {/* Simulated Resume Header */}
                <div className="bg-gray-900 text-white p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="h-4 w-32 bg-gray-700/50 rounded-full mb-3" />
                            <div className="h-8 w-48 bg-gray-600/50 rounded-lg" />
                        </div>
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-500 rounded-2xl shadow-lg shadow-primary-500/20" />
                    </div>
                </div>

                {/* Simulated Content */}
                <div className="p-8 space-y-6 flex-1 bg-white relative">
                    {/* Floating elements for 3D depth */}
                    <motion.div
                        style={{ translateZ: 60, x: useTransform(mouseX, [-400, 400], [-20, 20]) }}
                        className="absolute top-12 right-8 bg-green-100 text-green-700 px-4 py-2 rounded-xl font-bold text-xs shadow-lg flex items-center gap-2"
                    >
                        <CheckCircle2 className="size-4" /> ATS Score: 98
                    </motion.div>

                    <div className="space-y-3">
                        <div className="h-4 w-full bg-gray-100 rounded" />
                        <div className="h-4 w-5/6 bg-gray-100 rounded" />
                        <div className="h-4 w-4/6 bg-gray-100 rounded" />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-3">
                            <div className="h-32 bg-gray-50 rounded-xl border border-gray-100" />
                            <div className="h-32 bg-gray-50 rounded-xl border border-gray-100" />
                        </div>
                    </div>
                </div>

                {/* Floating Badge */}
                <motion.div
                    style={{ translateZ: 100, x: useTransform(mouseX, [-400, 400], [40, -40]), y: useTransform(mouseY, [-400, 400], [20, -20]) }}
                    className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20"
                >
                    <div className="bg-gradient-to-br from-primary-500 to-orange-500 w-12 h-12 rounded-xl flex items-center justify-center text-white">
                        <Sparkles className="size-6" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">AI Enhanced</p>
                        <p className="text-xs text-gray-500">Auto-optimization active</p>
                    </div>
                </motion.div>

            </motion.div>
        </motion.div>
    );
};

export default Hero;
