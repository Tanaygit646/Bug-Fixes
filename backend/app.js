import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import cors from 'cors';


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const staticFiles = path.join(__dirname, '..');

app.use(cors());
app.use(express.static(staticFiles));


export default app;