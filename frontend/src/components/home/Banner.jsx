import React from 'react';
import { Sparkles } from 'lucide-react';

const Banner = () => {
    return (
        <div className="bg-primary-600 text-white py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium">
            <Sparkles className="size-4" />
            <span>New AI feature added: Resume parsing from PDF is now available!</span>
        </div>
    );
};

export default Banner;
