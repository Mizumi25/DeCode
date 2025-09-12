# Use PHP 8.3 (meets Symfony 7.3 requirements)
FROM php:8.3-fpm

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    git \
    unzip \
    libonig-dev \
    libzip-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /var/www

# Copy current directory
COPY . .

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install Laravel dependencies
RUN composer install --no-dev --optimize-autoloader

# Ensure permissions for SQLite, storage, cache
RUN chown -R www-data:www-data /var/www/database /var/www/storage /var/www/bootstrap/cache

# Start Laravel's built-in server with dynamic Render port
CMD ["sh", "-c", "php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=$PORT"]
