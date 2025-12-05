#!/bin/bash

# Configuration
PROJECT_ID="gen-media-veo-test"
REGION="us-central1"
SERVICE_NAME="mc-social-hub"
REPO_NAME="mc-social-repo"
IMAGE_NAME="mc-social-hub-image"
DB_INSTANCE_NAME="mc-social-db-instance"
DB_NAME="mc_social_db"
DB_USER="postgres"
DB_PASS="changeme123" # In prod, use Secret Manager!
BUCKET_NAME="mc-social-assets-$PROJECT_ID"
SERVICE_ACCOUNT_EMAIL="gmpro-service-account@gen-media-veo-test.iam.gserviceaccount.com"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting Deployment for $SERVICE_NAME...${NC}"

# 0. Set Project
gcloud config set project $PROJECT_ID

# 1. Setup Cloud SQL
echo -e "${YELLOW}Checking Cloud SQL Instance...${NC}"
INSTANCE_STATUS=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(state)" 2>/dev/null)

if [ "$INSTANCE_STATUS" != "RUNNABLE" ]; then
    echo "Instance not ready (Status: $INSTANCE_STATUS). Waiting for creation to finish..."
    echo "This can take 5-10 minutes. Grab a coffee! ☕"
    until gcloud sql instances describe $DB_INSTANCE_NAME --format="value(state)" 2>/dev/null | grep -q "RUNNABLE"; do
        echo -n "."
        sleep 10
    done
    echo -e "\n${GREEN}Cloud SQL Instance is Ready!${NC}"
fi

CONNECTION_NAME=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(connectionName)")
echo "Connection Name: $CONNECTION_NAME"

# Create DB if not exists
echo "Checking Database..."
if ! gcloud sql databases list --instance=$DB_INSTANCE_NAME | grep -q $DB_NAME; then
    echo "Creating database $DB_NAME..."
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME
else
    echo "Database $DB_NAME exists."
fi

# 2. Setup GCS Bucket
echo -e "${YELLOW}Checking GCS Bucket...${NC}"
if ! gcloud storage buckets list gs://$BUCKET_NAME 2>/dev/null | grep -q $BUCKET_NAME; then
    echo "Creating bucket $BUCKET_NAME..."
    gcloud storage buckets create gs://$BUCKET_NAME --location=$REGION
    gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME --member=allUsers --role=roles/storage.objectViewer
else
    echo "Bucket $BUCKET_NAME exists."
fi

# 3. Build & Push Image
echo -e "${YELLOW}Building Docker Image...${NC}"
# Ensure repo exists
if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION 2>/dev/null; then
    echo "Creating Artifact Registry Repository..."
    gcloud artifacts repositories create $REPO_NAME --repository-format=docker --location=$REGION --description="MC Social Hub Repo"
fi

gcloud builds submit --tag $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME .

# 4. Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"

DATABASE_URL="postgresql+asyncpg://$DB_USER:$DB_PASS@/$DB_NAME?host=/cloudsql/$CONNECTION_NAME"

# Note: Using Service Account for Identity. 
# The application will automatically use these credentials for Vertex AI and GCS.
gcloud run deploy $SERVICE_NAME \
  --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --add-cloudsql-instances $CONNECTION_NAME \
  --service-account $SERVICE_ACCOUNT_EMAIL \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=$PROJECT_ID" \
  --set-env-vars "GOOGLE_CLOUD_LOCATION=$REGION" \
  --set-env-vars "GCS_BUCKET_NAME=$BUCKET_NAME" \
  --set-env-vars "DATABASE_URL=$DATABASE_URL" \
  --set-env-vars "GOOGLE_APPLICATION_CREDENTIALS="

echo -e "${GREEN}Deployment Complete!${NC}"
echo "Your Service URL is displayed above."
