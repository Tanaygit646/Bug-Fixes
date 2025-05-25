import express, { Router } from 'express';
import serverless from "serverless-http";
import cors from 'cors';
import multer from 'multer';
import { analyze } from './routes/analysis.js';
import fetch from 'node-fetch';
import axios from 'axios';

const router = Router();
const app = express();

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files only
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    }
});

// API ROUTES
router.get('/ping', (req, res) => {
    res.json({
        status: 200,
        ok: true,
        message: 'Server is running'
    });
});

router.post('/analysis', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 400,
                ok: false,
                message: 'No audio file uploaded'
            });
        }

        console.log('Processing file:', {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        const analysisApiResponse = await analyze(req.file.buffer);

        return res.status(200).json({
            status: 200,
            ok: true,
            message: 'Analysis complete',
            result: analysisApiResponse
        });

    } catch (error) {
        console.error('Server error:', error);
        // Always return JSON, even for errors
        return res.status(500).json({
            status: 500,
            ok: false,
            message: 'Server error while processing upload',
            error: error.message
        });
    }
});

// POST /synthesis → returns track URL
router.post('/synthesis', express.json(), async (req, res) => {
    const trackMeta = req.body;
    if (!trackMeta) {
        return res.status(400).json({ status: "failed", ok: false });
    }

    return res.json({
        status: "received",
        ok: true,
        trackMeta: trackMeta,
        trackUrl: "/api/proxy-audio"
    });
});

// GET /proxy-audio → streams the file


router.get('/proxy-audio', async (req, res) => {
    try {
        const remoteUrl = "https://github.com/rafaelreis-hotmart/Audio-Sample-files/raw/master/sample.mp3";

        const response = await fetch(remoteUrl);
        if (!response.ok) {
            return res.status(500).json({ error: 'Failed to fetch audio' });
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Convert to base64
        const base64Audio = buffer.toString('base64');

        res.json({
            audio: base64Audio,
            mimeType: 'audio/mpeg',
            size: buffer.length
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch audio' });
    }
});


router.post('/test', (req, res) => {
    res.json({
        status: 200,
        ok: true,
        message: 'Audio file uploaded successfully',
        file: {
            filename: "Raghupati Raghav Raja Ram  Ustad Bismillah Khan Shehnai Magic  Indian Classical Instrumental Music - Saregama Hindustani Classical.mp3",
            mimetype: "audio/mpeg",
            size: 5497614,
            path: "path/to/file.mp3"
        },
        result: {
            emotions: ['Serene', 'Devotional', 'Melancholic', 'Meditative'],
            key: 'G Major',
            raaga: 'Bhairavi',
            taal: 'Teentaal',
            tempo: 65
        }
    })
})

app.use('/api/', router);
export const handler = serverless(app);
