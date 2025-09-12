# Use PHP 8.3 (Symfony 7.3 compatible)
FROM php:8.3-fpm

# Install system dependencies, PHP extensions, Node.js, and npm
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    git \
    unzip \
    libonig-dev \
    libzip-dev \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd pdo pdo_mysql zip \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install Composer and PHP dependencies
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# Install npm dependencies and build Vite assets
RUN npm install
RUN npm run build

# Ensure permissions for SQLite, storage, cache
RUN chown -R www-data:www-data /var/www/database /var/www/storage /var/www/bootstrap/cache

# Expose Render's dynamic port
EXPOSE 10000

# Start Laravel server and run migrations/seeds
CMD ["sh", "-c", "php artisan migrate:fresh --force --seed && php artisan serve --host=0.0.0.0 --port=$PORT"]
