function renderResults(data) {
    const jobResults = document.getElementById("jobResults");
    jobResults.innerHTML = "";

    const jobs = data.matched_jobs;

    if (!jobs || jobs.length === 0) {
        jobResults.innerHTML = `<div class="no-results-msg"><p>No matching jobs found. Try adjusting your filters.</p></div>`;
        return;
    }

    const avgMatch = Math.round(jobs.reduce((sum, j) => sum + j.match_percent, 0) / jobs.length);
    const summary = document.createElement("div");
    summary.className = "results-summary";
    summary.innerHTML = `<p>Based on skills extracted from your resume. Sorted by match %. Found <strong>${jobs.length}</strong> jobs &bull; Average Match: <strong>${avgMatch}%</strong></p>`;
    jobResults.appendChild(summary);

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
        if (job.salary_min && job.salary_max) {
            salary = `₹${(job.salary_min / 1000).toFixed(0)}k – ₹${(job.salary_max / 1000).toFixed(0)}k`;
        }

        const initial = (job.company || "?")[0].toUpperCase();
        const avatarColor = AVATAR_COLORS[initial.charCodeAt(0) % AVATAR_COLORS.length];
        const jobType = job.job_type || "Full-time";
        const expLevel = job.experience_level || "";

        const matchedSkills = job.matched_skills || [];
        const visibleSkills = matchedSkills.slice(0, MAX_VISIBLE_SKILLS);
        const extraCount = matchedSkills.length - MAX_VISIBLE_SKILLS;

        const skillChipsHTML = visibleSkills.map(s => `<span class="card-skill-chip">${s}</span>`).join("") +
            (extraCount > 0 ? `<span class="card-skill-chip card-skill-extra">+${extraCount}</span>` : "");

        const card = document.createElement("div");
        card.className = "job-card";
        card.innerHTML = `
            <div class="card-top-row">
                <div class="card-avatar" style="background-color: ${avatarColor}">${initial}</div>
                <div class="card-match-pill ${matchClass}">● ${job.match_percent}% Match</div>
            </div>
            <h3 class="card-title">${job.title}</h3>
            <p class="card-company">${job.company}${job.location ? " · " + job.location : ""}</p>
            <div class="card-meta-tags">
                ${job.location ? `<span class="card-meta-tag"><span class="meta-icon">🏢</span>${job.location.includes("Remote") ? "Remote" : "On-site"}</span>` : ""}
                <span class="card-meta-tag"><span class="meta-icon">💼</span>${jobType}</span>
                ${expLevel ? `<span class="card-meta-tag"><span class="meta-icon">📅</span>${expLevel}</span>` : ""}
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
                <a href="${job.source_url || "#"}" target="_blank" class="card-view-btn">View Details →</a>
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
    const topJob = jobs.length > 0 ? jobs[0] : null;

    let html = `<div class="skill-intel-layout">`;

    html += `
        <div class="skill-intel-left">
            <span class="skill-intel-label">SKILL INTELLIGENCE</span>
            <h3 class="skill-intel-heading">Know Exactly What to Learn Next</h3>
            <p class="skill-intel-desc">We don't just show you jobs — we show you the precise skills standing between you and your next role. Close the gap faster.</p>
            <div class="skill-intel-features">
                <div class="skill-intel-feature">
                    <span class="feature-icon">🎯</span>
                    <div>
                        <strong>Targeted Learning</strong>
                        <span>Only learn what matters</span>
                    </div>
                </div>
                <div class="skill-intel-feature">
                    <span class="feature-icon">⚡</span>
                    <div>
                        <strong>Get Noticed Faster</strong>
                        <span>Close gaps, boost match %</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    html += `<div class="skill-intel-right"><div class="skill-gap-card">`;

    if (sortedGaps.length > 0) {
        const headerText = topJob ? `Missing Skills — ${topJob.title} @ ${topJob.company}` : "Skills to Learn";
        html += `<p class="gap-card-header">${headerText}</p>`;

        sortedGaps.slice(0, SKILL_GAP.MAX_DISPLAY).forEach(([skill, count], idx) => {
            const demandIdx = idx % SKILL_GAP.ICONS.length;
            const demandLevel = count >= 3 ? "High demand" : count >= 2 ? "Medium demand" : SKILL_GAP.DEMAND_LABELS[demandIdx];
            const timeEst = SKILL_GAP.TIME_ESTIMATES[demandIdx];

            html += `
                <div class="gap-skill-row">
                    <div class="gap-skill-icon">${SKILL_GAP.ICONS[demandIdx]}</div>
                    <div class="gap-skill-info">
                        <strong>${skill}</strong>
                        <span>${demandLevel} · ${timeEst}</span>
                    </div>
                    <a href="https://www.google.com/search?q=learn+${encodeURIComponent(skill)}" target="_blank" class="gap-learn-btn">Learn →</a>
                </div>
            `;
        });
    } else {
        html += `<div class="no-gaps-banner">
            <span class="no-gaps-icon">🎉</span>
            <p class="no-gaps-msg">Great news — you already have all the skills required for your matched jobs!</p>
        </div>`;
    }

    html += `</div></div></div>`;

    if (extractedSkills.length > 0) {
        html += `
            <div class="skill-group extracted-skills-card">
                <h3 class="skill-group-title">Your Extracted Skills</h3>
                <div class="skill-chips">
                    ${extractedSkills.map(s => `<span class="skill-chip skill-chip--have">${s}</span>`).join("")}
                </div>
            </div>
        `;
    }

    content.innerHTML = html;
}
