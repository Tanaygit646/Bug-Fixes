import app from './app.js';
import { staticFiles } from './app.js';
import path from 'path';
const PORT = 6001;

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
            res.status(404).send("Oop! Page Not Found");
        }
    });
});

app.listen(PORT, (req, res) => {
    console.log(`Server running on http://localhost:${PORT}`);
})