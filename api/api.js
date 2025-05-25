import express, { Router } from 'express';
import serverless from "serverless-http";
import cors from 'cors';
import multer from 'multer';
import { analyze } from './routes/analysis.js';

const router = Router();
const app = express();

app.use(cors({
    origin: ['http://localhost:8888', 'https://sargamai.netlify.app'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

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

        // File successfully uploaded
        console.log('File uploaded:', {
            filename: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        try {
            const analysisApiResponse = await analyze(req.file.buffer);

            const analysisResult = {
                raga: analysisApiResponse.raaga,
                emotion: analysisApiResponse.emotions.length == 1 ?
                    `${analysisApiResponse.emotions[0]}` :
                    `${analysisApiResponse.emotions[0]} & ${analysisApiResponse.emotions[1]}`,
                taal: analysisApiResponse.taal,
            };

            return res.status(200).json({
                status: 200,
                ok: true,
                message: 'Audio file analyzed successfully',
                file: {
                    filename: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size
                },
                result: analysisResult
            });

        } catch (analysisError) {
            console.error('Analysis error:', analysisError);
            return res.status(500).json({
                status: 500,
                ok: false,
                message: 'Error analyzing audio file',
                error: analysisError.message
            });
        }

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            status: 500,
            ok: false,
            message: 'Server error while processing upload',
            error: error.message
        });
    }
});

router.post('/synthesis', async (req, res) => {
    res.json({
        status: 200,
        ok: true,
        message: 'Synthesis endpoint hit',
        data: req.body
    })
})

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
