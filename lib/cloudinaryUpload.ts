'use server'

import cloudinary from 'cloudinary';
import { OpenAI } from 'openai';

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define an interface for the Cloudinary upload result
interface CloudinaryUploadResult {
    url: string;
}

// Define the server action
export const uploadAudio = async (formData: FormData): Promise<string> => {
    try {
        const file = formData.get('file');

        if (!file || !(file instanceof Blob)) {
            throw new Error('No file found in the form data or invalid file type');
        }

        // Convert Blob to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
            cloudinary.v2.uploader.upload_stream(
                { resource_type: 'auto', folder: 'recordings' },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result as CloudinaryUploadResult);
                    }
                }
            ).end(buffer);
        });

        // Get the URL of the uploaded file
        const fileUrl = result.url;

        // Perform transcription
        const transcriptionResult = await transcription(fileUrl);

        return transcriptionResult

    } catch (error) {
        console.error('Error during upload:', error);
        return 'Error uploading file';
    }
};

// Initialize OpenAI
const openai = new OpenAI();


export const transcription = async (url: string): Promise<string> => {
    try {
        // Fetch the file from the URL
        const response = await fetch(url);
        const fileBlob = await response.blob();

        // Convert Blob to File object
        const file = new File([fileBlob], 'audio.wav', { type: fileBlob.type });

        // Perform transcription
        const transcriptionResult = await openai.audio.transcriptions.create({
            file: file,
            model: 'whisper-1',
            language: 'en'
        });

        return transcriptionResult.text;
    } catch (error) {
        console.error('Error during transcription:', error);
        throw error;
    }
};