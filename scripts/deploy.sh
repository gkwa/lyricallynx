#!/bin/bash

# Get the bucket name from terraform output
BUCKET_NAME=$(terraform output -raw bucket_name)

echo "Deploying website to S3 bucket: $BUCKET_NAME..."
aws s3 cp index.html "s3://${BUCKET_NAME}/index.html" --content-type "text/html"
aws s3 cp error.html "s3://${BUCKET_NAME}/error.html" --content-type "text/html"
aws s3 cp app.js "s3://${BUCKET_NAME}/app.js" --content-type "application/javascript"

# Get the website URL
WEBSITE_URL=$(terraform output -raw website_url)
echo "Your website is available at: $WEBSITE_URL"
