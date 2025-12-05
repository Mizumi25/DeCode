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
        console.log('🔐 Initializing CSRF cookie from /sanctum/csrf-cookie');
        await axios.get('/sanctum/csrf-cookie');
        csrfCookieInitialized = true;
        console.log('✅ CSRF cookie initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize CSRF cookie:', error);
        throw error;
    }
}

// Add request interceptor to ensure CSRF cookie is set
window.axios.interceptors.request.use(
    async (config) => {
        // Only initialize for API routes
        if (config.url?.startsWith('/api/')) {
            console.log('🔍 API request detected, ensuring CSRF cookie:', config.url);
            await ensureCsrfCookie();
        }
        return config;
    },
    (error) => {
        console.error('❌ Interceptor error:', error);
        return Promise.reject(error);
    }
);

// Initialize CSRF cookie immediately on page load
console.log('🚀 Bootstrap.js loaded, initializing CSRF cookie...');
ensureCsrfCookie().catch(err => {
    console.error('❌ Failed to initialize CSRF cookie on load:', err);
});

