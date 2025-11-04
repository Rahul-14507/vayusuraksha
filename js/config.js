// Configuration file for Urban AirWatch Platform

const CONFIG = {
    // API Configuration
    API: {
        OPENAQ_BASE: 'https://api.openaq.org/v2',
        TIMEOUT: 10000,
        CACHE_DURATION: 300000, // 5 minutes
        RETRY_ATTEMPTS: 2
    },

    // Map Configuration
    MAP: {
        CENTER: [22.5, 79.0], // India center coordinates
        ZOOM: 5,
        MIN_ZOOM: 4,
        MAX_ZOOM: 12,
        TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },

    // Major Indian Cities with Coordinates
    CITIES: [
        { name: 'Delhi', lat: 28.6139, lon: 77.2090, state: 'Delhi' },
        { name: 'Mumbai', lat: 19.0760, lon: 72.8777, state: 'Maharashtra' },
        { name: 'Bangalore', lat: 12.9716, lon: 77.5946, state: 'Karnataka' },
        { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, state: 'Telangana' },
        { name: 'Chennai', lat: 13.0827, lon: 80.2707, state: 'Tamil Nadu' },
        { name: 'Kolkata', lat: 22.5726, lon: 88.3639, state: 'West Bengal' },
        { name: 'Pune', lat: 18.5204, lon: 73.8567, state: 'Maharashtra' },
        { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, state: 'Gujarat' },
        { name: 'Jaipur', lat: 26.9124, lon: 75.7873, state: 'Rajasthan' },
        { name: 'Lucknow', lat: 26.8467, lon: 80.9462, state: 'Uttar Pradesh' },
        { name: 'Chandigarh', lat: 30.7333, lon: 76.7794, state: 'Punjab' },
        { name: 'Bhopal', lat: 23.2599, lon: 77.4126, state: 'Madhya Pradesh' },
        { name: 'Patna', lat: 25.5941, lon: 85.1376, state: 'Bihar' },
        { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, state: 'Andhra Pradesh' },
        { name: 'Guwahati', lat: 26.1445, lon: 91.7362, state: 'Assam' },
        { name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245, state: 'Odisha' },
        { name: 'Thiruvananthapuram', lat: 8.5241, lon: 76.9366, state: 'Kerala' },
        { name: 'Raipur', lat: 21.2514, lon: 81.6296, state: 'Chhattisgarh' },
        { name: 'Ranchi', lat: 23.3441, lon: 85.3096, state: 'Jharkhand' },
        { name: 'Shimla', lat: 31.1048, lon: 77.1734, state: 'Himachal Pradesh' }
    ],

    // AQI Thresholds and Categories
    AQI_CATEGORIES: [
        {
            min: 0,
            max: 50,
            label: 'Good',
            color: '#00e400',
            textColor: '#00e400',
            class: 'good',
            description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
            emoji: '😊'
        },
        {
            min: 51,
            max: 100,
            label: 'Satisfactory',
            color: '#ffff00',
            textColor: '#d4d400',
            class: 'satisfactory',
            description: 'Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion.',
            emoji: '🙂'
        },
        {
            min: 101,
            max: 200,
            label: 'Moderate',
            color: '#ff7e00',
            textColor: '#ff7e00',
            class: 'moderate',
            description: 'Members of sensitive groups may experience health effects.',
            emoji: '😐'
        },
        {
            min: 201,
            max: 300,
            label: 'Poor',
            color: '#ff0000',
            textColor: '#ff0000',
            class: 'poor',
            description: 'Everyone may begin to experience health effects.',
            emoji: '😷'
        },
        {
            min: 301,
            max: 400,
            label: 'Very Poor',
            color: '#8f3f97',
            textColor: '#8f3f97',
            class: 'very-poor',
            description: 'Health alert: The risk of health effects is increased for everyone.',
            emoji: '😨'
        },
        {
            min: 401,
            max: 999,
            label: 'Severe',
            color: '#7e0023',
            textColor: '#7e0023',
            class: 'severe',
            description: 'Health warning of emergency conditions: everyone is more likely to be affected.',
            emoji: '☠️'
        }
    ],

    // UI Settings
    UI: {
        AUTO_REFRESH_INTERVAL: 300000, // 5 minutes
        ANIMATION_DURATION: 300,
        NOTIFICATION_DURATION: 3000
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}