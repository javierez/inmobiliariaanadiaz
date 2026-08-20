# S3 Bucket Consolidation — Safe Execution Runbook

> Every step has a **verify** gate. Do NOT proceed to the next step until the verify passes.
> Every phase has a **rollback** instruction in case something goes wrong.
> Detailed implementation plan: `docs/superpowers/plans/2026-04-10-s3-bucket-consolidation.md`

---

## Pre-Flight Checklist

Before touching anything, confirm these:

- [ ] You have the AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION)
- [ ] You have database access (can run Drizzle queries)
- [ ] You are on a feature branch (`git checkout -b feat/s3-consolidation`)
- [ ] No other developer is deploying right now
- [ ] You have a recent DB backup (or can restore from Supabase point-in-time)
- [ ] You know the account-to-bucket mapping (from our earlier audit)

---

## PHASE 1: Prepare (no risk — nothing changes in prod)

### Step 1.1 — Create the new bucket in AWS

```bash
# Pick a name and check if it's available
aws s3api head-bucket --bucket vesta-prod 2>&1
# If "Not Found" → name is available. If "Forbidden" → taken, pick another.
```

Run the creation script. This creates the bucket with versioning, CORS, lifecycle, public-read policy.

**Verify:**
```bash
aws s3 ls s3://vesta-prod/
# Should return empty listing, no errors
aws s3api get-bucket-versioning --bucket vesta-prod
# Should show: {"Status": "Enabled"}
aws s3api get-bucket-lifecycle-configuration --bucket vesta-prod
# Should show IntelligentTiering + NoncurrentVersionExpiration rules
```

**Rollback:** `aws s3 rb s3://vesta-prod` (deletes empty bucket)

---

### Step 1.2 — Write the new s3-config.ts module

Create `src/lib/s3-config.ts` with the centralized bucket name, prefix builder, and URL helpers.

**Verify:**
```bash
pnpm lint && pnpm typecheck
# Must pass. This file is not imported by anything yet, so zero risk.
```

**Verify by inspection:** Open the file. Confirm:
- [ ] `S3_BUCKET` reads from `S3_CONSOLIDATED_BUCKET` env var
- [ ] `accountPrefix(21)` would return `"accounts/21"`
- [ ] `buildS3Url("accounts/21/test.jpg")` would return `"https://vesta-prod.s3.us-east-1.amazonaws.com/accounts/21/test.jpg"`

**Rollback:** Delete the file. Nothing depends on it.

---

### Step 1.3 — Add env var

Add `S3_CONSOLIDATED_BUCKET=vesta-prod` to `.env.local` and to Vercel env vars (but DON'T deploy yet).

**Verify:**
```bash
source .env.local && echo $S3_CONSOLIDATED_BUCKET
# Should print: vesta-prod
```

---

### Step 1.4 — Manual upload test to new bucket

Before any code changes, manually verify the new bucket works:

```bash
echo "test" > /tmp/test.txt
aws s3 cp /tmp/test.txt s3://vesta-prod/accounts/99/test.txt
aws s3 ls s3://vesta-prod/accounts/99/
# Should show test.txt

# Verify public read works
curl -I "https://vesta-prod.s3.us-east-1.amazonaws.com/accounts/99/test.txt"
# Should return 200 OK

# Clean up
aws s3 rm s3://vesta-prod/accounts/99/test.txt
```

**GATE: Do not proceed until this works. If the bucket rejects uploads or public reads fail, fix the bucket config first.**

---

## PHASE 2: Code changes (on feature branch, not deployed)

### Step 2.1 — Update core s3.ts

Replace `getDynamicBucketName()` calls with `s3-config` imports in `src/lib/s3.ts`.

**Verify after each function update:**
```bash
pnpm typecheck
# Must pass after every function change
```

**Verify when all functions updated:**
```bash
# No remaining references to old bucket resolution
grep -n "getDynamicBucketName" src/lib/s3.ts
# Should return: nothing

pnpm lint && pnpm typecheck
# Must pass
```

---

### Step 2.2 — Update audio-upload.ts

Same pattern.

**Verify:**
```bash
grep -n "getDynamicBucketName" src/lib/audio-upload.ts
# Should return: nothing
pnpm typecheck
```

---

### Step 2.3 — Update AI image actions (10 files)

Same pattern for all 10 files.

**Verify:**
```bash
grep -rn "getDynamicBucketName" src/app/actions/*-image.ts src/app/actions/enhance-image.ts
# Should return: nothing
pnpm typecheck
```

---

### Step 2.4 — Update brand, profile, hero uploads

Same pattern.

**Verify:**
```bash
grep -rn "getDynamicBucketName" src/app/actions/brand-upload.ts src/app/actions/profile-image-upload.ts src/app/actions/hero-upload.ts src/app/actions/account-settings.ts
# Should return: nothing
pnpm typecheck
```

---

### Step 2.5 — Update watermark pipeline

This one is trickier — has its own S3 client and custom URL builder.

**Verify:**
```bash
grep -rn "getDynamicBucketName\|getDynamicBucketNameForAccount" src/server/utils/watermarked-upload.ts src/app/actions/watermark.ts
# Should return: nothing
pnpm typecheck
```

---

### Step 2.6 — Update services (contact profiles, evolution media, call transcription)

Same pattern.

**Verify:**
```bash
grep -rn "getDynamicBucketName\|getDynamicBucketNameForAccount" src/server/services/
# Should return: nothing
pnpm typecheck
```

---

### Step 2.7 — Remove bucket provisioning from account creation

Remove the `generateUniqueBucketName` + `createAccountS3Bucket` block from `src/server/queries/accounts.ts`.

**Verify:**
```bash
grep -n "createAccountS3Bucket\|generateUniqueBucketName" src/server/queries/accounts.ts
# Should return: nothing
pnpm typecheck
```

---

### Step 2.8 — FULL CODEBASE VERIFICATION

This is the most important verify gate before deploying anything.

```bash
# 1. No remaining references to old bucket system ANYWHERE
grep -rn "getDynamicBucketName\|getDynamicBucketNameForAccount" src/ --include="*.ts" --include="*.tsx"
# Should return: NOTHING (except maybe comments or the old files we'll delete later)

# 2. No remaining direct URL construction (should all use buildS3Url)
grep -rn "\.s3\..*\.amazonaws\.com" src/lib/s3.ts src/lib/audio-upload.ts src/app/actions/ src/server/services/ src/server/utils/watermarked-upload.ts
# Should return: NOTHING (all replaced by buildS3Url)

# 3. Everything compiles
pnpm typecheck

# 4. Linting passes
pnpm lint

# 5. App starts without crashing
pnpm dev
# Open browser, navigate to a property page — images should still load
# (because they use URLs from the DB, which still point to old buckets)
```

**GATE: ALL 5 checks must pass. If any fail, fix before proceeding.**

**Rollback:** You're on a feature branch. `git stash` or `git checkout main` reverts everything.

---

## PHASE 3: Deploy code changes (production, but old data unchanged)

### Step 3.1 — Deploy to preview/staging

```bash
git push origin feat/s3-consolidation
# Create PR, let Vercel deploy a preview
```

**Verify on preview URL:**
- [ ] Open the app in the preview URL
- [ ] Log in as a real user (or demo account)
- [ ] Navigate to a property with images → images load (reading from old bucket via DB URLs)
- [ ] Upload a NEW image to a property → it should go to `vesta-prod` bucket
- [ ] Check the new image loaded correctly in the UI

```bash
# Verify the new image landed in the right place
aws s3 ls s3://vesta-prod/accounts/ --recursive | head -5
# Should show the image you just uploaded under accounts/{accountId}/
```

- [ ] Upload a document → verify it works
- [ ] Upload a video → verify it works
- [ ] Test watermark generation → verify it works
- [ ] Create a new account → verify NO new bucket is created in AWS

**GATE: All upload types work on preview. Old images still render. No new buckets created.**

---

### Step 3.2 — Merge and deploy to production

```bash
# Merge PR to main
# Vercel deploys automatically
```

**Verify in production (first 24 hours):**
- [ ] Spot-check 5 random properties across different accounts → old images load
- [ ] Upload a new image in production → goes to `vesta-prod`
- [ ] No error spikes in Vercel logs
- [ ] No broken image reports from customers

**Let this run for at least 48 hours before proceeding to Phase 4.**

**Rollback:** Revert the PR. Old buckets are untouched. Old code reads from old buckets.

---

## PHASE 4: Migrate existing data (the actual move)

### Step 4.0 — Create a fresh DB backup

Before touching ANY existing data:

```bash
# Take a Supabase point-in-time backup (or whatever your backup method is)
# Record the timestamp: ____________
```

**GATE: Backup confirmed before proceeding.**

---

### Step 4.1 — Dry-run on smallest bucket

```bash
pnpm tsx scripts/s3-migration/migrate-bucket.ts vestacrm 2 --dry-run
```

**Verify the dry-run output:**
- [ ] COPY lines show correct source → destination paths
- [ ] UPDATE lines show correct URL transformations
- [ ] Account prefix is `accounts/2/`
- [ ] No errors

---

### Step 4.2 — Real run on smallest bucket (vestacrm, 952 KB)

```bash
pnpm tsx scripts/s3-migration/migrate-bucket.ts vestacrm 2
```

**Verify:**
```bash
# 1. Objects exist in new bucket
aws s3 ls s3://vesta-prod/accounts/2/ --recursive | head -10
# Should show copied objects

# 2. Run verification script
pnpm tsx scripts/s3-migration/verify-migration.ts 2
# Should show: "✅ X/X objects verified"

# 3. Check in the app
# Log in as account 2, open a property → images should load from new URLs
# Right-click an image → "Copy image address" → should contain "vesta-prod"
```

**GATE: All images for account 2 load from new bucket. Verification script passes 100%.**

**Rollback if broken:** Re-run the migration script with `--db-only` but pointed at the old bucket name to rewrite URLs back. Or restore DB from the backup taken in Step 4.0.

---

### Step 4.3 — Migrate 3 more small buckets

One at a time. After EACH one:

```bash
# Run migration
pnpm tsx scripts/s3-migration/migrate-bucket.ts <bucket> <accountId>

# Verify
pnpm tsx scripts/s3-migration/verify-migration.ts <accountId>

# Check in app: log in as that account, confirm images load
```

**Suggested order:**
1. `mayi` → account to determine
2. `urban-home-leon` (636 KB) → account 108
3. `flexweb-flexity` (578 KB) → orphaned (skip or archive)
4. `toripark` (1.4 MB) → account 1125899906842626

**GATE: At least 3 small buckets migrated and verified before touching medium ones.**

---

### Step 4.4 — Migrate medium buckets

Same process, one at a time:

1. `inmobiliariamartos` (29 MB) → account 1125899906842628
2. `best-house` (22 MB) → account 41
3. `inmobiliaria-sol` (268 MB) → account 103
4. `promocionesinmobiliariasmiguel` (451 MB) → account 5

**Verify each one before starting the next.**

---

### Step 4.5 — Migrate large buckets

These take longer. Use `--skip-db` and `--db-only` flags to separate the S3 copy (slow) from the DB update (fast).

**jon-burgo-nuevo (5 GB, account 111):**
```bash
# Step A: Copy objects (may take 5-10 minutes)
pnpm tsx scripts/s3-migration/migrate-bucket.ts jon-burgo-nuevo 111 --skip-db

# Step B: Verify objects landed
aws s3 ls s3://vesta-prod/accounts/111/ --recursive --summarize | tail -2
# Size should roughly match 5 GB

# Step C: Update DB
pnpm tsx scripts/s3-migration/migrate-bucket.ts jon-burgo-nuevo 111 --db-only

# Step D: Full verification
pnpm tsx scripts/s3-migration/verify-migration.ts 111
```

**inmobiliariaacropolis (17 GB, orphaned — no active account):**
Decide: migrate to a holding prefix, or skip and archive.

**javier-gonzalez (26 GB, account 21) — DO THIS LAST:**
```bash
# This has 459,815 objects. May take 30-60 minutes.
pnpm tsx scripts/s3-migration/migrate-bucket.ts javier-gonzalez 21 --skip-db
# ... wait ...
pnpm tsx scripts/s3-migration/migrate-bucket.ts javier-gonzalez 21 --db-only
pnpm tsx scripts/s3-migration/verify-migration.ts 21
```

**GATE: Every active account verified. Every property page loads images from `vesta-prod`.**

---

### Step 4.6 — Final production verification

```bash
# 1. No images should reference old bucket names anymore
# Run this SQL to check for any remaining old URLs:
# SELECT DISTINCT
#   SUBSTRING(image_url FROM 'https://([^.]+)\.s3')
# FROM property_images
# WHERE image_url IS NOT NULL
# LIMIT 50;
# Should only show: "vesta-prod"

# 2. Upload something new — confirm it works
# 3. Check 10 random properties across 5 different accounts
# 4. Check watermarks still work
# 5. Check document downloads still work
```

**Let this run for 1 week before proceeding to cleanup.**

---

## PHASE 5: Cleanup (after 30+ days of clean operation)

### Step 5.1 — Delete old code

```bash
rm src/lib/s3-bucket.ts src/lib/s3-bucket-provisioning.ts

# Verify no imports remain
grep -rn "s3-bucket-provisioning\|from.*s3-bucket" src/ --include="*.ts" --include="*.tsx" | grep -v s3-config
# Should return: nothing

pnpm typecheck && pnpm lint
```

---

### Step 5.2 — Set old buckets to read-only

For each old bucket:
```bash
aws s3api put-bucket-policy --bucket <name> --policy '...' # deny writes
```

Wait 30 more days. Monitor for any 403 errors that would indicate something still tries to write.

---

### Step 5.3 — Delete old buckets

```bash
# FINAL GATE: Are you sure? This is irreversible.
# For each old bucket:
aws s3 rb s3://<name> --force
```

---

## Quick Reference: Account-to-Bucket Mapping

| Old Bucket | Account ID | Size | Migration Order |
|---|---|---|---|
| vestacrm | 2 | 952 KB | 1st (dress rehearsal) |
| mayi | TBD | 104 KB | 2nd |
| urban-home-leon | 108 | 636 KB | 3rd |
| toripark | 1125899906842626 | 1.4 MB | 4th |
| inmobiliariamartos | 1125899906842628 | 29 MB | 5th |
| best-house | 41 | 22 MB | 6th |
| inmobiliaria-sol | 103 | 268 MB | 7th |
| promocionesinmobiliariasmiguel | 5 | 451 MB | 8th |
| 34639765358 | 32 | 18 MB | 9th |
| 34626549879 | 31 | 3 MB | 10th |
| 3463603611611 | 107 | 796 KB | 11th |
| 34636036116 | 106 | 0 | 12th (empty) |
| 563125486671 | 33 | 0 | 13th (empty) |
| kido-technologies-s-l-u | 40 | 0 | 14th (empty) |
| pau-bruguera-caballero | 34 | 0 | 15th (empty) |
| tito-garal | 113 | 0 | 16th (empty) |
| jon-burgo-nuevo | 111 | 5 GB | 17th |
| inmobiliariaacropolis | orphan | 17 GB | 18th (decide: archive?) |
| javier-gonzalez | 21 | 26 GB | LAST |
| inmobiliariamaya | orphan | 1 MB | orphan |
| 346360361167 | orphan | 22 MB | orphan |
| azucena | orphan | 0 | orphan |
| kido-story | orphan | 378 KB | orphan |
| flexweb-flexity | orphan | 578 KB | orphan |
| vesta-configuration-files | shared | 3 MB | keep separate |

---

## If Something Goes Wrong

| Symptom | Cause | Fix |
|---------|-------|-----|
| Images broken after deploy (Phase 3) | Code change reads from new bucket but old data isn't there | Revert PR. Old code reads from old buckets. |
| Images broken after migration (Phase 4) | DB URL update went wrong | Re-run migration with `--db-only` or restore DB backup |
| New uploads fail | Bucket permissions/CORS wrong | Check bucket config. Test with `aws s3 cp`. Don't revert code — fix bucket. |
| One account's images broken, others fine | Migration script missed rows for that account | Re-run migration for that specific bucket |
| Watermarks broken | Watermark code not updated to use new prefix | Check `watermarked-upload.ts` uses `s3-config`. Fix and redeploy. |
| Portal images (Idealista/Fotocasa) broken | Portal cached old URLs | Re-publish affected listings through the portal. |
