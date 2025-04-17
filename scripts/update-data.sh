#!/bin/bash
# Script to update the data file daily
# This would typically be run via a cron job

# Get the bucket name from terraform output
BUCKET_NAME=$(terraform output -raw bucket_name)
DATA_SOURCE="https://your-api-endpoint.com/internet-usage"

# Fetch the latest data
echo "Fetching latest data..."
curl -s "$DATA_SOURCE" >latest-data.json

# Upload to S3
echo "Uploading to S3..."
aws s3 cp latest-data.json "s3://${BUCKET_NAME}/data/latest-data.json" --content-type "application/json"

echo "Data update completed at $(date)"
