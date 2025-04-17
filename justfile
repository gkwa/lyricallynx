# Justfile for LyricalLynx Internet Usage Tracker
# Set default shell

set shell := ["bash", "-c"]

# Default recipe to run when just is called without arguments
default:
    @just --list

# Setup the local development environment
setup:
    ./scripts/setup.sh

# Start local development server
dev:
    @echo "Starting local development server..."
    npx http-server . -p 8080 -o

# Initialize Terraform
tf-init:
    @echo "Initializing Terraform..."
    terraform init

# Plan Terraform changes
tf-plan: tf-init
    @echo "Planning Terraform changes..."
    terraform plan

# Apply Terraform changes (deploy infrastructure)
tf-apply: tf-init
    @echo "Applying Terraform changes..."
    terraform apply -auto-approve

# Destroy Terraform resources (teardown infrastructure)
tf-destroy: tf-init
    @echo "Destroying Terraform resources..."
    terraform destroy -auto-approve

# Deploy the website to S3
deploy: tf-apply
    ./scripts/deploy.sh

# Quick update - just update files in existing S3 bucket
update:
    @echo "Updating files in S3 bucket..."
    BUCKET_NAME=$(terraform output -raw bucket_name) && \
    aws s3 cp index.html "s3://$${BUCKET_NAME}/index.html" --content-type "text/html" && \
    aws s3 cp error.html "s3://$${BUCKET_NAME}/error.html" --content-type "text/html" && \
    aws s3 cp app.js "s3://$${BUCKET_NAME}/app.js" --content-type "application/javascript"
    @echo "Files updated successfully!"

# Full deployment process
full-deploy: setup tf-init deploy
    @echo "Full deployment completed!"

# Teardown everything
teardown: tf-destroy
    @echo "All resources have been destroyed."

# Test the AWS connectivity
test-aws:
    @echo "Testing AWS connectivity..."
    aws sts get-caller-identity

# Validate Terraform files
validate:
    @echo "Validating Terraform files..."
    terraform validate

# Create an automation script for daily updates
create-update-script:
    ./scripts/create_update_script.sh

# Check the current contents of the S3 bucket
list-bucket:
    @echo "Listing contents of S3 bucket..."
    BUCKET_NAME=$(terraform output -raw bucket_name) && \
    aws s3 ls "s3://$${BUCKET_NAME}/" --recursive
