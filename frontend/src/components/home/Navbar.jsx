import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogoClick = (e) => {
        e.preventDefault();
        if (user) {
            navigate('/app');
        } else {
            navigate('/');
        }
    };

    return (
        <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm' : 'bg-white/50 backdrop-blur-sm py-4 border-b border-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

                {/* Logo */}
                <a href="#" onClick={handleLogoClick} className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">R</div>
                    <span className={`text-xl font-bold tracking-tight uppercase ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>Resume<span className="text-primary-600">AI</span></span>
                </a>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors px-4 py-2">Log In</Link>
                    <Link to="/login?state=register" className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 ring-4 ring-gray-100/50 hover:ring-gray-100">
                        Get Started <ArrowRight className="size-4" />
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-gray-600"
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="p-4 space-y-4 flex flex-col items-center">
                            <Link to="/login" className="text-sm font-bold text-gray-600 w-full text-center py-2" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                            <Link to="/login?state=register" className="w-full px-5 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm text-center" onClick={() => setMobileMenuOpen(false)}>
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
