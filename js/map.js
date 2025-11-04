// Map management for Urban AirWatch Platform

let map;
let markers = [];
let markersVisible = true;
let citiesData = [];

/**
 * Initialize the Leaflet map
 */
function initializeMap() {
    // Create map instance
    map = L.map('map', {
        center: CONFIG.MAP.CENTER,
        zoom: CONFIG.MAP.ZOOM,
        minZoom: CONFIG.MAP.MIN_ZOOM,
        maxZoom: CONFIG.MAP.MAX_ZOOM,
        zoomControl: true
    });

    // Add tile layer
    L.tileLayer(CONFIG.MAP.TILE_LAYER, {
        attribution: CONFIG.MAP.ATTRIBUTION,
        maxZoom: 19
    }).addTo(map);

    // Position zoom control
    map.zoomControl.setPosition('bottomright');

    console.log('Map initialized successfully');
}

/**
 * Add city markers to the map
 */
function addCityMarkers(citiesData) {
    // Clear existing markers
    clearMarkers();
    
    citiesData.forEach(cityData => {
        const marker = L.marker([cityData.lat, cityData.lon], {
            icon: createMarkerIcon(cityData.aqi),
            title: cityData.name
        });

        // Create popup
        const popupContent = createPopupContent(cityData);
        marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-popup'
        });

        // Add click event - redirect to state.html with state name
        marker.on('click', function() {
            console.log(`Clicked on ${cityData.name} - Redirecting to state page`);
            // Redirect to state.html with state name as parameter
            window.location.href = `state.html?name=${encodeURIComponent(cityData.state)}`;
        });

        // Add to map
        marker.addTo(map);
        markers.push(marker);
    });

    console.log(`Added ${markers.length} markers to map`);
}

/**
 * Clear all markers from the map
 */
function clearMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
}

/**
 * Toggle hotspot markers visibility
 */
function toggleHotspots() {
    markersVisible = !markersVisible;
    
    markers.forEach(marker => {
        if (markersVisible) {
            marker.addTo(map);
        } else {
            map.removeLayer(marker);
        }
    });
    
    const button = document.getElementById('toggleHotspots');
    if (button) {
        button.innerHTML = markersVisible 
            ? '<i class="fas fa-map-marker-alt"></i> Hide Hotspots'
            : '<i class="fas fa-map-marker-alt"></i> Show Hotspots';
    }
    
    showNotification(
        markersVisible ? 'Hotspots visible' : 'Hotspots hidden',
        'info'
    );
}

/**
 * Show city details in popup
 */
function showCityDetails(cityData) {
    const category = getAQICategory(cityData.aqi);
    
    // You can extend this to show a modal or sidebar with more details
    console.log('City Details:', cityData);
}

/**
 * Refresh map data
 */
async function refreshMapData() {
    showLoading();
    
    try {
        citiesData = await fetchAllCitiesData();
        addCityMarkers(citiesData);
        updateCityList(citiesData);
        showNotification('Data refreshed successfully', 'success');
    } catch (error) {
        console.error('Error refreshing map data:', error);
        showNotification('Error refreshing data', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Zoom to specific city
 */
function zoomToCity(cityName) {
    const cityData = citiesData.find(city => city.name === cityName);
    
    if (cityData) {
        map.setView([cityData.lat, cityData.lon], 10, {
            animate: true,
            duration: 1
        });
        
        // Find and open the marker popup
        const marker = markers.find(m => m.options.title === cityName);
        if (marker) {
            marker.openPopup();
        }
    }
}

/**
 * Get cities data
 */
function getCitiesData() {
    return citiesData;
}

/**
 * Auto-refresh map data periodically
 */
function startAutoRefresh() {
    setInterval(() => {
        console.log('Auto-refreshing map data...');
        refreshMapData();
    }, CONFIG.UI.AUTO_REFRESH_INTERVAL);
}

/**
 * Fit map bounds to show all markers
 */
function fitMapToMarkers() {
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), {
            padding: [50, 50]
        });
    }
}