---
name: deploy
description: Deploy a generated website for a specific account ID
disable-model-invocation: true
argument-hint: <accountId>
---

# Deploy Generated Site

Deploy the site for account ID: $ARGUMENTS

## Steps

1. Run the full site generation and deployment:
   ```bash
   pnpm run generate-site -- --accountId $ARGUMENTS
   ```
   Use a 10-minute timeout (600000ms) since builds take time.

2. Check the tail of the output for success/failure.

3. Report back:
   - Account name
   - Deployment URL
   - Whether git connection and deployment verification succeeded
   - Any warnings or errors
