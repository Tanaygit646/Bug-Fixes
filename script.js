const synthesizeMusicBtn = document.getElementById('synthesizeBtn');
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

    console.log(trackMeta);
    const baseUrl = `http://localhost:6001/synthesis`
    console.log(baseUrl)

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


        setTimeout(() => {
            hide(generating);
            synthesisResult.classList.remove("hidden");
        }, 15000)


    } catch (error) {
        console.log(error);
    }
}
)

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
