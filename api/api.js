import express, { Router } from 'express';
import serverless from "serverless-http";
import bodyParser from 'body-parser';
import cors from 'cors';
import createAndCompose from '../api/routes/apiRoutes/synthesis.js';

const router = Router();
const app = express();

app.use(bodyParser.json());
app.use(cors());

// API ROUTES
router.get('/ping', (req, res) => {
    res.json({
        status: 200,
        ok: true,
        message: 'Server is running'
    });
});

router.post('/analysis', (req, res) => {
    res.json({
        status: 200,
        ok: true,
        message: 'Analysis endpoint hit',
        data: req.body
    })
})

router.post('/synthesis', async (req, res) => {
    res.json({
        status: 200,
        ok: true,
        message: 'Synthesis endpoint hit',
        data: req.body
    })
})

app.use('/api/', router);
export const handler = serverless(app);
