// Location dropdown with event delegation (no individual listeners)
let allLocations = [];
let selectedLocations = [];

const locationsData = JSON.parse(document.getElementById('locationsData').textContent);
allLocations = locationsData.locations;

const locationSearch = document.getElementById('locationSearch');
const locationDropdown = document.getElementById('locationDropdown');
const locationList = document.getElementById('locationList');
const selectedLocationsDiv = document.getElementById('selectedLocations');

// Initial render
render();

// Search input
locationSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    locationDropdown.style.display = 'block';
    const filtered = searchTerm === '' 
        ? allLocations 
        : allLocations.filter(loc => loc.toLowerCase().includes(searchTerm));
    renderList(filtered);
});

// Show on focus
locationSearch.addEventListener('focus', () => {
    locationDropdown.style.display = 'block';
});

// Hide on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.location-search-container')) {
        locationDropdown.style.display = 'none';
    }
});

// Event delegation for list items
locationList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (li) {
        const location = li.dataset.location;
        toggleLocation(location);
        // Re-render with current search
        const searchTerm = locationSearch.value.toLowerCase();
        const filtered = searchTerm === '' 
            ? allLocations 
            : allLocations.filter(l => l.toLowerCase().includes(searchTerm));
        renderList(filtered);
    }
});

// Event delegation for remove buttons
selectedLocationsDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-tag')) {
        const location = e.target.dataset.location;
        toggleLocation(location);
        // Re-render list 
        const searchTerm = locationSearch.value.toLowerCase();
        const filtered = searchTerm === '' 
            ? allLocations 
            : allLocations.filter(l => l.toLowerCase().includes(searchTerm));
        renderList(filtered);
    }
});

function render() {
    renderList(allLocations);
    renderTags();
}

function renderList(locations) {
    locationList.innerHTML = locations
        .map(loc => `<li class="${selectedLocations.includes(loc) ? 'selected' : ''}" data-location="${loc}">${loc}</li>`)
        .join('');
}

function renderTags() {
    selectedLocationsDiv.innerHTML = selectedLocations
        .map(loc => `<span class="location-tag">${loc}<span class="remove-tag" data-location="${loc}">×</span></span>`)
        .join('');
}

function toggleLocation(location) {
    const idx = selectedLocations.indexOf(location);
    idx > -1 ? selectedLocations.splice(idx, 1) : selectedLocations.push(location);
    renderTags();
}

// Export selected locations for use in upload.js
function getSelectedLocations() {
    return selectedLocations;
}
