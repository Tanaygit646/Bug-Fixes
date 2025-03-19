import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GoogleAIFileManager, FileState } from "@google/generative-ai/server";
import dotenv from 'dotenv';
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url); // Convert import.meta.url to file path
const __dirname = path.dirname(__filename);
const mediaPath = path.join(__dirname, "../../assets/music")


const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

export default async function analyze(filePath) {
    const uploadResult = await fileManager.uploadFile(
        `${filePath}`,
        {
            mimeType: `audio/${filePath.slice(-3)}`,
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
        model: "gemini-1.5-pro-latest",
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
}
