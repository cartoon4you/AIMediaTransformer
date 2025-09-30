
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="py-4 px-8 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
            <div className="max-w-6xl mx-auto">
                 <h1 className="text-3xl font-black tracking-tighter">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500">
                        AI Media Transformer
                    </span>
                </h1>
                <p className="text-gray-400 text-sm mt-1">Regenerate and enhance your images and videos.</p>
            </div>
        </header>
    );
};
