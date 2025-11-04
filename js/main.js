// Main entry point for Urban AirWatch Platform

/**
 * Initialize the application
 */
async function initApp() {
    console.log('Initializing Urban AirWatch Platform...');
    
    try {
        // Initialize map
        initializeMap();
        
        // Initialize UI
        initializeUI();
        
        // Fetch and display initial data
        await refreshMapData();
        
        // Start auto-refresh
        startAutoRefresh();
        
        console.log('Urban AirWatch Platform initialized successfully');
        
    } catch (error) {
        console.error('Error initializing application:', error);
        showNotification('Error initializing application', 'error');
    }
}

/**
 * Start the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', initApp);