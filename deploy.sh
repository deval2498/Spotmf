#!/bin/bash

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
NEW_SA="crypto-investment-sa@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Deploying to Google Cloud Run..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Account: $NEW_SA"

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
    --service-account="${NEW_SA}" \
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
    --service-account="${NEW_SA}" \
    --project $PROJECT_ID

echo "Deployment completed!"

echo "Testing database connection in 30 seconds..."
sleep 30
curl https://transaction-monitor-167341936445.us-central1.run.app/test-db