// Handles light/dark mode theme toggle
// Saves theme preference to localStorage for persistence across sessions

document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Load saved theme preference or default to dark mode
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.textContent = '🌞';
    } else {
        document.body.classList.remove('light-mode');
        themeToggle.textContent = '🌙';
    }
    
    // Handle theme toggle button click
    themeToggle.addEventListener('click', function() {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        
        if (newTheme === 'light') {
            document.body.classList.add('light-mode');
            themeToggle.textContent = '🌞';
        } else {
            document.body.classList.remove('light-mode');
            themeToggle.textContent = '🌙';
        }
    });
});
