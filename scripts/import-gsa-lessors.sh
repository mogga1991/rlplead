#!/bin/bash

# Load environment variables from .env file
set -a
source .env
set +a

# Run the TypeScript import script
npx tsx scripts/import-gsa-lessors-to-db.ts
