// API integration for Urban AirWatch Platform

/**
 * API cache to store responses
 */
const apiCache = new Map();

/**
 * Fetch air quality data from OpenAQ API
 */
async function fetchAirQualityData(city) {
    const cacheKey = `aqi-${city}`;
    
    // Check cache first
    if (apiCache.has(cacheKey)) {
        const cached = apiCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CONFIG.API.CACHE_DURATION) {
            console.log(`Using cached data for ${city}`);
            return cached.data;
        }
    }
    
    try {
        const url = `${CONFIG.API.OPENAQ_BASE}/latest?city=${encodeURIComponent(city)}&country=IN&limit=100`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);
        
        const response = await fetch(url, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process and cache the response
        const processedData = processAirQualityData(data, city);
        
        apiCache.set(cacheKey, {
            data: processedData,
            timestamp: Date.now()
        });
        
        return processedData;
        
    } catch (error) {
        console.error(`Error fetching data for ${city}:`, error);
        
        // Return simulated data as fallback
        return generateSimulatedData(city);
    }
}

/**
 * Process raw API response
 */
function processAirQualityData(apiResponse, cityName) {
    if (!apiResponse || !apiResponse.results || apiResponse.results.length === 0) {
        return generateSimulatedData(cityName);
    }
    
    const measurements = {};
    const timestamps = [];
    
    // Aggregate measurements from all stations
    apiResponse.results.forEach(station => {
        station.measurements.forEach(measurement => {
            const param = measurement.parameter.toLowerCase();
            
            if (!measurements[param]) {
                measurements[param] = [];
            }
            
            measurements[param].push(measurement.value);
            timestamps.push(measurement.lastUpdated);
        });
    });
    
    // Calculate averages
    const processed = {
        city: cityName,
        timestamp: timestamps.length > 0 ? timestamps[0] : new Date().toISOString()
    };
    
    Object.keys(measurements).forEach(param => {
        const values = measurements[param];
        const average = values.reduce((sum, val) => sum + val, 0) / values.length;
        processed[param] = average;
    });
    
    // Calculate AQI if we have PM2.5 data
    if (processed.pm25) {
        processed.aqi = calculateAQI(processed.pm25);
    } else if (processed.pm10) {
        // Approximate PM2.5 from PM10 if needed
        processed.pm25 = processed.pm10 * 0.5;
        processed.aqi = calculateAQI(processed.pm25);
    } else {
        // Fallback to simulated data
        const simulated = generateSimulatedData(cityName);
        processed.aqi = simulated.aqi;
        processed.pm25 = simulated.pm25;
        processed.pm10 = simulated.pm10;
    }
    
    return processed;
}

/**
 * Fetch data for multiple cities
 */
async function fetchMultipleCities(cities) {
    const promises = cities.map(city => 
        fetchAirQualityData(city.name)
            .then(data => ({
                ...city,
                ...data
            }))
            .catch(error => {
                console.error(`Error fetching ${city.name}:`, error);
                return {
                    ...city,
                    ...generateSimulatedData(city.name)
                };
            })
    );
    
    return Promise.all(promises);
}

/**
 * Fetch data for all configured cities
 */
async function fetchAllCitiesData() {
    console.log(`Fetching data for ${CONFIG.CITIES.length} cities...`);
    
    showLoading();
    
    try {
        // Fetch data in batches to avoid overwhelming the API
        const batchSize = 5;
        const batches = [];
        
        for (let i = 0; i < CONFIG.CITIES.length; i += batchSize) {
            batches.push(CONFIG.CITIES.slice(i, i + batchSize));
        }
        
        const allResults = [];
        
        for (const batch of batches) {
            const batchResults = await fetchMultipleCities(batch);
            allResults.push(...batchResults);
            
            // Small delay between batches
            if (batches.indexOf(batch) < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log(`Successfully fetched data for ${allResults.length} cities`);
        return allResults;
        
    } catch (error) {
        console.error('Error fetching all cities data:', error);
        
        // Return simulated data for all cities as fallback
        return CONFIG.CITIES.map(city => ({
            ...city,
            ...generateSimulatedData(city.name)
        }));
    } finally {
        hideLoading();
    }
}

/**
 * Fetch specific city data
 */
async function fetchCityData(cityName) {
    try {
        const data = await fetchAirQualityData(cityName);
        return data;
    } catch (error) {
        console.error(`Error fetching data for ${cityName}:`, error);
        return generateSimulatedData(cityName);
    }
}

/**
 * Clear API cache
 */
function clearAPICache() {
    apiCache.clear();
    console.log('API cache cleared');
}

/**
 * Get cache statistics
 */
function getCacheStats() {
    return {
        size: apiCache.size,
        entries: Array.from(apiCache.keys())
    };
}