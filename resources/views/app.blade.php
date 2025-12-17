<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title inertia>{{ config('app.name', 'DeCode') }}</title>
        
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead
        
        <!-- 🔥 Aggressive mobile zoom prevention -->
        <style>
            /* Prevent zoom on all input elements */
            input, select, textarea, button {
                font-size: 16px !important;
            }
            
            /* Monaco Editor specific anti-zoom */
            .monaco-editor {
                touch-action: manipulation !important;
                -webkit-touch-callout: none !important;
            }
            
            .monaco-editor .view-lines,
            .monaco-editor input,
            .monaco-editor textarea {
                font-size: 16px !important;
                min-height: 44px !important; /* iOS minimum touch target */
            }
            
            /* Force all text inputs to 16px minimum */
            * {
                -webkit-text-size-adjust: 100% !important;
                -moz-text-size-adjust: 100% !important;
                -ms-text-size-adjust: 100% !important;
                text-size-adjust: 100% !important;
            }
            
            /* Additional touch prevention */
            @media screen and (max-device-width: 480px), screen and (max-device-height: 480px) {
                * {
                    -webkit-text-size-adjust: none !important;
                    -webkit-user-zoom: fixed !important;
                }
            }
        </style>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
    
<script>
    @if(config('app.env') === 'production')
        // Production: Use VITE_ variables (client-side domain)
        window.REVERB_CONFIG = {
            key: "{{ env('VITE_REVERB_APP_KEY') }}",
            cluster: "{{ env('VITE_REVERB_CLUSTER', 'mt1') }}",
            wsHost: "{{ env('VITE_REVERB_HOST') }}",
            wsPort: {{ env('VITE_REVERB_PORT', 443) }},
            wssPort: {{ env('VITE_REVERB_PORT', 443) }},
            forceTLS: "{{ env('VITE_REVERB_SCHEME', 'https') }}" === 'https'
        };
    @else
        // Local: Use REVERB_ variables (localhost)
        window.REVERB_CONFIG = {
            key: "{{ env('REVERB_APP_KEY') }}",
            cluster: "{{ env('REVERB_CLUSTER', 'mt1') }}",
            wsHost: "{{ env('REVERB_HOST', '127.0.0.1') }}",
            wsPort: {{ env('REVERB_PORT', 8080) }},
            wssPort: {{ env('REVERB_PORT', 8080) }},
            forceTLS: false
        };
    @endif
    
    // 🔥 Aggressive zoom prevention for Monaco Editor
    document.addEventListener('DOMContentLoaded', function() {
        // Prevent zoom on Monaco Editor focus
        function preventZoomOnFocus() {
            const monacoElements = document.querySelectorAll('.monaco-editor input, .monaco-editor textarea, .view-lines');
            monacoElements.forEach(element => {
                element.addEventListener('touchstart', function(e) {
                    // Set font size before focus
                    this.style.fontSize = '16px';
                    this.style.setProperty('font-size', '16px', 'important');
                });
                
                element.addEventListener('focus', function(e) {
                    // Ensure 16px on focus
                    this.style.fontSize = '16px';
                    this.style.setProperty('font-size', '16px', 'important');
                });
            });
        }
        
        // Run immediately and on mutations (when Monaco loads)
        preventZoomOnFocus();
        
        const observer = new MutationObserver(function(mutations) {
            preventZoomOnFocus();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
</script>


</html>
