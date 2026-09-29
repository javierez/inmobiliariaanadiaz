# Data Insertion Command

This command sets up database-driven data integration for the Vesta webpage application. Follow these steps to add new data fields and integrate them into the application.

## 1. Create Database Query Function

**File:** `/src/server/queries/query.ts`

- Add `getQuery` function to query the data column from the target table
- Implement React cache for memoization to optimize performance
- Parse JSON string from database into the appropriate TypeScript type
- Handle error cases with proper fallbacks

## 2. Define TypeScript Types

**File:** `/src/lib/data.ts`

- Create type definition that matches the metadata structure from your sample data
- Include all nested properties and optional fields
- Ensure type safety throughout the application
- Export types for reuse across components

## 3. Update Database Schema

**File:** `/src/server/db/vestaschema.ts`

- Add the new column with appropriate type to the target table
- Ensure column definition matches the data structure
- Update any related indexes if needed

## 4. Update Generate-Site Pipeline

**File:** `/scripts/generate-site/data-extractor.ts`

- Add metadata field to the `ExtractedData` interface
- Update `extractDataForAccount()` function to extract and parse the new column
- Implement safe JSON parsing with error handling
- Include the new metadata in the extraction process

## 5. Implement in Application Components

**File:** `/src/app/page.tsx` (or target component)

- Replace hardcoded/static implementation with dynamic data fetching
- Fetch data from database using the query function
- Transform database data to match application's expected types
- Handle type conversions and provide fallbacks for missing data
- Ensure proper error handling and loading states

## 6. Determine Data Type and Apply Transformation

### For Dynamic Data (changes frequently, user-specific):
- **Keep as runtime queries:** Leave the query function as-is to fetch from database at runtime
- **Examples:** Property listings, user testimonials, contact submissions, real-time inventory
- **Result:** Data remains dynamic and up-to-date

### For Static Data (configuration, rarely changes):
- **Add to static generation:** Add the query file to `STATIC_QUERY_FILES` array in `/scripts/generate-site/utils.ts`
- **Configure transformation:** Add transformation mapping in `/scripts/generate-site/code-transformer.ts`:
  ```typescript
  { file: "meta.ts", data: data.websiteConfig.metadata }
  ```
- **Automatic optimization:** During site generation, the code transformer will:
  - Replace async database queries with synchronous static returns
  - Remove database imports and React cache dependencies
  - Convert the function to return the extracted data directly
  - **Result:** Zero database calls for static content in production

### Decision Criteria:
- **Static:** SEO metadata, company information, configuration settings, branding data
- **Dynamic:** User-generated content, inventory data, real-time information, personalized content                                                                                                                  