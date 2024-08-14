#!/bin/bash
# Get the commit ID
PORTAINER_URL=$1
PORTAINER_API_KEY=$2
PORTAINER_ENDPOINT=$3
STACK_ID=$4
DOCKER_ACCESS_TOKEN=$5
COMMIT_ID=$6

# Login to Docker
echo $DOCKER_ACCESS_TOKEN | docker login -u phatnguyen1812 --password-stdin

# Build the Docker image
docker build -f apps/api/Dockerfile.dev -t datn-be:$COMMIT_ID .
docker tag datn-be:$COMMIT_ID phatnguyen1812/datn-be:$COMMIT_ID
docker tag datn-be:$COMMIT_ID phatnguyen1812/datn-be:latest

# Push the Docker image
docker push phatnguyen1812/datn-be:$COMMIT_ID
docker push phatnguyen1812/datn-be:latest

# Get STACK_ID environment variables
echo "Deploying to Portainer"
python3 apps/api/deploy/portainer_deploy.py $PORTAINER_URL $PORTAINER_API_KEY 2 $STACK_ID $COMMIT_ID
