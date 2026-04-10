// --- render job cards ---
function renderResults(data) {
    const jobResults = document.getElementById("jobResults");
    jobResults.innerHTML = "";

    const jobs = data.matched_jobs;

    if (!jobs || jobs.length === 0) {
        jobResults.innerHTML = "<p>No matching jobs found. Try adjusting your filters.</p>";
        return;
    }

    // summary bar
    const avgMatch = Math.round(jobs.reduce((sum, j) => sum + j.match_percent, 0) / jobs.length);
    const summary = document.createElement("div");
    summary.className = "results-summary";
    summary.innerHTML = `<p>Found <strong>${jobs.length}</strong> matching jobs &bull; Average Match: <strong>${avgMatch}%</strong></p>`;
    jobResults.appendChild(summary);

    // one card per job
    jobs.forEach(job => {

        // pick badge color based on match_percent
        let matchColor = COLORS.error;
        if      (job.match_percent >= MATCH_THRESHOLDS.HIGH) matchColor = COLORS.matchHigh;
        else if (job.match_percent >= MATCH_THRESHOLDS.MID)  matchColor = COLORS.matchMid;
        else if (job.match_percent >= MATCH_THRESHOLDS.LOW)  matchColor = COLORS.matchLow;

        // salary display
        let salary = "Not specified";
        if (job.salary_min && job.salary_max) {
            salary = `₹${job.salary_min.toLocaleString()} – ₹${job.salary_max.toLocaleString()}`;
        }

        const card = document.createElement("div");
        card.className = "job-card";
        card.innerHTML = `
            <div class="job-header">
                <div>
                    <h3>${job.title}</h3>
                    <p class="company">${job.company}</p>
                </div>
                <div class="match-badge" style="background-color: ${matchColor}">
                    ${job.match_percent}% Match
                </div>
            </div>
            <div class="job-details">
                <p><span class="label">Location:</span> ${job.location}</p>
                <p><span class="label">Type:</span> ${job.job_type || "Not specified"}</p>
                <p><span class="label">Experience:</span> ${job.experience_level || "Not specified"}</p>
                <p><span class="label">Salary:</span> ${salary}</p>
                <p><span class="label">Your Skills Match:</span> ${job.matched_skills.length ? job.matched_skills.join(", ") : "None"}</p>
                <p><span class="label">Skills You Need:</span> ${job.skill_gaps.length ? job.skill_gaps.join(", ") : "None"}</p>
            </div>
            <div class="job-footer">
                <a href="${job.source_url || "#"}" target="_blank" class="apply-btn">View Job</a>
            </div>
        `;
        jobResults.appendChild(card);
    });
}

// --- render skill gaps section ---
function renderSkillGaps(data) {
    const content = document.getElementById("skillGapsContent");
    if (!content) return;

    const extractedSkills = data.extracted_skills || [];
    const jobs = data.matched_jobs || [];

    // count how many jobs need each gap skill
    const gapCount = {};
    jobs.forEach(job => {
        (job.skill_gaps || []).forEach(skill => {
            gapCount[skill] = (gapCount[skill] || 0) + 1;
        });
    });
    const sortedGaps = Object.entries(gapCount).sort((a, b) => b[1] - a[1]);

    let html = "";

    // your skills
    if (extractedSkills.length > 0) {
        html += `
            <div class="skill-group">
                <h3 class="skill-group-title">Your Extracted Skills</h3>
                <div class="skill-chips">
                    ${extractedSkills.map(s => `<span class="skill-chip skill-chip--have">${s}</span>`).join("")}
                </div>
            </div>
        `;
    }

    // skills to learn
    if (sortedGaps.length > 0) {
        html += `
            <div class="skill-group">
                <h3 class="skill-group-title">Skills to Learn</h3>
                <p class="skill-group-subtitle">Ranked by how many matched jobs require them</p>
                <div class="skill-chips">
                    ${sortedGaps.map(([skill, count]) => `
                        <span class="skill-chip skill-chip--gap">
                            ${skill}
                            <span class="skill-chip-count">${count} job${count > 1 ? "s" : ""}</span>
                        </span>
                    `).join("")}
                </div>
            </div>
        `;
    } else {
        html += `<p class="no-gaps-msg">Great news — you already have all the skills required for your matched jobs!</p>`;
    }

    content.innerHTML = html;
}
