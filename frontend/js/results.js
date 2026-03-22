// Renders matched job cards from the API response. Displays match percentage badge and matched 
// skills per card. On card click opens a modal showing missing skills the user needs to learn.

function renderResults(data) {
    const jobResults = document.getElementById('jobResults');
    jobResults.innerHTML = '';

    if (!data.jobs || data.jobs.length === 0) {
        jobResults.innerHTML = '<p>No matching jobs found. Try adjusting your criteria.</p>';
        return;
    }

    // Sort jobs by match percentage (highest first)
    data.jobs.sort((a, b) => b.match_percentage - a.match_percentage);

    // Create job cards
    data.jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';

        // Match percentage color coding
        let matchColor = '#FF6B6B'; // Red for < 60%
        if (job.match_percentage >= 80) {
            matchColor = '#4CAF50'; // Green for >= 80%
        } else if (job.match_percentage >= 70) {
            matchColor = '#FFC107'; // Yellow for 70-79%
        } else if (job.match_percentage >= 60) {
            matchColor = '#FF9800'; // Orange for 60-69%
        }

        const skillGaps = job.skill_gaps ? job.skill_gaps.join(', ') : 'None';

        jobCard.innerHTML = `
            <div class="job-header">
                <div>
                    <h3>${job.title}</h3>
                    <p class="company">${job.company}</p>
                </div>
                <div class="match-badge" style="background-color: ${matchColor}">
                    ${job.match_percentage}% Match
                </div>
            </div>
            
            <div class="job-details">
                <p><span class="label">Location:</span> ${job.location}</p>
                <p><span class="label">Type:</span> ${job.job_type || 'Not specified'}</p>
                <p><span class="label">Your Skills Match:</span> ${job.matched_skills ? job.matched_skills.join(', ') : 'None'}</p>
                <p><span class="label">Skills You Need:</span> ${skillGaps}</p>
            </div>
            
            <div class="job-footer">
                <a href="${job.url || '#'}" target="_blank" class="apply-btn">View Job</a>
            </div>
        `;

        jobResults.appendChild(jobCard);
    });

    // Summary statistics
    const avgMatch = Math.round(
        data.jobs.reduce((sum, job) => sum + job.match_percentage, 0) / data.jobs.length
    );

    const summary = document.createElement('div');
    summary.className = 'results-summary';
    summary.innerHTML = `
        <p>Found <strong>${data.jobs.length}</strong> matching jobs • Average Match: <strong>${avgMatch}%</strong></p>
    `;

    jobResults.insertBefore(summary, jobResults.firstChild);
}

// Make renderResults globally available
window.renderResults = renderResults;