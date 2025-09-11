  # Use an official PHP runtime as a parent image
  FROM php:8.1-fpm

  # Install system dependencies and PHP extensions
  RUN apt-get update && apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev zip git && \
      docker-php-ext-configure gd --with-freetype --with-jpeg && \
      docker-php-ext-install gd pdo pdo_mysql && \
      apt-get clean && rm -rf /var/lib/apt/lists/*

  # Set the working directory
  WORKDIR /var/www

  # Copy the current directory contents into the container
  COPY . .

  # Install Composer
  RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

  # Install Laravel dependencies
  RUN composer install --no-dev --optimize-autoloader

  # Expose port 9000 and start PHP-FPM server
  EXPOSE 9000
  CMD ["php-fpm"]
