
 // Frontend Configuration
 // Fetches configuration from backend (.env file)

window.CONFIG_LOADED = false;

(async function () {
  try {
    const response = await fetch('http://localhost:3000/config');
    const data = await response.json();

    if (data.success && data.googleMapsApiKey) {
      window.GOOGLE_MAPS_API_KEY = data.googleMapsApiKey;
      window.CONFIG_LOADED = true;
      console.log('[Config] ✓ Google Maps API Key loaded');
    } else {
      console.warn('[Config] Warning: No API key found in server response');
      window.GOOGLE_MAPS_API_KEY = '';
      window.CONFIG_LOADED = true;
    }
  } catch (err) {
    console.error('[Config] Error fetching configuration:', err);
    window.GOOGLE_MAPS_API_KEY = '';
    window.CONFIG_LOADED = true;
  }
})();