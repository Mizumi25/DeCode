// @/app.jsx
import '../css/app.css';
import './bootstrap';
import './echo';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'DeCode';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        // ✅ ADD: Cleanup any existing Echo channels before render
        if (window.Echo?.connector?.channels) {
            Object.keys(window.Echo.connector.channels).forEach(channelName => {
                try {
                    window.Echo.leave(channelName);
                } catch (e) {
                    // Ignore errors
                }
            });
        }
        
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});