#!/bin/bash

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"

echo "Deploying to Google Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"

# Deploy Spot Buyer Service
echo "Building and deploying Spot Buyer..."
gcloud run deploy spot-buyer \
    --source ./spot-buyer \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 900 \
    --max-instances 10 \
    --project $PROJECT_ID

# Deploy Transaction Monitor Service  
echo "Building and deploying Transaction Monitor..."
gcloud run deploy transaction-monitor \
    --source ./transaction-monitor \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --timeout 900 \
    --max-instances 5 \
    --project $PROJECT_ID

echo "Deployment completed!"