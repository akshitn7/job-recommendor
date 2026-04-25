document.addEventListener("DOMContentLoaded", function () {

    const uploadBox      = document.getElementById("uploadBox");
    const resumeInput    = document.getElementById("resumeInput");
    const fileNameDisplay = document.getElementById("fileName");
    const formContainer  = document.getElementById("formContainer");
    const submitBtn      = document.getElementById("submitBtn");
    const spinner        = document.getElementById("loadingSpinner");
    const skillInput     = document.getElementById("skillInput");
    const locationInput  = document.getElementById("locationInput");
    const thresholdInput = document.getElementById("thresholdInput");
    const uploadBtn      = document.querySelector(".upload-btn");
    const browseSpan     = document.querySelector(".browse");

    let currentFile = null;

    uploadBox.addEventListener("click", () => resumeInput.click());
    if (browseSpan) browseSpan.addEventListener("click", (e) => { e.stopPropagation(); resumeInput.click(); });
    if (uploadBtn)  uploadBtn.addEventListener("click", () => resumeInput.click());

    resumeInput.addEventListener("change", function () {
        if (this.files.length > 0) handleFile(this.files[0]);
    });

    uploadBox.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = COLORS.dragBorder;
        uploadBox.style.backgroundColor = COLORS.dragActive;
    });

    uploadBox.addEventListener("dragleave", () => {
        uploadBox.style.borderColor = COLORS.borderDefault;
        uploadBox.style.backgroundColor = "";
    });

    uploadBox.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = COLORS.borderDefault;
        uploadBox.style.backgroundColor = "";
        if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
    });

    function handleFile(file) {
        if (!FILE.ALLOWED_TYPES.includes(file.type)) {
            alert("Invalid file type. Please upload a PDF.");
            return;
        }
        if (file.size > FILE.MAX_SIZE_BYTES) {
            alert("File too large. Max size is 5MB.");
            return;
        }

        currentFile = file;
        fileNameDisplay.textContent = `Selected: ${file.name}`;
        fileNameDisplay.style.color = COLORS.accent;

        formContainer.style.display = "block";
        formContainer.scrollIntoView({ behavior: "smooth", block: "start" });
        skillInput.focus();
    }

    submitBtn.addEventListener("click", async function (e) {
        e.preventDefault();

        const skill    = skillInput.value.trim();
        const location = locationInput.value;
        const threshold = thresholdInput.value;

        if (!currentFile)  { alert("Please upload a resume.");        return; }
        if (!skill)        { alert("Please enter a primary skill.");   return; }

        submitBtn.disabled = true;
        spinner.classList.add("active");
        fileNameDisplay.textContent = "Processing your resume...";
        fileNameDisplay.style.color = COLORS.info;

        try {
            console.log("Sending:", { primarySkill: skill, location: location, match_threshold: threshold });
            const result = await uploadResume(currentFile, skill, location, threshold);

            fileNameDisplay.textContent = "Done! Showing results below.";
            spinner.classList.remove("active");
            formContainer.style.display = "none";


            const resultsContainer = document.getElementById("resultsContainer");
            resultsContainer.style.display = "block";
            renderResults(result);

            const skillGapsContainer = document.getElementById("skillGapsContainer");
            skillGapsContainer.style.display = "block";
            renderSkillGaps(result);

            resultsContainer.scrollIntoView({ behavior: "smooth" });

        } catch (error) {
            fileNameDisplay.textContent = `Error: ${error.message}`;
            fileNameDisplay.style.color = COLORS.error;
            spinner.classList.remove("active");

            setTimeout(() => {
                submitBtn.disabled = false;
                fileNameDisplay.textContent = `Selected: ${currentFile.name}`;
                fileNameDisplay.style.color = COLORS.accent;
            }, TIMING.ERROR_RESET_MS);
        }
    });

});
