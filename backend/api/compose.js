import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const API_TOKEN = process.env.BEATOVEN_TOKEN;
const URL = "https://public-api.beatoven.ai/api/v1";
const __filename = fileURLToPath(import.meta.url); // Convert import.meta.url to file path
const __dirname = path.dirname(__filename);
const trackPath = path.join(__dirname, "../../assets/compositions");

async function createTrack(requestData) {
    try {
        const response = await axios.post(`${URL}/tracks`, requestData, {
            headers: { Authorization: `Bearer ${API_TOKEN}`, "Content-Type": "application/json" },
        });

        // console.log("Track created successfully:", response.data.tracks);
        return response.data; //returns a list[]
    } catch (error) {
        console.log(error);
    }
}

async function composeTrack(requestData, trackId) {
    try {
        const response = await axios.post(`${URL}/tracks/compose/${trackId}`, requestData, {
            headers: { Authorization: `Bearer ${API_TOKEN}`, "Content-Type": "application/json" },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(JSON.stringify({ error: "Unexpected response status" }));
        }
    } catch (error) {
        console.log(error);
    }
}

async function getTrackStatus(task_id) {
    try {
        const response = await axios.get(`${URL}/tasks/${task_id}`, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            // console.log(response.data);
            return response.data;
        } else {
            throw new Error(JSON.stringify({ error: "Composition failed" }));
        }
    } catch (error) {
        console.log(error);
    }
}

async function handleTrackFile(trackPath, trackUrl) {
    try {
        const response = await axios.get(trackUrl, { responseType: 'arraybuffer' });
        if (response.status === 200) {
            await fs.promises.writeFile(trackPath, response.data); // Use fs.promises
            return {};
        } else {
            throw new Error(JSON.stringify({ error: `Failed to download file. Server responded with: ${response.status}` }));
        }
    } catch (error) {
        console.error(error); // Log with console.error
        throw error; // Re-throw the error!
    }
}



async function watchTaskStatus(task_id, interval = 10000) { //interval in milliseconds
    while (true) {
        const trackStatus = await getTrackStatus(task_id);

        if (trackStatus.status === "composing") {
            await new Promise((resolve) => setTimeout(resolve, interval));
        } else if (trackStatus.status === "failed") {
            throw new Error(JSON.stringify({ error: "task failed" }));
        } else if (trackStatus.status === "composed") {
            return trackStatus;
        } else {
            return trackStatus;
        }
    }
}


// Example usage:
export default async function createAndCompose(trackMeta) {
    // duration = duration ?? 30000;
    // genre = genre ?? "indian classical music";
    // mood = mood ?? "spiritual";
    // tempo = tempo ?? "80 BPM";

    // const trackMeta = {
    //     prompt: { text: prompt },
    //     duration: duration,
    //     genre: genre,
    //     mood: mood,
    //     tempo: tempo,
    // };

    try {
        const trackObj = await createTrack(trackMeta);

        // Check if trackObj and tracks array exist and have elements
        if (!trackObj || !trackObj.tracks || trackObj.tracks.length === 0) {
            throw new Error("Failed to create track: Invalid response from createTrack");
        }

        const trackId = trackObj.tracks[0];
        // console.log(`Created track with ID: ${trackId}`);

        const composeRes = await composeTrack(trackMeta, trackId);

        // Check if composeRes and task_id exist
        if (!composeRes || !composeRes.task_id) {
            throw new Error("Failed to compose track: Invalid response from composeTrack");
        }
        const taskId = composeRes.task_id;
        // console.log(`Started composition task with ID: ${taskId}`);

        const generationMeta = await watchTaskStatus(taskId);
        // console.log(generationMeta);

        // Check if generationMeta, meta, and track_url exist
        if (!generationMeta || !generationMeta.meta || !generationMeta.meta.track_url) {
            throw new Error("Failed to get track URL: Invalid response from watchTaskStatus");
        }

        const trackUrl = generationMeta.meta.track_url;
        return trackUrl;
        // console.log("Downloading track file");

        // Uncomment this to download the track
        const composedTrackPath = path.join(trackPath, "composed_track.mp3");
        await handleTrackFile(composedTrackPath, trackUrl);
        // console.log("Composed! you can find your track as `composed_track.mp3`");

    } catch (error) {
        console.error("An error occurred:", error.message);
        console.error(error);
    }
}

// const demoMeta = {
//     prompt: { text: "Indian classical music, a beautiful and soothing melody" },
//     duration: 30000,
//     genre: "indian classical music",
//     mood: "spiritual",
//     tempo: "80 BPM",
// }

// const url = await createAndCompose(demoMeta);
// console.log(url);