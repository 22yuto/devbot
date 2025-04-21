FROM node:lts-buster-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install