#!/bin/sh
set -e

cd /var/www/html

[ -f .env ] || cp .env.example .env

[ -f vendor/autoload.php ] || composer install --no-interaction --prefer-dist

grep -q '^APP_KEY=.\+' .env || php artisan key:generate --ansi

php artisan migrate --force

exec "$@"
