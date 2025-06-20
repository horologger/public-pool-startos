FROM node:20-bookworm-slim AS build

# Public Pool repo does not use versions/tags yet, point directly to commit sha
ARG PUBLIC_POOL_SHA=b971e9ce4ccd23ae98536d57dcf63657ade7919f
ARG PUBLIC_POOL_UI_SHA=00954f46866cc23c1b04d34a13ffb4f2cc8f9bbb

RUN \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    build-essential ca-certificates cmake curl git python3 wget && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /build

RUN \
    git clone https://github.com/benjamin-wilson/public-pool.git && \
    cd public-pool && \
    git checkout ${PUBLIC_POOL_SHA}

RUN \
    cd public-pool && \
    npm ci && \
    npm run build

RUN \
    git clone https://github.com/benjamin-wilson/public-pool-ui.git && \
    cd public-pool-ui && \
    git checkout ${PUBLIC_POOL_UI_SHA}

# patch environment.prod.ts for self-hosting
COPY assets/patches/environment.prod.ts /build/public-pool-ui/src/environments/environment.prod.ts
COPY assets/patches/public-pool-ui.patch /build/public-pool-ui/public-pool-ui.patch

RUN \
    cd public-pool-ui && \
    git apply public-pool-ui.patch && \
    npm ci && \
    npm run build

# main container
FROM node:20-bookworm-slim

ENV NODE_ENV=production

WORKDIR /public-pool

RUN \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    nginx && \
    apt clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY ./assets/nginx.conf /etc/nginx/sites-available/default

COPY --from=build /build/public-pool/node_modules ./node_modules
COPY --from=build /build/public-pool/dist ./dist

WORKDIR /var/www/html
COPY --from=build /build/public-pool-ui/dist/public-pool-ui .
