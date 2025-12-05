import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Configure axios to work with Laravel Sanctum
window.axios.defaults.withCredentials = true;
window.axios.defaults.withXSRFToken = true;

// Set CSRF token from meta tag
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

// Sanctum CSRF cookie initialization
// This ensures the CSRF cookie is set before making API requests
let csrfCookieInitialized = false;

async function ensureCsrfCookie() {
    if (csrfCookieInitialized) return;
    
    try {
        await axios.get('/sanctum/csrf-cookie');
        csrfCookieInitialized = true;
    } catch (error) {
        console.warn('Failed to initialize CSRF cookie:', error);
    }
}

// Add request interceptor to ensure CSRF cookie is set
window.axios.interceptors.request.use(
    async (config) => {
        // Only initialize for API routes
        if (config.url?.startsWith('/api/')) {
            await ensureCsrfCookie();
        }
        return config;
    },
    (error) => Promise.reject(error)
);

