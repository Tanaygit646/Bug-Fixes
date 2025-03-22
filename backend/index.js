import app from './app.js';
import fs from 'fs';
import { staticFiles } from './app.js';
import { fileURLToPath } from "url";
import path from 'path';
import multer from 'multer';
import createAndCompose from './api/compose.js';
import analyze from './api/analyze.js';


const PORT = 6001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');

        // Create the uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Create a unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, 'audio-' + uniqueSuffix + fileExtension);
    }
});

// File filter to only accept audio files
const fileFilter = (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
        cb(null, true);
    } else {
        cb(new Error('Only audio files are allowed!'), false);
    }
};

// Configure the multer middleware
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024 // limit to 25MB
    }
});

// Route for homepage
app.get("/home", (req, res) => {
    res.sendFile(path.join(staticFiles, "index.html"));
});

app.get("/:page", (req, res) => {
    const page = req.params.page;
    const filePath = path.join(staticFiles, `${page}.html`);
    const errorPage = path.join(staticFiles, "error.html");

    // Send the requested HTML file if it exists
    res.sendFile(filePath, (err) => {
        if (err) {
            return res.sendFile(errorPage);
        }
    });
});

app.post('/synthesis', async (req, res) => {
    const trackMeta = req.body;
    if (!trackMeta) {
        return res.json({ status: "failed", ok: false });
    }

    const trackUrl = await createAndCompose(trackMeta);

    res.json({
        status: "recieved",
        ok: true,
        trackMeta: trackMeta,
        trackUrl: trackUrl
    });

    console.log(trackMeta);

})

// Handle audio file uploads
app.post('/analysis', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.json({
                status: 400,
                ok: false,
                message: 'No audio file uploaded'
            });
        }

        // File successfully uploaded
        console.log('File uploaded:', req.file);

        const analysisApiResponse = await analyze(req.file.path);


        const analysisResult = {
            raga: analysisApiResponse.raaga,
            emotion: analysisApiResponse.emotions.length == 1 ? `${analysisApiResponse.emotions[0]}` : `${analysisApiResponse.emotions[0]} & ${analysisApiResponse.emotions[1]}`,
            taal: analysisApiResponse.taal,
        };

        return res.json({
            status: 200,
            ok: true,
            message: 'Audio file uploaded successfully',
            file: {
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path
            },
            result: analysisResult
        });



    } catch (error) {
        console.error('Error handling upload:', error);
        return res.json({
            status: 500,
            ok: false,
            message: 'Server error while uploading file'
        });
    }
});

// Error handler middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.json({
                status: 413,
                ok: false,
                message: 'File is too large. Maximum size is 25MB'
            });
        }
        return res.json({
            status: 400,
            ok: false,
            message: `Upload error: ${err.message}`
        });
    } else if (err) {
        // An unknown error occurred
        return res.json({
            status: 500,
            ok: false,
            message: err.message
        });
    }
    next();
});

app.listen(PORT, (req, res) => {
    console.log(`Server running on http://localhost:${PORT}`);
})