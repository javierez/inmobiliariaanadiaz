# S3 Bucket Consolidation — Complete Change Summary

## What was done

Migrated from **25 per-account S3 buckets** to **1 consolidated bucket** (`vesta-crm-prod`). All new uploads go to `vesta-crm-prod/accounts/{accountId}/{originalPath}`. Old data stays in old buckets and remains accessible during coexistence.

---

## AWS Infrastructure Changes

### New bucket created: `vesta-crm-prod`
- **Region**: us-east-1
- **Encryption**: AES-256 (SSE-S3), BucketKeyEnabled
- **Versioning**: Enabled (old versions kept 30 days)
- **Lifecycle rules**:
  - Intelligent-Tiering at day 0 (auto-tiers cold data to cheaper storage)
  - Noncurrent version expiry at 30 days
  - Abort incomplete multipart uploads after 1 day
- **CORS**: localhost:3000/3001, vesta-crm.com, app.vesta-crm.com, vestapicture.com, `*.vestapicture.com`, acropolisinmobiliarias.com, promocionesinmobiliariasmiguel.com, leon.best-house.com, `*.vercel.app`
- **Public access**: GetObject only (no ListBucket, no PutObject from anonymous). ACLs blocked.
- **Tags**: project=vesta, environment=production, managed-by=vesta-app

### Environment variables added
- `S3_CONSOLIDATED_BUCKET=vesta-crm-prod` — added to `.env.local`, Vercel production, Vercel preview
- `S3_CONSOLIDATED_BUCKET` added to `src/env.js` schema (optional, falls back to `AWS_S3_BUCKET`)

---

## New S3 Key Structure

**Before** (per-account bucket):
```
javier-gonzalez/                          ← account-specific bucket
├── VESTA2026005063/images/image_1_abc.jpg
├── contacts/217196/profile.md
├── watermarked/1000084327/image_0.jpg
└── branding/logo_original_123.png
```

**After** (consolidated bucket):
```
vesta-crm-prod/
└── accounts/21/                          ← account ID prefix (immutable)
    ├── VESTA2026005063/images/image_1_abc.jpg
    ├── contacts/217196/profile.md
    ├── watermarked/1000084327/image_0.jpg
    └── branding/logo_original_123.png
```

---

## Files Created (2)

### `src/lib/s3-config.ts` — Centralized S3 configuration
New module that replaces `getDynamicBucketName()` as the source of truth. Exports:

| Function | Purpose |
|---|---|
| `S3_BUCKET` | Constant: the consolidated bucket name |
| `accountPrefix(accountId)` | Returns `accounts/{id}` |
| `accountScopedKey(accountId, key)` | Returns `accounts/{id}/{key}` |
| `buildS3Url(key)` | Returns `https://bucket.s3.region.amazonaws.com/{key}` |
| `buildS3Uri(key)` | Returns `s3://bucket/{key}` |
| `getSessionAccountPrefix()` | Async — gets prefix from current user session |
| `getSessionAccountId()` | Async — gets account ID from current user session |
| `resolveBucket(key)` | Coexistence resolver: `accounts/` prefix → new bucket, else → old bucket |
| `extractBucketAndKeyFromUrl(url)` | Parses S3 URL → `{ bucket, key }` for both old and new URLs |

### `scripts/s3-migration/create-consolidated-bucket.ts` — One-time bucket creation script

---

## Files Deleted (11)

### 10 dead AI image action files (unused — nothing imported them)
- `src/app/actions/enhance-image.ts`
- `src/app/actions/blur-faces-image.ts`
- `src/app/actions/ambient-people-image.ts`
- `src/app/actions/add-furniture-image.ts`
- `src/app/actions/remove-furniture-image.ts`
- `src/app/actions/remove-clutter-image.ts`
- `src/app/actions/reformas-image.ts`
- `src/app/actions/enhance-lighting-image.ts`
- `src/app/actions/render-3d-image.ts`
- `src/app/actions/sunny-weather-image.ts`

### 1 audio upload file (functionality removed — voice transcribes directly without S3)
- `src/lib/audio-upload.ts`

---

## Files Modified (26) — Detailed changes

### Core S3 Library

**`src/lib/s3.ts`** — 9 functions updated

| Function | Change |
|---|---|
| `uploadImageToS3` | `getDynamicBucketName()` → `getSessionAccountPrefix()` + `S3_BUCKET`. Key: `accounts/{id}/{ref}/images/image_{order}_{nanoid}.{ext}` |
| `uploadVideoToS3` | Same pattern. Key: `accounts/{id}/{ref}/videos/video_{order}_{nanoid}.{ext}` |
| `uploadDocumentToS3` | Same pattern. Key: `accounts/{id}/{ref}/documents/{folderType}/{file}`. Energy certificates now go to `documents/certificados/` subfolder. Ficha propiedad to `documents/initial-docs/`. |
| `uploadCallRecordingToS3` | Uses `accountPrefix(accountId)` (already had accountId param). Key: `accounts/{id}/contacts/{contactId}/calls/{callSid}.mp3` or `accounts/{id}/call-recordings/{userId}/{yearMonth}/{callSid}.mp3` |
| `renameS3Folder` | Uses `S3_BUCKET` + prefix. Only operates on just-uploaded objects (already in new bucket). |
| `deletePropertyS3Folder` | Tries BOTH buckets: new bucket with prefix first, then old per-account bucket as fallback. |
| `generatePresignedUploadUrl` | `Bucket: S3_BUCKET` (callers already provide prefixed key). |
| `generatePresignedDownloadUrl` | Uses `resolveBucket(key)` — works for both old and new keys. |
| `getS3PublicUrl` | Uses `resolveBucket(key)` — works for both old and new keys. |
| Key generators (`generateImageKey`, `generateVideoKey`, `generateDocumentKey`, `generatePromotionImageKey`) | **No change** — prefix is added by the caller, not the generator. |

### Upload Actions

**`src/app/actions/upload.ts`** — 7 calls replaced

| Function | Change |
|---|---|
| `deletePropertyImage` | `getDynamicBucketName()` → `resolveBucket(imageKey)` |
| `deletePropertyImagesBulk` | Same — resolves from first key |
| `deleteDocument` | `getDynamicBucketName()` → `resolveBucket(documentKey)` |
| `getPropertyImagePresignedUrl` | Prepends `getSessionAccountPrefix()` to key before passing to `generatePresignedUploadUrl` |
| `getPropertyVideoPresignedUrl` | Same |
| `getPresignedDocumentUploadUrl` | Same |
| `getPromotionImagePresignedUrl` | Same |
| `savePropertyImageRecord` | `s3key` built with `buildS3Uri(imageKey)` instead of manual string |
| `savePropertyVideoRecord` | Same |
| `savePromotionImageRecord` | Same |
| `deletePromotionImage` | `getDynamicBucketName()` → `resolveBucket(imageKey)` |

**`src/app/actions/hero-upload.ts`** — 4 functions updated
- `uploadHeroImage`: `S3_BUCKET` + prefix. Key: `accounts/{id}/hero/background_{ts}_{nanoid}.{ext}`. Old hero deleted via `extractBucketAndKeyFromUrl()`.
- `uploadHeroVideo`: Same pattern.
- `deleteHeroImage`: Parses bucket from stored URL via `extractBucketAndKeyFromUrl()`.
- `deleteHeroVideo`: Same.

**`src/app/actions/brand-upload.ts`** — 3 functions updated
- `uploadBrandAssetToS3`: `S3_BUCKET` + prefix. Key: `accounts/{id}/branding/logo_{type}_{ts}_{nanoid}.{ext}`.
- `uploadBrandAsset`: Old logos deleted via `extractBucketAndKeyFromUrl()`.
- `deleteBrandAsset`: Same — parses bucket from URL.
- Dead `extractS3KeyFromUrl` helper removed.

**`src/app/actions/profile-image-upload.ts`** — 1 function updated
- `uploadProfileImage`: `S3_BUCKET` + prefix. Key: `accounts/{id}/config/profile_{userId}_{ts}_{nanoid}.{ext}`. Old avatar deleted via `extractBucketAndKeyFromUrl()`.
- Dead `extractS3KeyFromUrl` helper removed.

**`src/app/actions/settings.ts`** — 2 calls updated
- `uploadAccountLogo` (first call): Now passes `"branding"` as reference number instead of bucket name (fixed pre-existing bug).
- Second logo upload: Uses dynamic import of `s3-config` for `accountPrefix`, `S3_BUCKET`, `buildS3Url`. Key: `accounts/{id}/config/logo_{accountId}_{ts}.{ext}`. Removed duplicate inline S3Client.

**`src/app/actions/account-settings.ts`** — 1 function updated
- `uploadAccountSignature`: `S3_BUCKET` + `accountPrefix(accountId)`. Key: `accounts/{id}/legal/signature.png`. Removed duplicate inline S3Client — now imports from `~/server/s3`.

**`src/app/actions/watermark.ts`** — 5 calls updated
- `uploadCustomWatermarkImage`: Key: `accounts/{id}/watermarks/custom/{listingId}/watermark_{nanoid}.{ext}`.
- `uploadAccountWatermarkImage`: Key: `accounts/{id}/watermarks/account/watermark_{nanoid}.{ext}`.
- `getExistingWatermarkedImages`: Checks `accounts/{id}/watermarked/{propertyId}/image_{order}.jpg`. Uses `buildS3Url()`.
- `deleteWatermarkedImages`: Deletes at `accounts/{id}/watermarked/{propertyId}/image_{order}.jpg`.

### Server Utils

**`src/server/utils/watermarked-upload.ts`** — 6 calls + structural changes
- Removed duplicate S3Client — now imports from `~/server/s3`.
- `uploadWatermarkedImageToS3`: Added `accountId` param. Key: `accounts/{id}/watermarked/{propertyId}/image_{order}.jpg`.
- `cleanupAllWatermarkedImagesForProperty`: Added `accountId` param. Lists/deletes under `accounts/{id}/watermarked/{propertyId}/`.
- `readWatermarkManifest`: Added `acctPrefix` param. Key: `accounts/{id}/watermarked/{propertyId}/manifest.json`.
- `writeWatermarkManifest`: Same.
- `verifyWatermarkedImagesExist`: Added `acctPrefix` param.
- `processWatermarkedImagesWithCache`: Resolves accountId, threads `acctPrefix` through all helper calls.
- `buildWatermarkedUrl`: Added optional `acctPrefix` param.

**`src/server/utils/document-text-extractor.ts`** — 1 call
- `getDynamicBucketName()` → `resolveBucket(documentKey)`.

**`src/server/utils/pdf-text-extractor.ts`** — 1 call
- `getDynamicBucketName()` → `resolveBucket(documentKey)`.

### Server Services

**`src/server/services/contact-profile-service.ts`** — Full rework of S3 helpers
- `profileKey(contactId)` → `profileKey(acctId, contactId)`: returns `accounts/{id}/contacts/{contactId}/profile.md`.
- `snapshotKey(contactId, yearMonth)` → `snapshotKey(acctId, contactId, yearMonth)`: returns `accounts/{id}/contacts/{contactId}/profile-{yearMonth}.md`.
- `readProfileFromS3`: Uses `resolveBucket()`. Falls back to old bucket if not found in new bucket.
- `writeProfileToS3`: Writes to `S3_BUCKET` with account prefix.
- `snapshotIfMonthChanged`: Copies within `S3_BUCKET` with account prefix.
- `buildContactContext` and `forceRebuildContactProfile`: Removed `bucket` variable, passes `acctId` to all helpers.

**`src/server/services/evolution-media-upload.ts`** — 1 call
- `getDynamicBucketNameForAccount(accountId)` → `S3_BUCKET` + `accountPrefix(accountId)`. Key: `accounts/{id}/whatsapp/{phone}/{filename}`.

### Server Actions

**`src/server/actions/documents.ts`** — 1 call
- `uploadTempFileForWhatsApp`: `S3_BUCKET` + prefix. Key: `accounts/{id}/temp/whatsapp-media/{nanoid}/{filename}`.

**`src/server/actions/docusign.ts`** — 1 call
- Signed document upload: `S3_BUCKET` + prefix. Key: `accounts/{id}/signed-documents/{envelopeId}/{filename}.pdf`.

**`src/server/actions/property-leases.ts`** — 1 call
- Lease document deletion: `getDynamicBucketName()` → `resolveBucket(doc.documentKey)`.

**`src/server/actions/room-contracts.ts`** — 1 call
- Contract deletion: `getDynamicBucketName()` → `resolveBucket(doc.documentKey)`.

### Portals & API Routes

**`src/server/portals/idealista.tsx`** — 1 call
- Idealista JSON upload: `S3_BUCKET` + prefix. Key: `accounts/{id}/idealista/{customerCode}.json`.

**`src/app/api/properties/[id]/carteles/route.ts`** — 1 call
- Cartel deletion: `getDynamicBucketName()` → `resolveBucket(verifiedKey)`.

**`src/server/ocr/ocr-initial-form.tsx`** — 2 calls
- `getDynamicBucketName()` → `resolveBucket(documentKey)`.

---

## Duplicate S3 Clients Removed (3)

| File | Before | After |
|---|---|---|
| `src/lib/audio-upload.ts` | Own `new S3Client()` + env validation (30 lines) | File deleted |
| `src/app/actions/account-settings.ts` | Own `new S3Client()` (8 lines) | Imports `s3Client` from `~/server/s3` |
| `src/server/utils/watermarked-upload.ts` | Own `new S3Client()` (6 lines) | Imports `s3Client` from `~/server/s3` |

---

## Coexistence Strategy

During the transition period (old data in old buckets, new data in new bucket):

| Operation | Approach |
|---|---|
| **New writes** | Always go to `vesta-crm-prod` at `accounts/{id}/{key}` |
| **Reads by key from DB** | `resolveBucket(key)`: if key starts with `accounts/` → new bucket, else → old bucket via `getDynamicBucketName()` |
| **Deletes by key from DB** | Same `resolveBucket(key)` approach |
| **Deletes by URL from DB** | `extractBucketAndKeyFromUrl(url)` → parses the bucket from the stored URL → deletes from the correct bucket |
| **Delete property folder** | Tries new bucket first, then falls back to old bucket |
| **Contact profile reads** | Tries new bucket, falls back to old bucket if not found |

---

## Bugs Fixed Along the Way

1. **Energy certificates had no subfolder** — went directly to `documents/` root. Now goes to `documents/certificados/`.
2. **Ficha propiedad had no subfolder** — now goes to `documents/initial-docs/`.
3. **`settings.ts` passed bucket name as reference number** — produced keys like `inmobiliariaacropolis/images/image_1_xxx.jpg`. Fixed to pass `"branding"` as reference.
4. **Watermark keys had no account isolation** — `watermarked/{propertyId}/image_{order}.jpg` could collide between accounts. Fixed with `accounts/{id}/` prefix.

---

## Complete S3 Key Map (New Paths)

| Asset Type | New Key Pattern |
|---|---|
| Property images | `accounts/{id}/{ref}/images/image_{order}_{nanoid}.{ext}` |
| Property videos | `accounts/{id}/{ref}/videos/video_{order}_{nanoid}.{ext}` |
| Property documents | `accounts/{id}/{ref}/documents/{folderType}/{file}` |
| Energy certificates | `accounts/{id}/{ref}/documents/certificados/certificado_energetico_{nanoid}.{ext}` |
| Ficha propiedad | `accounts/{id}/{ref}/documents/initial-docs/ficha_propiedad_{nanoid}.{ext}` |
| Call recordings (with contact) | `accounts/{id}/contacts/{contactId}/calls/{callSid}.mp3` |
| Call recordings (no contact) | `accounts/{id}/call-recordings/{userId}/{yearMonth}/{callSid}.mp3` |
| Contact AI profiles | `accounts/{id}/contacts/{contactId}/profile.md` |
| Contact profile snapshots | `accounts/{id}/contacts/{contactId}/profile-{yearMonth}.md` |
| Promotion images | `accounts/{id}/promotions/{promotionId}/images/image_{order}_{nanoid}.{ext}` |
| Hero images/videos | `accounts/{id}/hero/background_{ts}_{nanoid}.{ext}` |
| Brand logos | `accounts/{id}/branding/logo_{type}_{ts}_{nanoid}.{ext}` |
| User avatars | `accounts/{id}/config/profile_{userId}_{ts}_{nanoid}.{ext}` |
| Account signature | `accounts/{id}/legal/signature.png` |
| Custom watermark logos | `accounts/{id}/watermarks/custom/{listingId}/watermark_{nanoid}.{ext}` |
| Account watermark logos | `accounts/{id}/watermarks/account/watermark_{nanoid}.{ext}` |
| Cached watermarked images | `accounts/{id}/watermarked/{propertyId}/image_{order}.jpg` |
| Watermark manifest | `accounts/{id}/watermarked/{propertyId}/manifest.json` |
| Idealista JSON export | `accounts/{id}/idealista/{customerCode}.json` |
| WhatsApp media backup | `accounts/{id}/whatsapp/{phone}/{filename}` |
| WhatsApp temp files | `accounts/{id}/temp/whatsapp-media/{nanoid}/{filename}` |
| Signed documents (DocuSign) | `accounts/{id}/signed-documents/{envelopeId}/{filename}.pdf` |
| Account settings logo | `accounts/{id}/config/logo_{accountId}_{ts}.{ext}` |
| Carteles/signs | `accounts/{id}/{ref}/documents/carteles/{file}` |

---

## Files NOT Changed (intentionally)

| File | Reason |
|---|---|
| `src/lib/s3-bucket.ts` | Still needed during coexistence for `resolveBucket()` fallback. Delete after data migration. |
| `src/lib/s3-bucket-provisioning.ts` | Still needed for account creation. Remove after all code is deployed and verified. |
| `src/server/queries/accounts.ts` | Still provisions buckets on account creation. Remove provisioning block after deployment. |
| `src/server/utils/cleanup-old-watermarks.ts` | Operates purely on old bucket data. Leave as-is. |
| `src/server/s3-utils.ts` | Uses hardcoded `vesta-configuration-files` bucket (shared infra). Not part of this migration. |
| 141 hardcoded URLs to `vesta-config-eu-de2eecd0.s3.eu-west-1.amazonaws.com` | Shared assets (email logos, landing pages, brochures). Separate bucket, not affected. |

---

## What Still Needs to Happen (future steps)

1. **Remove bucket provisioning** from `src/server/queries/accounts.ts` (after this code is deployed and verified)
2. **Data migration** — copy objects from old buckets to new bucket + update DB URLs (separate migration script at `scripts/s3-migration/migrate-bucket.ts`)
3. **Delete old code** — `s3-bucket.ts`, `s3-bucket-provisioning.ts` (after data migration complete)
4. **Delete old buckets** (30-60 days after migration)
5. **Make `S3_CONSOLIDATED_BUCKET` required** in env schema (after migration)
