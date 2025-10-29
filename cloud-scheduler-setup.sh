#!/bin/bash

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"

echo "Setting up Cloud Scheduler jobs..."
echo "Project: $PROJECT_ID"
echo "Region: $REGION"

# Enable Cloud Scheduler API if not already enabled
gcloud services enable cloudscheduler.googleapis.com

# Get service URLs
echo "Getting Cloud Run service URLs..."
SPOT_BUYER_URL=$(gcloud run services describe spot-buyer --region=$REGION --format='value(status.url)')
MONITOR_URL=$(gcloud run services describe transaction-monitor --region=$REGION --format='value(status.url)')

if [ -z "$SPOT_BUYER_URL" ]; then
    echo "ERROR: Could not get spot-buyer service URL. Make sure it's deployed first."
    exit 1
fi

if [ -z "$MONITOR_URL" ]; then
    echo "ERROR: Could not get transaction-monitor service URL. Make sure it's deployed first."
    exit 1
fi

echo "Spot Buyer URL: $SPOT_BUYER_URL"
echo "Transaction Monitor URL: $MONITOR_URL"

# Create Spot Buyer scheduled job (every hour)
echo "Creating Spot Buyer scheduled job (every hour)..."
gcloud scheduler jobs create http spot-buyer-hourly \
    --location=$REGION \
    --schedule="0 * * * *" \
    --uri="${SPOT_BUYER_URL}/execute" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{}' \
    --time-zone="UTC" \
    --description="Execute investment strategies every hour" \
    --project=$PROJECT_ID

# Create Transaction Monitor scheduled job (every 30 minutes)
echo "Creating Transaction Monitor scheduled job (every 30 minutes)..."
gcloud scheduler jobs create http transaction-monitor-30min \
    --location=$REGION \
    --schedule="*/30 * * * *" \
    --uri="${MONITOR_URL}/monitor" \
    --http-method=POST \
    --headers="Content-Type=application/json" \
    --message-body='{}' \
    --time-zone="UTC" \
    --description="Monitor transaction confirmations every 30 minutes" \
    --project=$PROJECT_ID

echo ""
echo "✅ Scheduled jobs created successfully!"
echo ""
echo "📋 Summary:"
echo "  • Spot Buyer: Runs every hour (0 * * * *)"
echo "  • Transaction Monitor: Runs every 30 minutes (*/30 * * * *)"
echo ""
echo "🔧 Management commands:"
echo "  • List jobs: gcloud scheduler jobs list --location=$REGION"
echo "  • Pause job: gcloud scheduler jobs pause JOB_NAME --location=$REGION"
echo "  • Resume job: gcloud scheduler jobs resume JOB_NAME --location=$REGION"
echo "  • Run job now: gcloud scheduler jobs run JOB_NAME --location=$REGION"
echo ""
echo "📊 Monitor in Console:"
echo "  https://console.cloud.google.com/cloudscheduler?project=$PROJECT_ID"
echo ""

# Test the jobs by running them once
echo "🧪 Testing jobs by running them once..."
echo "Running Spot Buyer test..."
gcloud scheduler jobs run spot-buyer-hourly --location=$REGION

echo "Running Transaction Monitor test..."
gcloud scheduler jobs run transaction-monitor-30min --location=$REGION

echo ""
echo "✅ Setup completed! Check the logs in Cloud Run to see if the test runs worked."
echo ""
echo "📝 Next steps:"
echo "  1. Check logs: gcloud run services logs read spot-buyer --region=$REGION"
echo "  2. Monitor in console: https://console.cloud.google.com/run?project=$PROJECT_ID"
echo "  3. View scheduler: https://console.cloud.google.com/cloudscheduler?project=$PROJECT_ID"