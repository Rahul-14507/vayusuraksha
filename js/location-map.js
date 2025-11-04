// Location Map - Dynamic map for public-login.html
// Updates map position based on location input field

// Exit early if not on public-login page (prevents conflicts with index.html)
if (!document.getElementById('locationMap')) {
    console.log('Location map not needed on this page');
    // Do nothing, exit the script
} else {
    // Only execute map code if on the correct page
    initMapModule();
}

function initMapModule() {
    let locationMap = null;
    let locationMarker = null;
    let geocodeTimeout = null;
    let lastSearchQuery = ''; // Cache to prevent duplicate searches

    // Default map center (India)
    const DEFAULT_CENTER = [22.5, 79.0];
    const DEFAULT_ZOOM = 5;

/**
 * Initialize the location preview map
 */
function initLocationMap() {
    // Only initialize if we're on the public-login page
    const mapElement = document.getElementById('locationMap');
    if (!mapElement) {
        console.log('Map element not found - skipping initialization');
        return;
    }

    try {
        // Create map instance with reduced tile loading
        locationMap = L.map('locationMap', {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            zoomControl: true,
            scrollWheelZoom: false, // Disable scroll zoom for better UX
            dragging: true,
            touchZoom: true,
            doubleClickZoom: true,
            boxZoom: false,
            preferCanvas: true // Better performance
        });

        // Add tile layer with lower max zoom for faster loading
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 18,
            minZoom: 4
        }).addTo(locationMap);

        // Position zoom control
        locationMap.zoomControl.setPosition('topright');

        console.log('Location map initialized successfully');

        // Set up location input listener
        setupLocationListener();

    } catch (error) {
        console.error('Error initializing location map:', error);
        showMapError('Unable to load map');
    }
}

/**
 * Create custom marker icon
 */
function createCustomIcon() {
    return L.divIcon({
        className: 'custom-location-marker',
        html: `
            <div style="
                background: linear-gradient(135deg, #eb1a13, #e2491a);
                width: 32px;
                height: 32px;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(235, 26, 19, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <i class="fas fa-exclamation" style="
                    color: white;
                    font-size: 14px;
                    transform: rotate(45deg);
                    margin-left: -1px;
                    margin-top: -3px;
                "></i>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
}

/**
 * Set up listener for location input field
 */
function setupLocationListener() {
    const locationInput = document.getElementById('location');
    
    if (!locationInput) {
        console.error('Location input field not found');
        return;
    }

    // Listen for input changes with debouncing
    locationInput.addEventListener('input', function(e) {
        const location = e.target.value.trim();
        
        // Clear previous timeout
        if (geocodeTimeout) {
            clearTimeout(geocodeTimeout);
        }

        // Update status
        updateMapStatus('Searching...', 'searching');

        // Debounce geocoding request (wait 800ms after user stops typing)
        geocodeTimeout = setTimeout(() => {
            if (location.length >= 3) {
                geocodeLocation(location);
            } else if (location.length === 0) {
                resetMap();
            }
        }, 800);
    });

    // Also listen for Enter key
    locationInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const location = e.target.value.trim();
            if (location.length >= 3) {
                if (geocodeTimeout) {
                    clearTimeout(geocodeTimeout);
                }
                geocodeLocation(location);
            }
        }
    });
}

/**
 * Geocode location using Nominatim API
 * @param {string} location - Location string to geocode
 */
async function geocodeLocation(location) {
    // Prevent duplicate searches
    if (location === lastSearchQuery) {
        console.log('Skipping duplicate search');
        return;
    }
    
    lastSearchQuery = location;

    try {
        // Update status
        updateMapStatus('Locating...', 'searching');

        // Build Nominatim API URL
        const query = encodeURIComponent(`${location}, India`);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=in`;

        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'VayuSuraksha/1.0'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Geocoding request failed');
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lon = parseFloat(result.lon);
            const displayName = result.display_name;

            // Update map with new location
            updateMapLocation(lat, lon, displayName);
            updateMapStatus(`Found: ${result.name || location}`, 'success');
        } else {
            // Location not found
            updateMapStatus('Location not found. Try another search.', 'error');
            console.warn('No results found for:', location);
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('Geocoding timeout');
            updateMapStatus('Search timed out. Try again.', 'error');
        } else {
            console.error('Geocoding error:', error);
            updateMapStatus('Unable to locate. Check your connection.', 'error');
        }
    }
}

/**
 * Update map to show new location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} displayName - Location display name
 */
function updateMapLocation(lat, lon, displayName) {
    if (!locationMap) return;

    // Remove existing marker if present
    if (locationMarker && locationMap.hasLayer(locationMarker)) {
        locationMap.removeLayer(locationMarker);
    }

    // Create new marker at location
    locationMarker = L.marker([lat, lon], {
        icon: createCustomIcon(),
        draggable: false
    }).addTo(locationMap);

    // Add popup with location name
    locationMarker.bindPopup(`
        <div style="text-align: center; padding: 5px;">
            <strong style="color: #eb1a13;">Report Location</strong><br>
            <span style="font-size: 12px; color: #4a5568;">${displayName}</span>
        </div>
    `).openPopup();

    // Animate map to new location
    locationMap.flyTo([lat, lon], 12, {
        duration: 1.5,
        easeLinearity: 0.5
    });
}

/**
 * Reset map to default view
 */
function resetMap() {
    if (!locationMap) return;

    // Remove marker
    if (locationMarker && locationMap.hasLayer(locationMarker)) {
        locationMap.removeLayer(locationMarker);
    }

    // Reset view to India
    locationMap.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, {
        duration: 1.5
    });

    // Update status
    updateMapStatus('Type a location to preview on map', 'default');
}

/**
 * Update map status message
 * @param {string} message - Status message
 * @param {string} type - Status type (default, searching, success, error)
 */
function updateMapStatus(message, type = 'default') {
    const statusEl = document.getElementById('mapStatus');
    if (!statusEl) return;

    const iconMap = {
        default: 'info-circle',
        searching: 'spinner fa-spin',
        success: 'check-circle',
        error: 'exclamation-triangle'
    };

    const colorMap = {
        default: '#cbd5e0',
        searching: '#3b82f6',
        success: '#10b981',
        error: '#ef4444'
    };

    statusEl.innerHTML = `
        <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
        <span>${message}</span>
    `;
    statusEl.style.color = colorMap[type] || '#cbd5e0';
}

/**
 * Show map error
 * @param {string} message - Error message
 */
function showMapError(message) {
    const mapContainer = document.getElementById('locationMap');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #ef4444;
                flex-direction: column;
                gap: 10px;
            ">
                <i class="fas fa-exclamation-circle" style="font-size: 32px;"></i>
                <span style="font-size: 14px;">${message}</span>
            </div>
        `;
    }
}

/**
 * Initialize map when DOM is ready
 */
function startMapInitialization() {
    document.addEventListener('DOMContentLoaded', function() {
        // Only initialize if on public-login page
        if (document.getElementById('locationMap')) {
            // Delay initialization to not block page load
            setTimeout(initLocationMap, 500);
        }
    });
}

// Start the initialization
startMapInitialization();

} // End of initMapModule