'use server';

import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';

// Initialize OpenAI
const openai = new OpenAI();

export const transcription = async (formData: FormData) => {
    const file = formData.get('file') as File;

    if (!file || !file.name) {
        throw new Error('Invalid file');
    }

    // Define the file path
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadsDir, file.name);

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Convert Blob to Buffer and save to file
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
        // Write the file to disk
        fs.writeFileSync(filePath, buffer);

        // Read the file stream for transcription
        const fileStream = fs.createReadStream(filePath);

        // Perform transcription
        const transcriptionResult = await openai.audio.transcriptions.create({
            file: fileStream,
            model: 'whisper-1',
        });

        console.log(transcriptionResult.text);

        // Clean up the uploaded file
        fs.unlinkSync(filePath);

        return transcriptionResult.text;
    } catch (error) {
        console.error('Error during transcription:', error);
        throw error;
    }
};
