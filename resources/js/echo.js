// Real-time collaboration with Echo and Reverb - FULLY ENABLED
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// 🔥 ENHANCED: Multi-environment config with better fallbacks
const config = window.REVERB_CONFIG || {
    key: import.meta.env.VITE_REVERB_APP_KEY || 'app-key',
    cluster: import.meta.env.VITE_REVERB_CLUSTER || 'mt1',
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: parseInt(import.meta.env.VITE_REVERB_PORT) || (window.location.protocol === 'https:' ? 443 : 80),
    wssPort: parseInt(import.meta.env.VITE_REVERB_PORT) || 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || window.location.protocol.replace(':', '')) === 'https',
    encrypted: window.location.protocol === 'https:',
};

console.log('🔗 Initializing Echo with enhanced config:', {
    broadcaster: 'reverb',
    key: config.key ? 'SET' : 'MISSING',
    wsHost: config.wsHost,
    wsPort: config.wsPort,
    wssPort: config.wssPort,
    forceTLS: config.forceTLS,
    encrypted: config.encrypted
});

// 🔥 ENHANCED: Create Echo instance with better error handling
try {
    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: config.key,
        cluster: config.cluster,
        wsHost: config.wsHost,
        wsPort: config.wsPort,
        wssPort: config.wssPort,
        forceTLS: config.forceTLS,
        encrypted: config.encrypted,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: '/broadcasting/auth',
        auth: {
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                'Accept': 'application/json',
            },
        },
    });

    // 🔥 ENHANCED: Connection event listeners with retry logic
    window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Echo connected successfully');
        window.dispatchEvent(new CustomEvent('echo-connected'));
    });

    window.Echo.connector.pusher.connection.bind('disconnected', () => {
        console.warn('⚠️ Echo disconnected - attempting reconnect');
        window.dispatchEvent(new CustomEvent('echo-disconnected'));
        
        // Auto-reconnect after 5 seconds
        setTimeout(() => {
            if (window.Echo.connector.pusher.connection.state !== 'connected') {
                window.Echo.connector.pusher.connect();
            }
        }, 5000);
    });

    window.Echo.connector.pusher.connection.bind('error', (error) => {
        console.error('❌ Echo connection error:', error);
        window.dispatchEvent(new CustomEvent('echo-error', { detail: error }));
    });

    // 🔥 NEW: Global real-time debugging
    window.Echo.connector.pusher.bind_global((eventName, data) => {
        console.log('🔥 Global Echo event:', eventName, data);
    });

    console.log('🚀 Echo initialized successfully');
    
} catch (error) {
    console.error('❌ Failed to initialize Echo:', error);
    
    // 🔥 FALLBACK: Create dummy Echo for development
    window.Echo = {
        channel: () => ({
            listen: () => ({}),
            whisper: () => ({}),
            here: () => ({}),
            joining: () => ({}),
            leaving: () => ({})
        }),
        private: () => ({
            listen: () => ({}),
            whisper: () => ({})
        }),
        join: () => ({
            here: () => ({}),
            joining: () => ({}),
            leaving: () => ({}),
            listen: () => ({}),
            whisper: () => ({})
        }),
        leave: () => ({}),
        disconnect: () => ({})
    };
}
