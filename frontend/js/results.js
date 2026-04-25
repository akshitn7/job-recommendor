/* SVG icon helpers – small inline icons to replace emojis */
const SVG_ICONS = {
    building: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>`,
    briefcase: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
    calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
    checkCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
};

function renderResults(data) {
    const jobResults = document.getElementById("jobResults");
    jobResults.innerHTML = "";

    const jobs = data.matched_jobs;

    if (!jobs || jobs.length === 0) {
        jobResults.innerHTML = `<div class="no-results-msg"><p>No matching jobs found. Try adjusting your filters.</p></div>`;
        return;
    }

    const grid = document.createElement("div");
    grid.className = "job-cards-grid";

    jobs.forEach(job => {
        let matchClass = "match-low";
        if      (job.match_percent >= MATCH_THRESHOLDS.HIGH) matchClass = "match-high";
        else if (job.match_percent >= MATCH_THRESHOLDS.MID)  matchClass = "match-mid";
        else if (job.match_percent >= MATCH_THRESHOLDS.LOW)  matchClass = "match-ok";

        let barColor = COLORS.error;
        if      (job.match_percent >= MATCH_THRESHOLDS.HIGH) barColor = COLORS.matchHigh;
        else if (job.match_percent >= MATCH_THRESHOLDS.MID)  barColor = COLORS.matchMid;
        else if (job.match_percent >= MATCH_THRESHOLDS.LOW)  barColor = COLORS.matchLow;

        let salary = "Not specified";
        if (job.salary) {
            salary = `₹${(job.salary / 1000).toFixed(0)}k`;
        } else if (job.salary_min) {
            salary = `₹${(job.salary_min / 1000).toFixed(0)}k`;
        }

        const initial = (job.company || "?")[0].toUpperCase();
        const avatarColor = AVATAR_COLORS[initial.charCodeAt(0) % AVATAR_COLORS.length];
        const jobType = job.job_type || "Full-time";
        const expLevel = job.experience_level || "";

        const matchedSkills = job.matched_skills || [];
        const skillChipsHTML = matchedSkills.map(s => `<span class="card-skill-chip">${s}</span>`).join("");

        const card = document.createElement("div");
        card.className = "job-card";
        card.innerHTML = `
            <div class="card-top-row">
                <div class="card-avatar" style="background-color: ${avatarColor}">${initial}</div>
                <div class="card-match-pill ${matchClass}">${job.match_percent}% Match</div>
            </div>
            <h3 class="card-title">${job.title}</h3>
            <p class="card-company">${job.company}${job.location ? " · " + job.location : ""}</p>
            <div class="card-meta-tags">
                ${job.location ? `<span class="card-meta-tag"><span class="meta-icon">${SVG_ICONS.building}</span>${job.location.includes("Remote") ? "Remote" : "On-site"}</span>` : ""}
                <span class="card-meta-tag"><span class="meta-icon">${SVG_ICONS.briefcase}</span>${jobType}</span>
                ${expLevel ? `<span class="card-meta-tag"><span class="meta-icon">${SVG_ICONS.calendar}</span>${expLevel}</span>` : ""}
            </div>
            <div class="card-match-bar-section">
                <span class="card-match-label">Skill Match</span>
                <div class="card-match-bar-track">
                    <div class="card-match-bar-fill" style="width: ${job.match_percent}%; background-color: ${barColor}"></div>
                </div>
                <span class="card-match-value">${job.match_percent}%</span>
            </div>
            <div class="card-skills-row">${skillChipsHTML}</div>
            <div class="card-bottom-row">
                <span class="card-salary">${salary}</span>
            </div>
        `;
        grid.appendChild(card);
    });

    jobResults.appendChild(grid);
}

function renderSkillGaps(data) {
    const content = document.getElementById("skillGapsContent");
    if (!content) return;

    const extractedSkills = data.extracted_skills || [];
    const jobs = data.matched_jobs || [];

    const gapCount = {};
    jobs.forEach(job => {
        (job.skill_gaps || []).forEach(skill => {
            gapCount[skill] = (gapCount[skill] || 0) + 1;
        });
    });
    const sortedGaps = Object.entries(gapCount).sort((a, b) => b[1] - a[1]);

    let html = '';

    if (sortedGaps.length > 0) {
        html += `
            <div class="skill-group">
                <h3 class="skill-group-title">Skills to Learn</h3>
                <div class="skill-chips skill-chips--centered">
                    ${sortedGaps.slice(0, SKILL_GAP.MAX_DISPLAY).map(([skill]) => `<span class="skill-chip skill-chip--gap">${skill}</span>`).join("")}
                </div>
            </div>
        `;
    } else {
        html += `<div class="no-gaps-banner no-gaps-banner--centered">
            ${SVG_ICONS.checkCircle}
            <p class="no-gaps-msg">Great news — you already have all the skills required for your matched jobs!</p>
        </div>`;
    }

    if (extractedSkills.length > 0) {
        html += `
            <div class="skill-group extracted-skills-card">
                <h3 class="skill-group-title">Your Extracted Skills</h3>
                <div class="skill-chips skill-chips--centered">
                    ${extractedSkills.map(s => `<span class="skill-chip skill-chip--have">${s}</span>`).join("")}
                </div>
            </div>
        `;
    }

    content.innerHTML = html;
}
