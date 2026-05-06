#!/usr/bin/env bash

echo "Running composer install (if needed)..."
composer install --no-dev --no-interaction --optimize-autoloader

echo "Generating application key if missing..."
php artisan key:generate --force

echo "Caching configuration..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Caching views..."
php artisan view:cache

echo "Running migrations (if any, force run)..."
php artisan migrate --force

echo "Deployment complete."
