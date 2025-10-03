#!/bin/bash

# SmartIntake AI - Production Deployment Script
# Builds and deploys to Google Cloud Run

echo "🚀 SmartIntake AI - Production Deployment"
echo "========================================"
echo

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Set project
echo "📋 Setting project..."
gcloud config set project handshake-data-playground

# Build Docker image
echo "🏗️  Building Docker image..."
docker build --platform linux/amd64 \
    -t us-central1-docker.pkg.dev/handshake-data-playground/ml-infrastructure/smartintake-ai:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed"
    exit 1
fi

echo "✅ Docker image built successfully"

# Push to Artifact Registry
echo "📤 Pushing to Artifact Registry..."
docker push us-central1-docker.pkg.dev/handshake-data-playground/ml-infrastructure/smartintake-ai:latest

if [ $? -ne 0 ]; then
    echo "❌ Docker push failed"
    exit 1
fi

echo "✅ Image pushed successfully"

# Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run services replace cloud-run-service.yaml --region=us-central1

if [ $? -ne 0 ]; then
    echo "❌ Cloud Run deployment failed"
    exit 1
fi

echo "✅ Deployment successful!"
echo
echo "🎉 SmartIntake AI is now live!"
echo "🔗 URL: https://smartintake-ai-468191624623.us-central1.run.app"
echo
echo "🧪 Test the deployment:"
echo "   curl https://smartintake-ai-468191624623.us-central1.run.app/api/health"
echo








