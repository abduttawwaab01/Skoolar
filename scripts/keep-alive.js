// Keep-alive script to prevent the application from sleeping
// This script pings the application every 4 minutes to keep it awake

const fetch = require('node-fetch');
const INTERVAL_MINUTES = 4; // Ping every 4 minutes (most platforms sleep after 5-15 minutes of inactivity)
const APP_URL = process.env.APP_URL || 'https://skoolar.org';

function pingApp() {
  fetch(`${APP_URL}/api/health`, {
    method: 'GET',
    headers: {
      'User-Agent': 'Skoolar Keep-Alive Bot 1.0'
    }
  })
  .then(response => {
    if (response.ok) {
      console.log(`[${new Date().toISOString()}] Keep-alive ping successful`);
    } else {
      console.warn(`[${new Date().toISOString()}] Keep-alive ping failed with status: ${response.status}`);
    }
  })
  .catch(error => {
    console.error(`[${new Date().toISOString()}] Keep-alive ping error:`, error.message);
  });
}

// Start the keep-alive service
console.log(`Starting keep-alive service for ${APP_URL}`);
console.log(`Pinging every ${INTERVAL_MINUTES} minutes to prevent sleeping`);

// Initial ping
pingApp();

// Set up periodic ping
setInterval(pingApp, INTERVAL_MINUTES * 60 * 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Stopping keep-alive service...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Stopping keep-alive service...');
  process.exit(0);
});