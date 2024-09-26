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
SECRET_NAME="OPENAI_API_KEY"

# Check if the secret exists, if not, create it
if ! gcloud secrets describe $SECRET_NAME &>/dev/null; then
    echo "Secret $SECRET_NAME does not exist. Creating it now..."
    gcloud secrets create $SECRET_NAME --replication-policy="automatic"
    
    # Prompt for the secret value
    read -sp "Enter the value for $SECRET_NAME: " secret_value
    echo
    
    # Add the secret value
    echo -n "$secret_value" | gcloud secrets versions add $SECRET_NAME --data-file=-
    echo "Secret $SECRET_NAME created and value set."
else
    echo "Secret $SECRET_NAME already exists."
fi

# Deploy the image to Cloud Run
echo "Deploying image $IMAGE_NAME to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
    --set-secrets=$SECRET_NAME=$SECRET_NAME:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated

echo "Deployment completed."