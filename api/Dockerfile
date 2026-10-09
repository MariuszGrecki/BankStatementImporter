FROM php:8.4-cli

COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip \
    && rm -rf /var/lib/apt/lists/* \
    && install-php-extensions pdo_pgsql pcntl redis bcmath intl zip

ARG UID=1000
ARG GID=1000
RUN groupadd -g ${GID} app \
    && useradd -m -u ${UID} -g ${GID} app \
    && mkdir -p /var/www/html/vendor \
    && chown -R app:app /var/www/html

COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html
USER app

ENTRYPOINT ["entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000", "--no-reload"]
