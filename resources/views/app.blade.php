<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

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
      window.REVERB_CONFIG = {
          key: "{{ config('broadcasting.connections.reverb.key') }}",
          cluster: "{{ config('broadcasting.connections.reverb.cluster') }}",
          host: "{{ config('broadcasting.connections.reverb.host') }}",
          port: {{ config('broadcasting.connections.reverb.port') }},
          scheme: "{{ config('broadcasting.connections.reverb.scheme') }}"
      };
  </script>

</html>
