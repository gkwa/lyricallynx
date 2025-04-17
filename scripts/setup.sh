#!/bin/bash

echo "Setting up local development environment..."
if ! command -v pnpm &>/dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi

if ! command -v http-server &>/dev/null; then
    echo "Installing http-server..."
    pnpm install -g http-server
fi

if ! command -v terraform &>/dev/null; then
    echo "Please install Terraform manually from https://www.terraform.io/downloads.html"
    exit 1
fi

if ! command -v aws &>/dev/null; then
    echo "Please install AWS CLI manually from https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &>/dev/null; then
    echo "Please configure your AWS credentials with 'aws configure'"
    exit 1
fi

echo "Setup complete! You can now run 'just dev' to start the development server."
