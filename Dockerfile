FROM richarvey/nginx-php-fpm:3.1.6

# Copy Laravel files from the backend subdirectory
COPY backend/ /var/www/html/
WORKDIR /var/www/html

ENV SKIP_COMPOSER 0
ENV WEBROOT /var/www/html/public
ENV PHP_ERRORS_STDERR 1
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1
ENV APP_ENV production
ENV APP_DEBUG false
ENV LOG_CHANNEL stderr
ENV COMPOSER_ALLOW_SUPERUSER 1

RUN composer install --no-dev --no-interaction --optimize-autoloader
RUN chmod -R 777 storage bootstrap/cache

# Override default nginx configuration
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["/start.sh"]