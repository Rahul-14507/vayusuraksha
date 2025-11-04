// State Detail Page JavaScript

let trendChart = null;
let pollutantChart = null;

/**
 * Initialize state page
 */
function initStatePage() {
    // Get state name from URL
    const urlParams = new URLSearchParams(window.location.search);
    const stateName = urlParams.get('name') || 'Unknown State';
    
    // Update page title
    document.getElementById('stateName').textContent = stateName;
    document.title = `${stateName} - Air Quality Details`;
    
    // Load state data
    loadStateData(stateName);
}

/**
 * Load and display state air quality data
 */
async function loadStateData(stateName) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const contentArea = document.getElementById('contentArea');
    
    try {
        console.log(`Loading data for ${stateName}...`);
        
        // Fetch state details
        const stateData = await fetchStateDetails(stateName);
        
        // Display data
        displayAQIHero(stateData);
        displayPollutantDetails(stateData);
        displayHealthRecommendations(stateData);
        
        // Create charts
        createTrendChart(stateName, stateData);
        createPollutantChart(stateData);
        
        // Update timestamp
        document.getElementById('lastUpdate').textContent = 
            `Last updated: ${formatTimestamp(stateData.timestamp)}`;
        
        // Show content
        loadingIndicator.style.display = 'none';
        contentArea.style.display = 'block';
        
        console.log('State data loaded successfully');
        
    } catch (error) {
        console.error('Error loading state data:', error);
        
        // Show error message
        loadingIndicator.innerHTML = `
            <div class="error">
                <h2>⚠️ Error Loading Data</h2>
                <p>Unable to fetch air quality data for ${stateName}. Please try again later.</p>
                <a href="index.html" class="back-btn">Return to Map</a>
            </div>
        `;
    }
}

/**
 * Display AQI hero section
 */
function displayAQIHero(data) {
    const aqiValue = document.getElementById('aqiValue');
    const aqiCategory = document.getElementById('aqiCategory');
    const aqiDescription = document.getElementById('aqiDescription');
    const aqiHero = document.getElementById('aqiHero');
    
    const category = getAQICategory(data.aqi);
    
    aqiValue.textContent = data.aqi;
    aqiCategory.textContent = category.label;
    aqiDescription.textContent = category.description;
    
    // Update hero background color
    aqiHero.style.background = `linear-gradient(135deg, ${category.color} 0%, ${adjustColor(category.color, -30)} 100%)`;
}

/**
 * Display detailed pollutant information
 */
function displayPollutantDetails(data) {
    const pollutantGrid = document.getElementById('pollutantGrid');
    
    const pollutants = [
        { 
            name: 'PM2.5', 
            value: data.pm25 || 0, 
            unit: 'µg/m³', 
            icon: '🔴',
            threshold: { good: 30, moderate: 60, poor: 90 }
        },
        { 
            name: 'PM10', 
            value: data.pm10 || 0, 
            unit: 'µg/m³', 
            icon: '🟠',
            threshold: { good: 50, moderate: 100, poor: 250 }
        },
        { 
            name: 'NO₂', 
            value: data.no2 || 0, 
            unit: 'µg/m³', 
            icon: '🟡',
            threshold: { good: 40, moderate: 80, poor: 180 }
        },
        { 
            name: 'SO₂', 
            value: data.so2 || 0, 
            unit: 'µg/m³', 
            icon: '🟢',
            threshold: { good: 40, moderate: 80, poor: 380 }
        },
        { 
            name: 'CO', 
            value: data.co || 0, 
            unit: 'mg/m³', 
            icon: '⚫',
            threshold: { good: 1, moderate: 2, poor: 10 }
        },
        { 
            name: 'O₃', 
            value: data.o3 || 0, 
            unit: 'µg/m³', 
            icon: '🔵',
            threshold: { good: 50, moderate: 100, poor: 168 }
        }
    ];
    
    pollutantGrid.innerHTML = pollutants.map(pollutant => {
        const status = getPollutantStatus(pollutant.value, pollutant.threshold);
        return `
            <div class="pollutant-card">
                <div class="pollutant-icon">${pollutant.icon}</div>
                <div class="pollutant-name">${pollutant.name}</div>
                <div class="pollutant-value">${formatNumber(pollutant.value)}</div>
                <div class="pollutant-unit">${pollutant.unit}</div>
                <div class="pollutant-status status-${status.class}">${status.label}</div>
            </div>
        `;
    }).join('');
}

/**
 * Get pollutant status based on thresholds
 */
function getPollutantStatus(value, threshold) {
    if (value <= threshold.good) {
        return { class: 'good', label: 'Good' };
    } else if (value <= threshold.moderate) {
        return { class: 'moderate', label: 'Moderate' };
    } else {
        return { class: 'poor', label: 'Poor' };
    }
}

/**
 * Display health recommendations
 */
function displayHealthRecommendations(data) {
    const recList = document.getElementById('recList');
    const category = getAQICategory(data.aqi);
    
    recList.innerHTML = category.recommendations
        .map(rec => `<li>${rec}</li>`)
        .join('');
}

/**
 * Create PM2.5 trend chart
 */
function createTrendChart(stateName, currentData) {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    // Get historical data
    const historicalData = fetchHistoricalData(stateName, 7);
    
    // Destroy existing chart if it exists
    if (trendChart) {
        trendChart.destroy();
    }
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicalData.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            }),
            datasets: [{
                label: 'PM2.5 (µg/m³)',
                data: historicalData.map(d => d.pm25),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#667eea',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            return `PM2.5: ${context.parsed.y.toFixed(1)} µg/m³`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'PM2.5 Level (µg/m³)',
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Create pollutant comparison chart
 */
function createPollutantChart(data) {
    const ctx = document.getElementById('pollutantChart');
    if (!ctx) return;
    
    const pollutantData = [
        { name: 'PM2.5', value: data.pm25 || 0 },
        { name: 'PM10', value: data.pm10 || 0 },
        { name: 'NO₂', value: data.no2 || 0 },
        { name: 'SO₂', value: data.so2 || 0 },
        { name: 'CO', value: (data.co || 0) * 10 }, // Scale CO for visibility
        { name: 'O₃', value: data.o3 || 0 }
    ];
    
    // Destroy existing chart if it exists
    if (pollutantChart) {
        pollutantChart.destroy();
    }
    
    pollutantChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: pollutantData.map(p => p.name),
            datasets: [{
                label: 'Concentration',
                data: pollutantData.map(p => p.value),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(255, 159, 64, 0.8)',
                    'rgba(255, 205, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(153, 102, 255, 0.8)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)'
                ],
                borderWidth: 2,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let value = context.parsed.y;
                            let unit = 'µg/m³';
                            if (context.label === 'CO') {
                                value = value / 10; // Unscale CO
                                unit = 'mg/m³';
                            }
                            return `${context.label}: ${value.toFixed(1)} ${unit}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Concentration (µg/m³)',
                        font: {
                            size: 13,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

/**
 * Adjust color brightness
 */
function adjustColor(color, amount) {
    const clamp = (num) => Math.min(255, Math.max(0, num));
    const num = parseInt(color.replace('#', ''), 16);
    const r = clamp((num >> 16) + amount);
    const g = clamp(((num >> 8) & 0x00FF) + amount);
    const b = clamp((num & 0x0000FF) + amount);
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initStatePage);