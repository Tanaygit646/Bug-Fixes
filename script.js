function toggleMenu() {
    let mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu.classList.contains("hidden")) {
        mobileMenu.classList.remove("hidden");
    } else {
        mobileMenu.classList.add("hidden");
    }
}

function synthesizeMusic() {
    let resultDiv = document.getElementById('synthesisResult');
    let fileInput = document.getElementById("musicFile");
    if (!fileInput.files.length) {
        alert("Please upload a valid audio file.");
        return;
    }
    resultDiv.style.display = "block";
}