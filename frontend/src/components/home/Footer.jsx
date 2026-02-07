import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
                <div className="col-span-2 space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold">R</div>
                        <span className="text-lg font-bold text-gray-900 uppercase">Resume<span className="text-primary-600">AI</span></span>
                    </div>
                    <p className="text-gray-500 max-w-sm">
                        Empowering job seekers worldwide with AI-powered resume building technology. Land your next role faster.
                    </p>

                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Product</h4>
                    <ul className="space-y-4 text-gray-500 text-sm font-medium">
                        <li><Link to="/app/templates" className="hover:text-primary-600 transition-colors">Resume Templates</Link></li>
                        <li><Link to="/app/career-lab" className="hover:text-primary-600 transition-colors">AI Content Enhancer</Link></li>
                        <li><Link to="/app/career-lab" className="hover:text-primary-600 transition-colors">PDF Parsing</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-wider text-xs">Company</h4>
                    <ul className="space-y-4 text-gray-500 text-sm font-medium">
                        <li><Link to="/about-us" className="hover:text-primary-600 transition-colors">About Us</Link></li>
                        <li><a href="/#features" className="hover:text-primary-600 transition-colors">Features</a></li>
                        <li><Link to="/privacy-policy" className="hover:text-primary-600 transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t text-center text-gray-400 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <p>&copy; 2026 ResumeAI Builder. All rights reserved.</p>
                <p className="flex items-center gap-1">Made by Elan</p>
            </div>
        </footer>
    );
};

export default Footer;
