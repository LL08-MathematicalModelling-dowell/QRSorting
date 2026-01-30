#!/bin/bash
# deploy.sh

echo "Stopping existing containers..."
docker-compose down

echo "Pulling latest changes..."
git pull origin main  # or your branch

echo "Building and starting containers..."
docker-compose up -d --build

echo "Checking container status..."
docker-compose ps

echo "Checking logs..."
docker-compose logs -f --tail=50