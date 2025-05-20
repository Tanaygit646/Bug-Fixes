const synthesizeMusicBtn = document.getElementById('synthesizeBtn');
const analyzeMusicBtn = document.getElementById('analyzeBtn');

if (synthesizeMusicBtn) {
    synthesizeMusicBtn.addEventListener('click', async () => {
        const prompt = document.getElementById("prompt");
        const duration = document.getElementById("duration");
        const genre = document.getElementById("genre");
        const mood = document.getElementById("mood");
        const tempo = document.getElementById("tempo");
        const warning = document.getElementById("warning");
        const advancedOptions = document.getElementById("advancedOptions");
        const generating = document.getElementById("generating");
        const synthesisResult = document.getElementById("synthesisResult");


        if (!prompt.value) {
            warning.classList.remove("hidden");
            prompt.classList.add("error-border");
            return;
        } else {
            warning.classList.add("hidden");
            prompt.classList.remove("error-border");
        }

        const trackMeta = {
            prompt: { text: prompt.value },
            duration: parseInt(duration.value) * 1000 || 60000,
            genre: genre.value || "indian classical music",
            mood: mood.value || "spiritual",
            tempo: `${tempo.value || 80} BPM`
        }

        // console.log(trackMeta);
        const baseUrl = `http://localhost:8888/synthesis`
        // console.log(baseUrl)

        try {
            prompt.classList.add("hidden");
            advancedOptions.classList.add("hidden");
            synthesizeMusicBtn.classList.add("hidden");
            show(generating);


            const response = await fetch(`${baseUrl}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(trackMeta)
                }
            )

            if (!response.ok) throw new Error("Failed to generate music");
            console.log(response);

            const data = await response.json();
            console.log("Music generated:", data);

            const audioElement = document.getElementById("generatedMusic");
            audioElement.src = data.trackUrl;

            hide(generating);
            synthesisResult.classList.remove("hidden");



        } catch (error) {
            console.log(error);
        }
    }
    )
}


if (analyzeMusicBtn) {
    analyzeMusicBtn.addEventListener('click', async () => {
        const fileInput = document.getElementById('musicFile');
        const file = fileInput.files[0];
        if (!file) {
            alert("Please upload a valid audio file.");
            return;
        }


        const formData = new FormData();
        formData.append('audio', file);
        fileInput.classList.add('hidden');
        uploadAudioData(formData);

    })
}

function toggleMenu() {
    let mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.remove("hidden");
    } else {
        mobileMenu.classList.add("hidden");
    }
}

function hide(element) {
    element.setAttribute("style", "display: none");
}

function show(element) {
    element.removeAttribute("style");
}


// Common function to handle upload
function uploadAudioData(formData) {

    const xhr = new XMLHttpRequest();
    const loadingText = document.getElementById("loading");
    const resultDiv = document.getElementById("analysisResult");
    const analyzing = document.getElementById("analyzing");
    const analysisResult = document.getElementById("analysisResult");


    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            percentComplete < 100 ? loadingText.innerHTML = `Uploading...` : loadingText.innerHTML = "Analyzing...";
        }

    });

    // Handle response
    xhr.onload = async () => {
        if (xhr.status === 200) {
            // Parse and display response
            try {
                const response = JSON.parse(xhr.responseText);

                hide(analyzing);
                document.getElementById("ragaResult").innerHTML = `Raaga: ${response.result.raga}`;
                document.getElementById("emotionResult").innerHTML = `Emotion: ${response.result.emotion}`;
                document.getElementById("taalResult").innerHTML = `Taal: ${response.result.taal}`;
                analysisResult.classList.remove("hidden");
            } catch (e) {
                console.log(`Error parsing server response: ${e.message}`);
            }
        } else {
            console.log(`Upload failed with status: ${xhr.status}`);
        }
    };

    // Handle errors
    xhr.onerror = function () {
        console.log('Upload failed. Check your connection.');
    };
    // Send the request
    xhr.open('POST', 'http://localhost:6001/analysis', true);
    xhr.send(formData);
    analyzeMusicBtn.classList.add("hidden");
    show(analyzing)
}
