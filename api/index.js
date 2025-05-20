const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');


const app = express();

app.use(cors());

const PORT = process.env.PORT || 6000;

// app.post('/synthesis', async (req, res) => {
//     const trackMeta = req.body;
//     if (!trackMeta) {
//         return res.json({ status: "failed", ok: false });
//     }

//     const trackUrl = await createAndCompose(trackMeta);

//     res.json({
//         status: "recieved",
//         ok: true,
//         trackMeta: trackMeta,
//         trackUrl: trackUrl
//     });

//     console.log(trackMeta);

// })

// app.post('/analysis', upload.single('audio'), async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.json({
//                 status: 400,
//                 ok: false,
//                 message: 'No audio file uploaded'
//             });
//         }

//         // File successfully uploaded
//         console.log('File uploaded:', req.file);

//         const analysisApiResponse = await analyze(req.file.path);


//         const analysisResult = {
//             raga: analysisApiResponse.raaga,
//             emotion: analysisApiResponse.emotions.length == 1 ? `${analysisApiResponse.emotions[0]}` : `${analysisApiResponse.emotions[0]} & ${analysisApiResponse.emotions[1]}`,
//             taal: analysisApiResponse.taal,
//         };

//         return res.json({
//             status: 200,
//             ok: true,
//             message: 'Audio file uploaded successfully',
//             file: {
//                 filename: req.file.filename,
//                 mimetype: req.file.mimetype,
//                 size: req.file.size,
//                 path: req.file.path
//             },
//             result: analysisResult
//         });



//     } catch (error) {
//         console.error('Error handling upload:', error);
//         return res.json({
//             status: 500,
//             ok: false,
//             message: 'Server error while uploading file'
//         });
//     }
// });

app.get('/ping', (req, res) => {
    res.json({
        status: 200,
        ok: true,
        message: 'Server is running'
    });
})

app.listen(PORT, (req, res) => {
    console.log(`Server running on http://localhost:${PORT}`);
})