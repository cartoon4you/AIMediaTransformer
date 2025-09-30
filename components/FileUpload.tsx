
import React, { useState, useCallback } from 'react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onFileSelect(event.target.files[0]);
        }
    };

    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [onFileSelect]);

    return (
        <div 
            className={`w-full max-w-3xl mx-auto border-4 border-dashed rounded-3xl p-8 md:p-16 text-center transition-all duration-300 ${isDragging ? 'border-cyan-500 bg-gray-800/50' : 'border-gray-700 hover:border-gray-600'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center space-y-4">
                <UploadIcon />
                <p className="text-xl text-gray-300">
                    <label htmlFor="file-upload" className="font-semibold text-cyan-400 cursor-pointer hover:underline">
                        Click to upload
                    </label>
                    {' '}or drag and drop
                </p>
                <p className="text-gray-500">Image or Video (MP4, WEBM, etc.)</p>
            </div>
            <input
                id="file-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/*,video/*"
                onChange={handleFileChange}
            />
        </div>
    );
};
