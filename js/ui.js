// UI management for Urban AirWatch Platform

let trendChart = null;

/**
 * Initialize UI components
 */
function initializeUI() {
    // Toggle sidebar button (mobile)
    const toggleBtn = document.getElementById('toggleSidebar');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    // Toggle hotspots button
    const toggleHotspotsBtn = document.getElementById('toggleHotspots');
    if (toggleHotspotsBtn) {
        toggleHotspotsBtn.addEventListener('click', toggleHotspots);
    }

    const eduDocBtn = document.getElementById('eduDoc');
    if (eduDocBtn) {
        eduDocBtn.addEventListener('click', () => {
            window.location.href='edu.html';
        });
    }

    // Show trends button
    const showTrendsBtn = document.getElementById('showTrends');
    if (showTrendsBtn) {
        showTrendsBtn.addEventListener('click', openTrendsModal);
    }

    // Refresh data button
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
            
            refreshMapData().then(() => {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Data';
            });
        });
    }

    // Trend controls
    const trendCity = document.getElementById('trendCity');
    const trendDuration = document.getElementById('trendDuration');
    
    if (trendCity) {
        trendCity.addEventListener('change', updateTrendChart);
    }
    
    if (trendDuration) {
        trendDuration.addEventListener('change', updateTrendChart);
    }

    console.log('UI initialized successfully');
}

/**
 * Toggle sidebar visibility (mobile)
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

/**
 * Update city list in sidebar
 */
function updateCityList(citiesData) {
    const cityList = document.getElementById('cityList');
    if (!cityList) return;

    // Sort cities by AQI (descending)
    const sortedCities = [...citiesData]
        .sort((a, b) => b.aqi - a.aqi)
        .slice(0, 6); // Show top 6 cities

    cityList.innerHTML = sortedCities.map(city => {
        const category = getAQICategory(city.aqi);
        
        return `
            <div class="city-item aqi-${category.class}" onclick="zoomToCity('${city.name}')">
                <span class="city-name">${city.name}</span>
                <span class="city-aqi" style="color: ${category.textColor};">
                    ${city.aqi}
                </span>
            </div>
        `;
    }).join('');
}

/**
 * Open compare cities modal
 */
function openCompareModal() {
    const modal = document.getElementById('compareModal');
    if (!modal) return;

    const citiesData = getCitiesData();
    const compareGrid = document.getElementById('compareGrid');
    
    if (!compareGrid) return;

    // Show top 6 cities by AQI
    const topCities = [...citiesData]
        .sort((a, b) => b.aqi - a.aqi)
        .slice(0, 6);

    compareGrid.innerHTML = topCities.map(city => {
        const category = getAQICategory(city.aqi);
        
        return `
            <div class="compare-card" style="border-left-color: ${category.color};">
                <div class="compare-city-name">${city.name}</div>
                <div class="compare-aqi-value" style="color: ${category.textColor};">
                    ${city.aqi}
                </div>
                <div class="compare-aqi-label" style="background: ${category.color};">
                    ${category.label}
                </div>
                <div style="margin-top: 15px; font-size: 13px; color: #6b7280;">
                    <strong>PM2.5:</strong> ${formatNumber(city.pm25)} µg/m³<br>
                    <strong>PM10:</strong> ${formatNumber(city.pm10)} µg/m³
                </div>
            </div>
        `;
    }).join('');

    modal.classList.add('active');
}

/**
 * Close compare modal
 */
function closeCompareModal() {
    const modal = document.getElementById('compareModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Open trends modal
 */
function openTrendsModal() {
    const modal = document.getElementById('trendsModal');
    if (!modal) return;

    modal.classList.add('active');
    
    // Initialize or update chart
    setTimeout(() => {
        updateTrendChart();
    }, 100);
}

/**
 * Close trends modal
 */
function closeTrendsModal() {
    const modal = document.getElementById('trendsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/**
 * Update trend chart
 */
function updateTrendChart() {
    const citySelect = document.getElementById('trendCity');
    const durationSelect = document.getElementById('trendDuration');
    
    if (!citySelect || !durationSelect) return;

    const selectedCity = citySelect.value;
    const days = parseInt(durationSelect.value);

    const trendData = generateTrendData(selectedCity, days);
    
    renderTrendChart(trendData, selectedCity);
}

/**
 * Render trend chart using Chart.js
 */
function renderTrendChart(data, cityName) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destroy existing chart
    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.label),
            datasets: [
                {
                    label: 'AQI',
                    data: data.map(d => d.aqi),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'PM2.5',
                    data: data.map(d => d.pm25),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `Air Quality Trends - ${cityName}`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 13,
                            weight: '600'
                        },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y.toFixed(1);
                            if (context.dataset.label === 'PM2.5') {
                                label += ' µg/m³';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value',
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
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

/**
 * Close modals when clicking outside
 */
document.addEventListener('click', function(event) {
    const compareModal = document.getElementById('compareModal');
    const trendsModal = document.getElementById('trendsModal');
    
    if (event.target === compareModal) {
        closeCompareModal();
    }
    
    if (event.target === trendsModal) {
        closeTrendsModal();
    }
});

/**
 * Handle escape key to close modals
 */
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCompareModal();
        closeTrendsModal();
    }
});