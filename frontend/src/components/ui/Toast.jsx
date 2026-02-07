import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X, Info } from 'lucide-react';

const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
};

const styles = {
    success: 'bg-white border-l-4 border-green-500 text-gray-800',
    error: 'bg-white border-l-4 border-red-500 text-gray-800',
    warning: 'bg-white border-l-4 border-yellow-500 text-gray-800',
    info: 'bg-white border-l-4 border-blue-500 text-gray-800'
};

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg shadow-gray-200/50 min-w-[300px] animate-in slide-in-from-top-2 duration-300 pointer-events-auto ${styles[type]}`}>
            <div className="shrink-0">
                {icons[type]}
            </div>
            <div className="flex-1 text-sm font-medium">
                {message}
            </div>
            <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
