// api.config.js
var API_CONFIG = {
  BASE_URL: 'https://mumbailocal.org:8087',
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  }
};

function getBaseUrl() {
  return API_CONFIG.BASE_URL;
}