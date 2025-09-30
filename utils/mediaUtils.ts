
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};

export const extractVideoFrame = (
    videoFile: File
): Promise<{ base64Frame: string; frameMimeType: string }> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(videoFile);
        video.muted = true;

        video.onloadeddata = () => {
            video.currentTime = 1; // Seek to 1 second to get a good frame
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameMimeType = 'image/jpeg';
            const base64Frame = canvas.toDataURL(frameMimeType, 0.9);
            URL.revokeObjectURL(video.src);
            video.remove();
            canvas.remove();
            resolve({ base64Frame, frameMimeType });
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(video.src);
            reject(new Error(`Error loading video: ${e}`));
        };

        // Start loading the video
        video.play().catch(e => {
            // some browsers block autoplay, but loading should still proceed for onloadeddata
        });
    });
};
