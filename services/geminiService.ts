
import { GoogleGenAI, Modality } from '@google/genai';
import { fileToBase64 } from '../utils/mediaUtils';

if (!process.env.API_KEY) {
    // In a real app, you'd want to handle this more gracefully.
    // For this example, we'll throw an error if the key is missing.
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transformImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const model = 'gemini-2.5-flash-image-preview';
    const imagePart = {
        inlineData: {
            data: base64Image.split(',')[1],
            mimeType: mimeType,
        },
    };
    const textPart = { text: prompt };
    
    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    const imagePartResponse = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);

    if (imagePartResponse && imagePartResponse.inlineData) {
        const newMimeType = imagePartResponse.inlineData.mimeType;
        const newBase64Data = imagePartResponse.inlineData.data;
        return `data:${newMimeType};base64,${newBase64Data}`;
    }

    throw new Error('Image transformation failed or did not return an image.');
};

export const transformVideo = async (prompt: string, quality: string, base64Frame?: string, frameMimeType?: string): Promise<string> => {
    const model = 'veo-2.0-generate-001';

    const request: {
        model: string;
        prompt: string;
        image?: { imageBytes: string; mimeType: string };
        config: { 
            numberOfVideos: number;
            quality?: string;
        };
    } = {
        model,
        prompt,
        config: {
            numberOfVideos: 1,
            quality: quality,
        },
    };

    if (base64Frame && frameMimeType) {
        request.image = {
            imageBytes: base64Frame.split(',')[1],
            mimeType: frameMimeType,
        };
    }

    let operation = await ai.models.generateVideos(request);

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error('Video generation failed or did not return a video URI.');
    }
    
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error(`Failed to download generated video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};
