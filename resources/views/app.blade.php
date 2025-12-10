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
</script>


</html>
