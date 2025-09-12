// import Echo from 'laravel-echo'
// import Pusher from 'pusher-js'

// window.Pusher = Pusher

// window.Echo = new Echo({
//     broadcaster: 'reverb', // Reverb speaks Pusher protocol
//     key: import.meta.env.VITE_REVERB_APP_KEY,
//     cluster: import.meta.env.VITE_REVERB_CLUSTER,
//     wsHost: import.meta.env.VITE_REVERB_HOST,
//     wsPort: import.meta.env.VITE_REVERB_SCHEME === 'https' ? 443 : 80,
//     wssPort: import.meta.env.VITE_REVERB_SCHEME === 'https' ? 443 : 80,
//     forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
//     enabledTransports: ['ws', 'wss'],
//     authEndpoint: '/broadcasting/auth',
//     auth: {
//         headers: {
//             'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
//         },
//     },
// })
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const config = window.REVERB_CONFIG;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: config.key,
    cluster: config.cluster,
    wsHost: config.wsHost,
    wsPort: config.wsPort,
    wssPort: config.wssPort,
    forceTLS: config.forceTLS,
    enabledTransports: ['ws', 'wss'],
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
        }
    }
});
