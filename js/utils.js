// Utility functions for Urban AirWatch Platform

/**
 * Get AQI category information based on AQI value
 */
function getAQICategory(aqi) {
    for (let category of CONFIG.AQI_CATEGORIES) {
        if (aqi >= category.min && aqi <= category.max) {
            return category;
        }
    }
    return CONFIG.AQI_CATEGORIES[CONFIG.AQI_CATEGORIES.length - 1];
}

/**
 * Calculate AQI from PM2.5 value (Indian AQI calculation)
 */
function calculateAQI(pm25) {
    if (pm25 <= 30) {
        return Math.round((pm25 / 30) * 50);
    } else if (pm25 <= 60) {
        return Math.round(50 + ((pm25 - 30) / 30) * 50);
    } else if (pm25 <= 90) {
        return Math.round(100 + ((pm25 - 60) / 30) * 100);
    } else if (pm25 <= 120) {
        return Math.round(200 + ((pm25 - 90) / 30) * 100);
    } else if (pm25 <= 250) {
        return Math.round(300 + ((pm25 - 120) / 130) * 100);
    } else {
        return Math.round(400 + ((pm25 - 250) / 130) * 100);
    }
}

/**
 * Generate simulated AQI data for a city
 */
function generateSimulatedData(cityName) {
    // Base AQI for different cities (realistic approximations)
    const baseAQI = {
        'Delhi': 180,
        'Mumbai': 120,
        'Bangalore': 90,
        'Hyderabad': 110,
        'Chennai': 95,
        'Kolkata': 130,
        'Pune': 100,
        'Ahmedabad': 140,
        'Jaipur': 150,
        'Lucknow': 160
    };
    
    const base = baseAQI[cityName] || 100;
    const variation = Math.floor(Math.random() * 40) - 20;
    const aqi = Math.max(30, Math.min(500, base + variation));
    
    return {
        aqi: aqi,
        pm25: aqi / 2.5,
        pm10: (aqi / 2.5) * 1.5,
        no2: Math.floor(Math.random() * 60) + 20,
        so2: Math.floor(Math.random() * 30) + 5,
        co: (Math.random() * 2 + 0.5).toFixed(1),
        o3: Math.floor(Math.random() * 100) + 30,
        timestamp: new Date().toISOString(),
        city: cityName
    };
}

/**
 * Format timestamp to readable string
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Format number with proper decimal places
 */
function formatNumber(value, decimals = 1) {
    return Number(value).toFixed(decimals);
}

/**
 * Show loading overlay
 */
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

/**
 * Debounce function to limit execution rate
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate historical trend data (simulated)
 */
function generateTrendData(cityName, days = 7) {
    const currentData = generateSimulatedData(cityName);
    const trend = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const variation = Math.random() * 40 - 20;
        const aqi = Math.max(30, Math.min(500, currentData.aqi + variation));
        
        trend.push({
            date: date.toISOString().split('T')[0],
            aqi: Math.round(aqi),
            pm25: Math.round(aqi / 2.5),
            label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
        });
    }
    
    return trend;
}

/**
 * Create custom marker icon for Leaflet
 */
function createMarkerIcon(aqi) {
    const category = getAQICategory(aqi);
    
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div class="marker-pin" style="background: ${category.color}; box-shadow: 0 0 20px ${category.color};">
            </div>
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                color: white;
                font-weight: bold;
                font-size: 11px;
                text-shadow: 0 1px 3px rgba(0,0,0,0.5);
            ">${aqi}</div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -42]
    });
}

/**
 * Create popup content HTML for marker
 */
function createPopupContent(cityData) {
    const category = getAQICategory(cityData.aqi);
    
    return `
        <div class="popup-header">
            <strong>${cityData.city}</strong>
        </div>
        <div class="popup-body">
            <div class="popup-aqi" style="color: ${category.textColor};">
                ${cityData.aqi} ${category.emoji}
            </div>
            <div class="popup-category" style="background: ${category.color};">
                ${category.label}
            </div>
            <div class="popup-details">
                <strong>PM2.5:</strong> ${formatNumber(cityData.pm25)} µg/m³<br>
                <strong>PM10:</strong> ${formatNumber(cityData.pm10)} µg/m³<br>
                <strong>Updated:</strong> ${formatTimestamp(cityData.timestamp)}
                <strong>CLICK THE MARKER FOR MORE INFO</strong>
            </div>
        </div>
    `;
}

/**
 * Show notification (can be extended with toast library)
 */
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Can be extended with a toast notification library
}

/**
 * Validate and sanitize input
 */
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

/**
 * Get color gradient based on AQI
 */
function getAQIGradient(aqi) {
    const category = getAQICategory(aqi);
    return `linear-gradient(135deg, ${category.color}, ${adjustBrightness(category.color, -20)})`;
}

/**
 * Adjust color brightness
 */
function adjustBrightness(color, amount) {
    const clamp = (num) => Math.min(255, Math.max(0, num));
    const num = parseInt(color.replace('#', ''), 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/**
 * Check if device is mobile
 */
function isMobile() {
    return window.innerWidth <= 768;
}

/**
 * Local storage helper functions
 */
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    },
    
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage error:', e);
            return false;
        }
    }
};