'use client';

import { uploadAudio } from '@/lib/cloudinaryUpload';
import { transcription } from '@/lib/transcribe';
import { useState, useRef } from 'react';

const SpeechToTextPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const [transcriptionText, setTranscriptionText] = useState('')

    const startRecording = () => {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            mediaStreamRef.current = stream; // Store the media stream

            mediaRecorder.start();

            const audioChunks: Blob[] = [];
            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                setAudioBlob(audioBlob);
            });

            setIsRecording(true);
        });
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);

        // Stop all tracks of the media stream
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (audioBlob) {
            // Create a file from the blob
            const file = new File([audioBlob], 'recorded-audio.wav', { type: 'audio/wav' });
            console.log('Created File:', file);

            // Create a FormData object and append the file
            const formData = new FormData();
            formData.append('file', file);

            try {
                const transcriptionResult = await uploadAudio(formData);
                setTranscriptionText(transcriptionResult);
                console.log(transcriptionResult);
            } catch (error) {
                console.error('Error during transcription:', error);
                setTranscriptionText('Error processing file');
            }
        } else {
            console.error('No audio blob available for transcription.');
        }
    };

    return (
        <div className='w-[90%] mx-auto mt-10'>
            <h1 className="text-orange-500 font-extrabold text-4xl mb-10 text-center">Record Audio for Transcription</h1>
            <div className="border border-gray-300 rounded-md p-10 flex flex-col text-start gap-5 bg-gray-50">
                {isRecording ? (
                    <button
                        onClick={stopRecording}
                        className="shadow-lg border border-gray-300 py-2 px-4 rounded-md bg-red-500 hover:bg-red-700 hover:shadow-lg transition-all text-white"
                    >
                        Stop Recording
                    </button>
                ) : (
                    <button
                        onClick={startRecording}
                        className="shadow-lg border border-gray-300 py-2 px-4 rounded-md bg-green-500 hover:bg-green-700 hover:shadow-lg transition-all text-white"
                    >
                        Start Recording
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    className="shadow-lg border border-gray-300 py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-300 hover:shadow-lg transition-all"
                >
                    Upload and Transcribe
                </button>
            </div>
            {transcriptionText && (
                <div className='mt-10 max-w-3xl mx-auto border-2 border-red-500'>
                    {transcriptionText}
                </div>
            )}
        </div>
    );
};

export default SpeechToTextPage;


// 'use client';

// import { transcription } from '@/lib/transcribe';
// import { useState, useRef } from 'react';

// const SpeechToTextPage = () => {
//     const [isRecording, setIsRecording] = useState(false);
//     const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
//     const mediaRecorderRef = useRef<MediaRecorder | null>(null);
//     const mediaStreamRef = useRef<MediaStream | null>(null);
//     const [transcriptionText, setTranscriptionText] = useState('')

//     const startRecording = () => {
//         navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
//             const mediaRecorder = new MediaRecorder(stream);
//             mediaRecorderRef.current = mediaRecorder;
//             mediaStreamRef.current = stream; // Store the media stream

//             mediaRecorder.start();

//             const audioChunks: Blob[] = [];
//             mediaRecorder.addEventListener('dataavailable', event => {
//                 audioChunks.push(event.data);
//             });

//             mediaRecorder.addEventListener('stop', () => {
//                 const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
//                 setAudioBlob(audioBlob);
//             });

//             setIsRecording(true);
//         });
//     };

//     const stopRecording = () => {
//         mediaRecorderRef.current?.stop();
//         setIsRecording(false);

//         // Stop all tracks of the media stream
//         mediaStreamRef.current?.getTracks().forEach(track => track.stop());
//     };

//     const handleSubmit = async (event: React.FormEvent) => {
//         event.preventDefault();

//         if (audioBlob) {
//             // Create a file from the blob
//             const file = new File([audioBlob], 'recorded-audio.wav', { type: 'audio/wav' });
//             console.log('Created File:', file);

//             // Create a FormData object and append the file
//             const formData = new FormData();
//             formData.append('file', file);

//             // Call server action directly
//             const transcriptionResult = await transcription(formData);

//             setTranscriptionText(transcriptionResult)

//             console.log(transcriptionResult);
//         } else {
//             console.error('No audio blob available for transcription.');
//         }
//     };

//     return (
//         <div className='w-[90%] mx-auto mt-10'>
//             <h1 className="text-orange-500 font-extrabold text-4xl mb-10 text-center">Record Audio for Transcription</h1>
//             <div className="border border-gray-300 rounded-md p-10 flex flex-col text-start gap-5 bg-gray-50">
//                 {isRecording ? (
//                     <button
//                         onClick={stopRecording}
//                         className="shadow-lg border border-gray-300 py-2 px-4 rounded-md bg-red-500 hover:bg-red-700 hover:shadow-lg transition-all text-white"
//                     >
//                         Stop Recording
//                     </button>
//                 ) : (
//                     <button
//                         onClick={startRecording}
//                         className="shadow-lg border border-gray-300 py-2 px-4 rounded-md bg-green-500 hover:bg-green-700 hover:shadow-lg transition-all text-white"
//                     >
//                         Start Recording
//                     </button>
//                 )}
//                 <button
//                     onClick={handleSubmit}
//                     className="shadow-lg border border-gray-300 py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-300 hover:shadow-lg transition-all"
//                 >
//                     Upload and Transcribe
//                 </button>
//             </div>
//             {transcriptionText && (
//                 <div className='mt-10 max-w-3xl mx-auto border-2 border-red-500'>
//                     {transcriptionText}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default SpeechToTextPage;