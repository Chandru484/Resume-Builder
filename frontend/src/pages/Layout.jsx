import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout as LayoutIcon, LogOut, Plus, FileText, User, Settings, Search, Menu, X, Sparkles, Zap, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Layout = () => {
    const { success } = useToast();
    const navigate = useNavigate();
    const { user, logout } = useAuth(); // Use auth context

    React.useEffect(() => {
        document.title = 'Dashboard | ResumeAI';
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const [user] = useState({ name: 'Chandru S', email: 'chandru@example.com' }); // Removed hardcoded user

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleFeatureClick = (feature) => {
        success(`${feature} - This premium feature is coming soon in the next update!`);
    };

    const isBuilderRoute = location.pathname.includes('/app/builder/');

    return (
        <div className="min-h-screen bg-primary-50 font-outfit">
            {/* Header - Hide on Builder Route to save vertical space */}
            {!isBuilderRoute && (
                <header className="bg-white border-b border-gray-100 sticky top-0 z-[100]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                        <div className="flex items-center gap-12">
                            <Link to="/app" className="flex items-center gap-2 group">
                                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary-200 group-hover:scale-110 transition-transform">R</div>
                                <span className="text-xl font-bold text-gray-900 uppercase tracking-tight">Resume<span className="text-primary-600">AI</span></span>
                            </Link>

                            <nav className="hidden md:flex items-center gap-1">
                                <NavLink to="/app" end className={({ isActive }) => `px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>My Resumes</NavLink>
                                <NavLink to="/app/templates" className={({ isActive }) => `px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>Templates</NavLink>
                                <NavLink to="/app/career-lab" className={({ isActive }) => `px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>Resume Scorer</NavLink>
                                <NavLink to="/app/cover-letter" className={({ isActive }) => `px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>Cover Letter</NavLink>
                            </nav>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl md:hidden transition-all"
                            >
                                {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                            </button>
                            <div className="hidden lg:flex items-center relative group mr-4">
                                <Search className="absolute left-3.5 size-4 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search your resumes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-2.5 text-sm w-64 focus:bg-white focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>


                            <div className="group relative">
                                <button className="flex items-center gap-3 p-1.5 pr-3 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                    <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold shadow-md shadow-primary-100">
                                        {user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <div className="text-left hidden sm:block">
                                        <p className="text-xs font-bold text-gray-900 leading-none">{user?.name || 'User'}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 leading-none">Pro Plan</p>
                                    </div>
                                </button>

                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-[1.5rem] shadow-2xl p-2 opacity-0 -translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-300 z-[100]">
                                    <Link to="/app/profile" className="flex items-center gap-3 p-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                                        <User className="size-4 text-gray-400" />
                                        Profile Settings
                                    </Link>
                                    <Link to="/app/account" className="flex w-full items-center gap-3 p-3 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                                        <Settings className="size-4 text-gray-400" />
                                        Account
                                    </Link>
                                    <div className="h-px bg-gray-50 my-1 mx-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 p-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                    >
                                        <LogOut className="size-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* Mobile Navigation Drawer */}
            <div className={`fixed inset-0 z-[90] md:hidden transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Drawer */}
                <div className={`absolute top-20 left-0 right-0 bg-white border-b border-gray-100 p-6 flex flex-col gap-2 transition-all duration-300 shadow-xl ${isMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
                    <NavLink
                        to="/app"
                        end
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 p-4 text-base font-bold rounded-2xl transition-all ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <FileText className="size-5" />
                        My Resumes
                    </NavLink>
                    <NavLink
                        to="/app/templates"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 p-4 text-base font-bold rounded-2xl transition-all ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <LayoutIcon className="size-5" />
                        Templates
                    </NavLink>
                    <NavLink
                        to="/app/career-lab"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 p-4 text-base font-bold rounded-2xl transition-all ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Zap className="size-5" />
                        Resume Scorer
                    </NavLink>
                    <NavLink
                        to="/app/cover-letter"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) => `flex items-center gap-3 p-4 text-base font-bold rounded-2xl transition-all ${isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Sparkles className="size-5" />
                        Cover Letter
                    </NavLink>

                    <div className="h-px bg-gray-100 my-2" />

                    <button
                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                        className="flex items-center gap-3 p-4 text-base font-bold text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                    >
                        <LogOut className="size-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className={`max-w-7xl mx-auto ${isBuilderRoute ? 'p-0' : 'px-4 sm:px-6 lg:px-8 py-6 lg:py-10'}`}>
                <Outlet context={{ searchTerm }} />
            </main>
        </div>
    );
};

export default Layout;
