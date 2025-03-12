import app from './app.js';
import { staticFiles } from './app.js';
import path from 'path';
import createAndCompose from './api/compose.js';


const PORT = 6001;
const dummyUrl = ``

// Route for homepage
app.get("/home", (req, res) => {
    res.sendFile(path.join(staticFiles, "index.html"));
});

app.get("/:page", (req, res) => {
    const page = req.params.page;
    const filePath = path.join(staticFiles, `${page}.html`);

    // Send the requested HTML file if it exists
    res.sendFile(filePath, (err) => {
        if (err) {
            return res.status(404).send("Oop! Page Not Found");
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

app.listen(PORT, (req, res) => {
    console.log(`Server running on http://localhost:${PORT}`);
})