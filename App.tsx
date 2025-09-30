
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Loader } from './components/Loader';
import { MediaDisplay } from './components/MediaDisplay';
import { transformImage, transformVideo } from './services/geminiService';
import { fileToBase64, extractVideoFrame } from './utils/mediaUtils';
import { MediaType, TransformedMedia } from './types';

const App: React.FC = () => {
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [originalFileUrl, setOriginalFileUrl] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('Make this cinematic and add a dramatic flair.');
    const [transformedMedia, setTransformedMedia] = useState<TransformedMedia | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [useFrameAsReference, setUseFrameAsReference] = useState<boolean>(true);
    const [videoQuality, setVideoQuality] = useState<string>('720p');

    useEffect(() => {
        if (!originalFile) {
            setOriginalFileUrl('');
            return;
        }
        const url = URL.createObjectURL(originalFile);
        setOriginalFileUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [originalFile]);

    const handleFileSelect = (file: File) => {
        resetState();
        setOriginalFile(file);
    };

    const resetState = () => {
        setOriginalFile(null);
        setOriginalFileUrl('');
        setTransformedMedia(null);
        setError('');
        setIsLoading(false);
        setLoadingMessage('');
        setUseFrameAsReference(true);
        setVideoQuality('720p');
    };

    const handleTransform = useCallback(async () => {
        if (!originalFile || !prompt) {
            setError('Please select a file and enter a prompt.');
            return;
        }

        setIsLoading(true);
        setError('');
        setTransformedMedia(null);

        try {
            const fileType = originalFile.type.split('/')[0];

            if (fileType === 'image') {
                setLoadingMessage('Transforming your image with AI...');
                const base64Image = await fileToBase64(originalFile);
                const resultBase64 = await transformImage(base64Image, originalFile.type, prompt);
                setTransformedMedia({ url: resultBase64, type: MediaType.IMAGE });
            } else if (fileType === 'video') {
                setLoadingMessage('Preparing for video generation...');
                let base64Frame: string | undefined = undefined;
                let frameMimeType: string | undefined = undefined;

                if (useFrameAsReference) {
                    setLoadingMessage('Extracting a frame from your video for reference...');
                    const frameData = await extractVideoFrame(originalFile);
                    base64Frame = frameData.base64Frame;
                    frameMimeType = frameData.frameMimeType;
                }
                
                const messages = [
                    'Your creation is in the queue...',
                    'The AI is working its magic...',
                    'Rendering final frames...',
                    'This can take a few minutes, please stay on this page.'
                ];
                let messageIndex = 0;
                setLoadingMessage(messages[messageIndex]);
                const messageInterval = setInterval(() => {
                    messageIndex = (messageIndex + 1) % messages.length;
                    setLoadingMessage(messages[messageIndex]);
                }, 15000);

                const resultUrl = await transformVideo(prompt, videoQuality, base64Frame, frameMimeType);
                clearInterval(messageInterval);
                setTransformedMedia({ url: resultUrl, type: MediaType.VIDEO });

            } else {
                throw new Error('Unsupported file type. Please upload an image or video.');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    }, [originalFile, prompt, useFrameAsReference, videoQuality]);

    const getOriginalMediaType = (): MediaType => {
        if (!originalFile) return MediaType.NONE;
        return originalFile.type.startsWith('image/') ? MediaType.IMAGE : MediaType.VIDEO;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            <Header />
            <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-6xl mx-auto">
                    {!originalFile ? (
                        <FileUpload onFileSelect={handleFileSelect} />
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
                                    <h2 className="text-2xl font-bold mb-4 text-cyan-400">Original</h2>
                                    <MediaDisplay url={originalFileUrl} type={getOriginalMediaType()} />
                                </div>
                                <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col justify-center items-center">
                                    {isLoading ? (
                                        <Loader message={loadingMessage} />
                                    ) : transformedMedia ? (
                                       <>
                                        <h2 className="text-2xl font-bold mb-4 text-purple-400">Transformed</h2>
                                        <MediaDisplay url={transformedMedia.url} type={transformedMedia.type} isTransformed={true}/>
                                       </>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                            <p className="mt-4 text-lg">Your transformed media will appear here.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 space-y-4">
                                <label htmlFor="prompt" className="block text-xl font-semibold text-gray-300">Transformation Prompt</label>
                                <textarea
                                    id="prompt"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., Make it look like a watercolor painting"
                                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200 resize-none"
                                    rows={3}
                                    disabled={isLoading}
                                />
                                { getOriginalMediaType() === MediaType.VIDEO && (
                                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                                        <div className="flex items-center space-x-2 text-gray-300">
                                            <input
                                                type="checkbox"
                                                id="useFrame"
                                                checked={useFrameAsReference}
                                                onChange={(e) => setUseFrameAsReference(e.target.checked)}
                                                className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-cyan-500 focus:ring-cyan-600"
                                                disabled={isLoading}
                                            />
                                            <label htmlFor="useFrame" className="cursor-pointer">Use frame as style reference</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="quality" className="text-gray-300 font-medium">Quality:</label>
                                            <select
                                                id="quality"
                                                value={videoQuality}
                                                onChange={(e) => setVideoQuality(e.target.value)}
                                                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-200"
                                                disabled={isLoading}
                                            >
                                                <option value="480p">480p (SD)</option>
                                                <option value="720p">720p (HD)</option>
                                                <option value="1080p">1080p (FHD)</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                                {error && <p className="text-red-400 text-sm">{error}</p>}
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleTransform}
                                        disabled={isLoading || !prompt}
                                        className="flex-1 px-6 py-3 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-cyan-500/20"
                                    >
                                        {isLoading ? 'Transforming...' : '✨ Transform'}
                                    </button>
                                     <button
                                        onClick={resetState}
                                        disabled={isLoading}
                                        className="flex-1 px-6 py-3 text-lg font-bold bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        Start Over
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default App;
