import app from './app.js';
import { staticFiles } from './app.js';
import path from 'path';
import createAndCompose from './api/compose.js';


const PORT = 6001;
const dummyUrl = `https://rr4---sn-ci5gup-jj0y.googlevideo.com/videoplayback?expire=1741804383&ei=_37RZ_W5FOnfybgP-6nHGA&ip=156.248.110.38&id=o-AIsKBm6Y0e_ik8VaPaM9GbJbGpFEblwyoANgDOawQkt0&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&rms=au%2Cau&pcm2=yes&bui=AUWDL3zFAKUTHXZQ1WBosIfBtgmXi6F58SqsqI8D0t93ph8Qm2lLjNK24hmKyYq9KnduhfA0mCZ4wSs4&spc=RjZbSTzll9EuF5ZWjpvTL0WgjLZLNWMbFvbcnG68ZXhyiqoxTRqMWeAAGLHsdjQ&vprv=1&svpuc=1&mime=audio%2Fmp4&ns=STq1se8ZZ41YClbszNNLTVoQ&rqh=1&gir=yes&clen=3175461&dur=196.162&lmt=1732776707850415&keepalive=yes&fexp=24350590,24350737,24350827,24350961,24351173,24351276,24351283,24351347,24351349,24351352,24351377,51326932,51355912,51358317,51411872&c=WEB&sefc=1&txp=4532434&n=XH_Ba8w1lu38pA&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cpcm2%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgLXwllLFbBPTu5omQDf9CJ9kYcoakl3nGj0rNbwzg72ECIFORpnsmkwHTEG-TguZRrXxB5B1fnir9i9Cyk0ephqpg&pot=MnSf51qLC6Z_LJ_fuoXDaIpgLtAekjZpw-PJejv9mWKh8LarmgV29tLKU0skYlROhevRu7YQU7H5iXF0n3uKheNjHRFQ5hM6QcZMqvURTe7aXvJvJqLFGzu1sJT7B-PE2PHzdc8B67l_bjL3eXn5FmOJYI602w%3D%3D&range=0-&redirect_counter=1&rm=sn-ab5eel7s&rrc=104&req_id=9daaf3dc6898a6e9&cms_redirect=yes&ipbypass=yes&met=1741782797,&mh=ti&mip=2401:4900:76d3:c9b:10cf:6e84:d66f:7229&mm=31&mn=sn-ci5gup-jj0y&ms=au&mt=1741782317&mv=m&mvi=4&pl=44&lsparams=ipbypass,met,mh,mip,mm,mn,ms,mv,mvi,pl,rms&lsig=AFVRHeAwRAIgHhG-56zXSYbYOcOZP_qrCJyMu1y_NPptpVt30Da7IecCIH_FISxRlVEaOXwGOWKywi_YeSxoBOz5l8ydeWKYHpbx`

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

app.post('/synthesis', (req, res) => {
    const trackMeta = req.body;
    if (!trackMeta) {
        return res.json({ status: "failed", ok: false });
    }
    res.json({
        status: "recieved",
        ok: true,
        trackMeta: trackMeta,
        trackUrl: dummyUrl
    });

    console.log(trackMeta);

})

app.listen(PORT, (req, res) => {
    console.log(`Server running on http://localhost:${PORT}`);
})