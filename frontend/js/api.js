async function uploadResume(file, primarySkill, location, threshold) {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("primary_skill", primarySkill);
    formData.append("location", location);
    formData.append("match_threshold", threshold);

    console.log("Sending:", { primarySkill, location, match_threshold: threshold });
    const response = await fetch("http://localhost:8000/api/recommend", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Something went wrong.");
    }

    return data;
}
