import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import dotenv from 'dotenv';
import path from "path";
import os from "os";
import fs from "fs";

dotenv.config();

// const mediaPath = path.join(__dirname, "..", "..", "..", "public", "media", "sample.mp3") // this is for testing purposes, you can change it to any audio file path

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

export async function analyze(buffer) {
    try {
        // Create a temporary file with a unique name
        const tempDir = os.tmpdir();
        const tempFile = path.join(tempDir, `audio-${Date.now()}.mp3`);

        // Write buffer to temporary file
        fs.writeFileSync(tempFile, buffer);

        try {
            const uploadResult = await fileManager.uploadFile(
                `${tempFile}`,
                {
                    mimeType: `audio/mpeg`,
                    displayName: "Audio sample",
                },
            );

            let file = await fileManager.getFile(uploadResult.file.name);
            while (file.state === FileState.PROCESSING) {
                process.stdout.write(".");
                // Sleep for 10 seconds
                await new Promise((resolve) => setTimeout(resolve, 10_000));
                // Fetch the file from the API again
                file = await fileManager.getFile(uploadResult.file.name);
            }

            if (file.state === FileState.FAILED) {
                throw new Error("Audio processing failed.");
            }

            // View the response.
            console.log(
                `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
            );

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const schema = {
                description: "Music analysis result",
                type: SchemaType.OBJECT,
                properties: {
                    emotions: {
                        type: SchemaType.ARRAY,
                        description: "List of detected emotions",
                        items: {
                            type: SchemaType.STRING,
                        },
                        nullable: false,
                    },
                    key: {
                        type: SchemaType.STRING,
                        description: "Musical key of the song",
                        nullable: false,
                    },
                    tempo: {
                        type: SchemaType.NUMBER,
                        description: "Tempo of the song in BPM",
                        nullable: false,
                    },
                    raaga: {
                        type: SchemaType.STRING,
                        description: "Raaga of the song",
                        nullable: false,
                    },
                    taal: {
                        type: SchemaType.STRING,
                        description: "Taal of the song",
                        nullable: false,
                    }
                },
                required: ["emotions", "key", "tempo", "raaga", "taal"],
            };

            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash-preview-05-20",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });
            const result = await model.generateContent([
                "Analyze this music file.",
                {
                    fileData: {
                        fileUri: uploadResult.file.uri,
                        mimeType: uploadResult.file.mimeType,
                    },
                },
            ]);
            console.log(JSON.parse(result.response.text()));
            return JSON.parse(result.response.text()); //returns an object
        } finally {
            // Clean up the temporary file in all cases
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        }
    } catch (error) {
        console.error('Analysis error:', error);
        throw error;
    }
}