#!/bin/bash

# Check if an image name was provided
if [ $# -eq 0 ]; then
    echo "Please provide an image name as an argument."
    exit 1
fi

IMAGE_NAME=$1
PROJECT_ID="mindmeld-backend"
REGION="europe-west1"
SERVICE_NAME="mindmeld"

# Check for required secrets
required_secrets=("OPENAI_API_KEY" "DB_USER" "DB_HOST" "DB_NAME" "DB_PASSWORD")
missing_secrets=()

for secret in "${required_secrets[@]}"; do
  if ! gcloud secrets versions access latest --secret="$secret" >/dev/null 2>&1; then
    missing_secrets+=("$secret")
  fi
done

if [ ${#missing_secrets[@]} -ne 0 ]; then
  echo "Error: The following required secrets are missing:"
  for secret in "${missing_secrets[@]}"; do
    echo "- $secret"
  done
  echo "Please create these secrets before running the deployment script."
  exit 1
fi

echo "All required secrets are present. Proceeding with deployment..."
# Deploy the image to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
    --set-secrets=OPENAI_API_KEY=OPENAI_API_KEY:latest,DB_USER=DB_USER:latest,DB_HOST=DB_HOST:latest,DB_NAME=DB_NAME:latest,DB_PASSWORD=DB_PASSWORD:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated

echo "Deployment completed."