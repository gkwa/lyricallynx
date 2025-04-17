# Overview

A simple, cost-effective internet usage tracking visualization hosted on
AWS S3. The application fetches data from a GitHub Gist and displays it
in an interactive chart.

# Features

- Real-time data fetching from GitHub Gist
- Interactive chart showing usage over time
- Daily average and month-end projections
- Mobile-responsive design
- Cost-efficient S3 hosting

# Infrastructure

This project uses:

- AWS S3 for static website hosting
- Terraform for infrastructure as code
- Just for task orchestration

# Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform installed
- Just command runner installed (<https://github.com/casey/just>)
- Node.js and pnpm (for local development)

# Getting Started

1.  Clone this repository
2.  Run `just setup`{.verbatim} to install dependencies
3.  Run `just dev`{.verbatim} to start a local development server

# Deployment

To deploy the application to AWS:

```bash
just full-deploy
```

This will:

1.  Set up your local environment
2.  Initialize Terraform
3.  Create the AWS resources
4.  Upload the website files to S3

# Common Tasks

Command Description

---

`just dev`{.verbatim} Start local development server
`just deploy`{.verbatim} Deploy changes to AWS
`just teardown`{.verbatim} Remove all AWS resources
`just list-bucket`{.verbatim} List contents of S3 bucket
`just validate`{.verbatim} Validate Terraform files

# Updating Data

By default, the application fetches data from:
<https://gist.githubusercontent.com/taylormonacelli/5866396655738e834056f9b20e9cc081/raw/d71a09b39c2d3bd10380c23d27fac607976a3fb2/internet.json>

To use your own data source:

1.  Update the URL in `app.js`{.verbatim}
2.  Run `just deploy`{.verbatim} to update the application

# Cost Optimization

This setup uses:

- S3 static website hosting (very low cost)
- External CDNs for libraries (no storage cost)
- Minimal infrastructure components

Approximate monthly cost: Less than \$1 for moderate traffic (excluding
data transfer costs)

# License

MIT
