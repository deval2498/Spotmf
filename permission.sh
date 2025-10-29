# Delete both services to stop costs
gcloud run services delete spot-buyer --region=us-central1 --quiet
gcloud run services delete transaction-monitor --region=us-central1 --quiet

# Delete Cloud Scheduler jobs (if they were created)
gcloud scheduler jobs delete spot-buyer-hourly --location=us-central1 --quiet 2>/dev/null || true
gcloud scheduler jobs delete transaction-monitor-30min --location=us-central1 --quiet 2>/dev/null || true

echo "All Cloud Run services deleted!"