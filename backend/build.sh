#!/bin/bash

# Check if an image name was provided
if [ $# -eq 0 ]; then
    echo "Please provide an image name as an argument."
    exit 1
fi

IMAGE_NAME=$1
PROJECT_ID="mindmeld-backend"

# Build and push the Docker image
echo "Building and pushing image $IMAGE_NAME to Google Container Registry..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$IMAGE_NAME

echo "Image build and push completed."

# Display the full image name
echo "Full image name: gcr.io/$PROJECT_ID/$IMAGE_NAME"