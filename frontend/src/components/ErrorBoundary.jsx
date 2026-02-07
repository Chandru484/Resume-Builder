import React from 'react';
import { useRouteError } from 'react-router-dom';

const ErrorBoundary = () => {
    const error = useRouteError();
    console.error(error);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong.</h1>
                <p className="text-gray-500 mb-6">Sorry, an unexpected error has occurred.</p>
                <div className="bg-gray-100 p-4 rounded-xl text-left text-xs font-mono text-red-600 overflow-auto max-h-40 mb-6">
                    {error.statusText || error.message}
                </div>
                <a href="/" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors">
                    Go back home
                </a>
            </div>
        </div>
    );
};

export default ErrorBoundary;
