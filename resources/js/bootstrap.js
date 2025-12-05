import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Configure axios to work with Laravel Sanctum
// Axios will automatically read XSRF-TOKEN cookie and send it as X-XSRF-TOKEN header
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

// Also set CSRF token from meta tag as fallback
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

