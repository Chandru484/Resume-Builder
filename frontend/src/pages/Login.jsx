import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Star, CheckCircle2, Sparkles, Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, register, googleLogin, user, loading } = useAuth();
    const { error: showError, success: showSuccess } = useToast();
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const state = searchParams.get('state');
        if (state === 'register') {
            setIsLogin(false);
        } else {
            setIsLogin(true);
        }
    }, [searchParams]);

    // Redirect to dashboard when user is authenticated and profile is loaded
    useEffect(() => {
        if (!loading && user) {
            navigate('/app');
        }
    }, [user, loading, navigate]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await googleLogin();
            showSuccess('Successfully signed in with Google!');
            // Navigation will happen automatically via useEffect when user is set
        } catch (error) {
            console.error('Google Sign-in Error:', error);
            let errorMessage = 'Google sign-in failed';

            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Sign-in cancelled';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Popup blocked. Please allow popups for this site.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            showError(errorMessage);
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                showSuccess('Successfully logged in!');
            } else {
                await register(formData.name, formData.email, formData.password);
                showSuccess('Account created successfully!');
            }
            // Navigation will happen automatically via useEffect when user is set
        } catch (error) {
            console.error('Auth Error:', error);
            let errorMessage = 'Authentication failed';

            // Firebase error codes
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email already in use';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password should be at least 6 characters';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            } else if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Invalid email or password';
            } else if (error.message) {
                errorMessage = error.message;
            }

            showError(errorMessage);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-outfit flex">
            {/* Left Side - Visual (Premium Dark Theme) */}
            <div className="hidden lg:flex lg:w-[45%] bg-[#0f172a] relative overflow-hidden flex-col justify-center items-center p-20 text-white text-center">
                {/* Background Gradients */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-900/50 group-hover:scale-110 transition-all duration-300">R</div>
                        <span className="text-xl font-bold tracking-tight uppercase text-white/90">Resume<span className="text-primary-500">AI</span></span>
                    </Link>

                    <div className="mt-16 space-y-8 flex flex-col items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -2 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full animate-pulse group-hover:bg-primary-500/30 transition-colors" />
                            <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-black text-primary-300 uppercase tracking-[0.2em] backdrop-blur-md shadow-2xl">
                                <Sparkles className="size-3" />
                                <span>V2.0 Now Live</span>
                            </div>
                        </motion.div>
                        <h1 className="text-6xl font-black leading-[1.1] tracking-tight">
                            Craft your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-orange-200 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">future</span> today.
                        </h1>
                        <p className="text-lg text-gray-400 max-w-sm leading-relaxed">
                            Join the elite community of professionals who have accelerated their careers with our AI-powered resume intelligence.
                        </p>
                    </div>
                </div>

                <div className="relative z-10 pt-12">
                    <div className="flex items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <motion.span
                            whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.15)' }}
                            className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl transition-all cursor-default"
                        >
                            <CheckCircle2 className="size-4 text-primary-400" /> AI Parsed
                        </motion.span>
                        <motion.span
                            whileHover={{ y: -3, backgroundColor: 'rgba(255,255,255,0.15)' }}
                            className="flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-xl shadow-2xl transition-all cursor-default"
                        >
                            <CheckCircle2 className="size-4 text-primary-400" /> ATS Friendly
                        </motion.span>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-white">
                <div className="w-full max-w-[420px] space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center lg:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="text-gray-500">
                            {isLogin ? 'Enter your credentials to access your workspace.' : 'Start building your professional profile for free.'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-all font-bold text-sm text-gray-700 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="size-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            {isLogin ? "Sign in with Google" : "Sign up with Google"}
                        </button>
                    </div>

                    <div className="relative flex items-center gap-4">
                        <div className="h-px bg-gray-100 flex-1" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Or with email</span>
                        <div className="h-px bg-gray-100 flex-1" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 size-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                    <input
                                        type="text"
                                        name="name"
                                        required={!isLogin}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-600 outline-none transition-all font-medium"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-700 ml-1 uppercase tracking-wider">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 size-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-600 outline-none transition-all font-medium"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</label>
                                {isLogin && <a href="#" className="text-xs font-bold text-primary-600 hover:text-primary-700">Forgot?</a>}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 size-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-600 outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-600/20 active:scale-[0.98] transition-all disabled:opacity-70"
                        >
                            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                            {!isLoading && <ArrowRight className="size-5" />}
                        </button>
                    </form>

                    <p className="text-center text-sm font-medium text-gray-500">
                        {isLogin ? "New to ResumeAI?" : "Already member?"}{' '}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-primary-600 font-bold hover:underline transition-all"
                        >
                            {isLogin ? 'Create an account' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
