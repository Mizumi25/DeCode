<?php

namespace App\Console\Commands;

use Illuminate\Foundation\Console\ServeCommand as BaseServeCommand;

class ServeWithSystemPhp extends BaseServeCommand
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'serve:system
                            {--host=127.0.0.1 : The host address to serve the application on}
                            {--port=8000 : The port to serve the application on}
                            {--tries=10 : The number of times to attempt to find an available port}
                            {--no-reload : Do not reload the development server on .env file changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Serve the application using system PHP with GD extension';

    /**
     * Get the full server command using system PHP.
     *
     * @return array
     */
    protected function serverCommand()
    {
        $server = file_exists(base_path('server.php'))
            ? base_path('server.php')
            : __DIR__.'/../../../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php';

        // Use system PHP (which is php8.4 with GD extension)
        // Using 'php' instead of hardcoded path for better compatibility
        return [
            'php',
            '-S',
            $this->host().':'.$this->port(),
            $server,
        ];
    }
}
