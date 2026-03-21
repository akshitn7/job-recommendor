// Handles location dropdown search and selection.
// Fetches available locations from backend, displays a searchable dropdown,
// and allows users to select multiple preferred locations.

let allLocations = [];
let selectedLocations = [];

document.addEventListener('DOMContentLoaded', function() {
    const locationSearch = document.getElementById('locationSearch');
    const locationDropdown = document.getElementById('locationDropdown');
    const locationList = document.getElementById('locationList');
    const selectedLocationsDiv = document.getElementById('selectedLocations');

    // Fetch locations from backend
    fetchLocations();

    // Location search input handler
    locationSearch.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        locationDropdown.style.display = 'block';
        locationList.innerHTML = '';

        if (searchTerm === '') {
            displayAllLocations();
        } else {
            const filteredLocations = allLocations.filter(location =>
                location.toLowerCase().includes(searchTerm)
            );
            displayLocations(filteredLocations);
        }
    });

    // Show dropdown when focused
    locationSearch.addEventListener('focus', function() {
        locationDropdown.style.display = 'block';
        if (locationList.innerHTML === '') {
            displayAllLocations();
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.location-search-container')) {
            locationDropdown.style.display = 'none';
        }
    });

    // Fetch locations from backend
    function fetchLocations() {
        fetch('/api/locations')
            .then(response => response.json())
            .then(data => {
                allLocations = data.locations;
                displayAllLocations();
            })
            .catch(error => {
                console.error('Error fetching locations:', error);
                // Fallback to default locations if fetch fails
                allLocations = [
                    "San Francisco, CA", "New York, NY", "Seattle, WA",
                    "Austin, TX", "Boston, MA", "Chicago, IL",
                    "Los Angeles, CA", "Denver, CO", "Atlanta, GA",
                    "Dallas, TX", "Miami, FL", "Portland, OR",
                    "Toronto, Canada", "Vancouver, Canada", "Montreal, Canada",
                    "London, UK", "Berlin, Germany", "Amsterdam, Netherlands",
                    "Paris, France", "Dublin, Ireland", "Stockholm, Sweden",
                    "Zurich, Switzerland", "Barcelona, Spain",
                    "Bangalore, India", "Mumbai, India", "Hyderabad, India",
                    "Singapore", "Tokyo, Japan", "Seoul, South Korea",
                    "Dubai, UAE", "Tel Aviv, Israel",
                    "Sydney, Australia", "Melbourne, Australia"
                ];
                displayAllLocations();
            });
    }

    function displayAllLocations() {
        displayLocations(allLocations);
    }

    function displayLocations(locations) {
        const locationList = document.getElementById('locationList');
        locationList.innerHTML = '';

        locations.forEach(location => {
            const li = document.createElement('li');
            li.textContent = location;
            li.className = selectedLocations.includes(location) ? 'selected' : '';
            li.addEventListener('click', function() {
                toggleLocation(location);
                // Re-display with current filter
                const searchTerm = document.getElementById('locationSearch').value.toLowerCase();
                const filteredLocations = searchTerm === '' 
                    ? allLocations 
                    : allLocations.filter(l => l.toLowerCase().includes(searchTerm));
                displayLocations(filteredLocations);
            });
            locationList.appendChild(li);
        });
    }

    function toggleLocation(location) {
        const index = selectedLocations.indexOf(location);
        if (index > -1) {
            selectedLocations.splice(index, 1);
        } else {
            selectedLocations.push(location);
        }
        updateSelectedLocationsDisplay();
    }

    function updateSelectedLocationsDisplay() {
        const selectedLocationsDiv = document.getElementById('selectedLocations');
        selectedLocationsDiv.innerHTML = '';

        selectedLocations.forEach(location => {
            const tag = document.createElement('span');
            tag.className = 'location-tag';
            tag.innerHTML = `${location} <span class="remove-tag" data-location="${location}">×</span>`;
            selectedLocationsDiv.appendChild(tag);

            tag.querySelector('.remove-tag').addEventListener('click', function() {
                toggleLocation(location);
                // Re-display current filtered results
                const searchTerm = document.getElementById('locationSearch').value.toLowerCase();
                const filteredLocations = searchTerm === ''
                    ? allLocations
                    : allLocations.filter(l => l.toLowerCase().includes(searchTerm));
                displayLocations(filteredLocations);
            });
        });
    }
});

// Export selected locations for use in upload.js
function getSelectedLocations() {
    return selectedLocations;
}
