import {
  bigint,
  varchar,
  timestamp,
  boolean,
  pgTable,
  jsonb,
  text,
  decimal,
  smallint,
  integer,
  time,
  date,
  bigserial,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// Franchises table (top-level grouping of accounts)
export const franchises = pgTable("franchises", {
  franchiseId: bigserial("franchise_id", { mode: "bigint" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Account groups / zones within a franchise
export const accountGroups = pgTable("account_groups", {
  groupId: bigserial("group_id", { mode: "bigint" }).primaryKey(),
  franchiseId: bigint("franchise_id", { mode: "bigint" }).notNull(), // FK → franchises
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Accounts table (CRM organization/tenant - top level entity)
export const accounts = pgTable("accounts", {
  accountId: bigserial("account_id", { mode: "bigint" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  shortName: varchar("short_name", { length: 50 }), // Abbreviated company names
  legalName: varchar("legal_name", { length: 255 }), // Full legal company name
  logo: varchar("logo", { length: 2048 }), // S3 URL for organization logo
  address: varchar("address", { length: 500 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),
  // Account type - company or person
  // UI options: 'company' (Empresa) | 'person' (Persona)
  accountType: varchar("account_type", { length: 20 }).default("company"),
  // Agent/Signature configuration for documents
  defaultSigningAgentId: varchar("default_signing_agent_id", { length: 36 }), // FK → users.id - Default agent who signs documents
  signatureUrl: varchar("signature_url", { length: 2048 }), // S3 URL for the default signature image
  // Legal information fields
  taxId: varchar("tax_id", { length: 50 }), // Tax identification number (CIF/NIF)
  collegiateNumber: varchar("collegiate_number", { length: 50 }), // Professional collegiate number (API registration)
  registryDetails: text("registry_details"), // Commercial registry information
  legalEmail: varchar("legal_email", { length: 255 }), // Legal contact email address
  jurisdiction: varchar("jurisdiction", { length: 255 }), // Legal jurisdiction and applicable courts
  privacyEmail: varchar("privacy_email", { length: 255 }), // Privacy/GDPR contact email address
  dpoEmail: varchar("dpo_email", { length: 255 }), // Data Protection Officer email address
  // Settings JSON fields for flexible configuration
  portalSettings: jsonb("portal_settings").default({}), // Fotocasa, Idealista, etc. (includes API keys)
  paymentSettings: jsonb("payment_settings").default({}), // Stripe, PayPal, etc.
  paymentDetails: jsonb("payment_details").default({}), // Agency bank details: { iban, bankName, accountHolder, swiftBic }
  preferences: jsonb("preferences").default({}), // General account preferences
  terms: jsonb("terms").default({}), // Terms and conditions configuration
  onboardingData: jsonb("onboarding_data").default({}), // Onboarding form responses: { completed, completedAt, teamSize, businessFocus, previousCrm, referralSource, portals, additionalNotes }
  taskPreferences: jsonb("task_preferences").default({
    property: {
      uploadPhotos: { enabled: true, dueDays: 7 },
      completeInfo: { enabled: true, dueDays: 7 },
      scheduleVisit: { enabled: true, dueDays: 10 },
      pickupKeys: { enabled: true, dueDays: 10 },
      valuation: { enabled: true, dueDays: 10 },
      createHojaEncargo: { enabled: true, dueDays: 12 },
      signHojaEncargo: { enabled: true, dueDays: 14 },
      generateCartel: { enabled: true, dueDays: 16 },
    },
  }), // Task creation preferences for automatic tasks (property listing tasks)
  notificationSettings: jsonb("notification_settings").default({}), // Email/SMS notification preferences for tasks, appointments, and customer communications
  // Subscription/billing info
  // Options: 'free_trial' | 'demo15' | 'basico' | 'profesional' | 'profesional-plus' | 'avanzado' | 'max' | 'blocked'
  plan: varchar("plan", { length: 50 }).default("free_trial"),
  subscriptionType: varchar("subscription_type", { length: 100 }), // More detailed subscription type
  subscriptionStartDate: timestamp("subscription_start_date"), // Subscription start date
  subscriptionEndDate: timestamp("subscription_end_date"), // Subscription end date
  // Module-based feature access (independent from plan for upselling individual modules)
  enabledModules: jsonb("enabled_modules").default([]).$type<string[]>(),
  status: varchar("status", { length: 20 }).default("active"), // active/inactive/suspended
  // Image AI Token System
  imageTokenBalance: integer("image_token_balance").default(0).notNull(), // Current token balance for AI image operations
  imageTokensUsed: integer("image_tokens_used").default(0).notNull(), // Lifetime token usage tracking
  // Portal Slot Limits
  idealistaMaxSlots: integer("idealista_max_slots"), // Max Idealista listings (null = unlimited)
  // Rental utility split policy default
  // Values: 'equal_occupied' | 'equal_all_rooms' | 'by_m2'
  utilitySplitModeDefault: varchar("utility_split_mode_default", { length: 30 })
    .notNull()
    .default("equal_occupied"),
  // S3 bucket
  bucketName: varchar("bucket_name", { length: 63 }), // S3 bucket name for this account
  // Franchise hierarchy (nullable — accounts without a franchise work as before)
  franchiseId: bigint("franchise_id", { mode: "bigint" }), // FK → franchises
  groupId: bigint("group_id", { mode: "bigint" }), // FK → account_groups
  // Fiscal identity for invoicing (contabilidad module)
  iaeEpigrafe: varchar("iae_epigrafe", { length: 10 }), // e.g. "861.2" (locales), "703" (gestión inmobiliaria)
  // 'general' | 'simplified' | 'special_cash' | 'recargo_equivalencia' | 'exento'
  fiscalRegime: varchar("fiscal_regime", { length: 30 }),
  holdedContactId: varchar("holded_contact_id", { length: 64 }), // agency's own Holded contact id
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  bio: text("bio"), // Agency presentation text shown on public documents (valoraciones, propuestas)
  // IRPF regime (only meaningful for account_type='person'): 'profesional'
  // → commission invoices to businesses carry IRPF retención; 'empresarial'
  // or NULL → no retención. Sociedades (account_type='company') never withhold.
  // Distinct from `fiscalRegime` below, which is the *VAT* regime.
  irpfRegime: varchar("irpf_regime", { length: 20 }),
  // Site template selector for the website generator (super-admin controlled).
  // 'v1' → vestawebpage Railway service · 'v2' → vestawebpage-v2 Railway service.
  // NULL = not yet decided (the CRM admin dropdown prompts a choice; deploys stamp it).
  siteTemplate: varchar("site_template", { length: 10 }),
  // SaaS invoice auto-renewal config — Vesta-side billing of customer accounts
  // 'monthly' | 'annual'. Default cycle used to derive next renewal period.
  billingCycle: varchar("billing_cycle", { length: 10 })
    .notNull()
    .default("annual"),
  // 'current_plan_price' (lookup saas_plan_prices) | 'ipc' (previous base × IPC) | 'fixed' (copy previous invoice)
  renewalPricingStrategy: varchar("renewal_pricing_strategy", { length: 20 })
    .notNull()
    .default("current_plan_price"),
  autoRenew: boolean("auto_renew").notNull().default(false), // Opt-in: renewal cron only acts on accounts with this true
  // Per-account renewal price override (pre-IVA). When set, the renewal cron
  // uses this as the base regardless of renewal_pricing_strategy.
  renewalBaseOverride: decimal("renewal_base_override", {
    precision: 12,
    scale: 2,
  }),
  // Operational markers (independent from billing plan and is_active flag)
  isTest: boolean("is_test").default(false).notNull(), // marker for demo/test/internal accounts (excluded from real-client KPIs)
  isActiveClient: boolean("is_active_client").default(false).notNull(), // marker for accounts that are real, active, productive clients (regardless of plan)
  // Recibo emission trigger mode for the monthly cron.
  // 'manual'      — user clicks Generate then Send (default).
  // 'auto_review' — cron generates draft + PDF; user clicks Send.
  // 'auto_send'   — cron generates and emails automatically on the 1st.
  reciboEmissionMode: varchar("recibo_emission_mode", { length: 20 })
    .notNull()
    .default("manual"),
  s3BucketName: varchar("s3_bucket_name", { length: 63 }), // S3 bucket name (max 63 chars per AWS)
  planStudio: varchar("plan_studio", { length: 50 }).default("starter"), // Studio plan: none, starter, basico, profesional, personalizado
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default(
    "active",
  ),
});

// Offices table (for accounts with multiple offices)
export const offices = pgTable("offices", {
  officeId: bigserial("office_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  name: varchar("name", { length: 100 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Users table (Enhanced for BetterAuth compatibility)
export const users = pgTable("users", {
  // BetterAuth required fields (with exact names it expects)
  id: varchar("id", { length: 36 }).primaryKey(), // BetterAuth expects string id
  name: varchar("name", { length: 200 }).notNull(), // BetterAuth expects 'name' field
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: boolean("email_verified").default(false),
  emailVerifiedAt: timestamp("email_verified_at"),
  image: varchar("image", { length: 255 }), // BetterAuth expects 'image' not 'profileImageUrl'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  password: varchar("password", { length: 255 }),

  // Your additional fields
  accountId: bigint("account_id", { mode: "bigint" }), // FK → accounts.account_id (nullable for social login)
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  phoneVerified: boolean("phone_verified").default(false),
  phoneVerifiedAt: timestamp("phone_verified_at"),
  timezone: varchar("timezone", { length: 50 }).default("UTC"),
  language: varchar("language", { length: 10 }).default("en"),
  preferences: jsonb("preferences").default({}),
  // Twilio/WhatsApp settings per user
  twilioSettings: jsonb("twilio_settings").default({}), // { accountSid?, authToken?, phoneNumber? (voice), whatsappNumber? (WhatsApp Business) }
  evolutionSettings: jsonb("evolution_settings").default({}), // { serverUrl?, apiKey?, instanceName?, whatsappNumber?, connected? }
  lastLogin: timestamp("last_login"),
  isVerified: boolean("is_verified").default(false),
  isActive: boolean("is_active").default(true),
  // Professional/legal fields (for hoja de encargo agent selection)
  title: varchar("title", { length: 10 }), // Honorific: "D." (male) or "D.ª" (female)
  nif: varchar("nif", { length: 50 }), // NIF/DNI of the individual agent
  collegiateNumber: varchar("collegiate_number", { length: 50 }), // Professional collegiate number (API)
  // Password for opening provider-attached PDF invoices that arrive in this
  // user's mailbox (Iberdrola consumption reports, some Endesa bills).
  // Same value for every PDF (it's the meter holder NIF), so we store it
  // once on the user instead of per-utility. NULL = no password — OCR
  // pipeline only attempts decryption when set. Treated as a credential;
  // never logged.
  pdfPassword: text("pdf_password"),
  // Onboarding tracking per user - supports multiple onboarding types
  // Structure: { [onboardingType]: { completed: boolean, completedAt: string } }
  // Example: { "initial": { completed: true, completedAt: "2024-01-15T..." }, "dashboardTour": { completed: true, completedAt: "2024-01-15T..." } }
  onboardingData: jsonb("onboarding_data").default({}),
  // Marketing/Novedades communications consent
  // null/false + null consentAt = default (never interacted) → receives novedades
  // false + consentAt set = explicitly unsubscribed → excluded from novedades
  // true + consentAt set = explicitly opted in
  marketingConsent: boolean("marketing_consent").default(false),
  marketingConsentAt: timestamp("marketing_consent_at"),
  // Default % of this agent's commission slice that they personally keep.
  // Used by the liquidación calculator: agency commission × role weight × this rate = agent payout.
  // NULL = no default; user must enter the share manually on the liquidación modal.
  commissionRatePct: decimal("commission_rate_pct", { precision: 5, scale: 2 }),
  // Better Auth admin plugin fields
  role: varchar("role", { length: 50 }),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  // Employment hire date — used for ET art. 38 pro-rata of vacation days
  // for partial-year workers. NULL = no pro-rata (full annual default).
  hireDate: date("hire_date"),
  // T&C consent tracking
  termsAcceptedAt: timestamp("terms_accepted_at"),
  termsVersion: varchar("terms_version", { length: 20 }),
});

// Roles table
export const roles = pgTable("roles", {
  roleId: bigserial("role_id", { mode: "bigint" }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: varchar("description", { length: 255 }),
  permissions: jsonb("permissions").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// UserRoles junction table (Many-to-Many relationship between users and roles)
export const userRoles = pgTable("user_roles", {
  userRoleId: bigserial("user_role_id", { mode: "bigint" }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (BetterAuth compatible)
  roleId: bigint("role_id", { mode: "bigint" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// BetterAuth tables for authentication
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 36 }).notNull(), // Changed to varchar to match users.id
  // Better Auth admin plugin: id of the admin currently impersonating this session
  impersonatedBy: varchar("impersonated_by", { length: 36 }),
});

// OAuth provider accounts linked to users
export const authAccounts = pgTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: text("account_id").notNull(), // OAuth provider account ID
  providerId: text("provider_id").notNull(), // e.g., "google", "apple", "linkedin"
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"), // For email/password auth
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Password Reset Tokens (SMS-based verification)
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  resetCode: varchar("reset_code", { length: 255 }).notNull(), // Hashed 6-digit code
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"), // NULL until used, prevents reuse
  ipAddress: text("ip_address"), // Security audit trail
  userAgent: text("user_agent"), // Security audit trail
});

// Account-Level Two-Factor Authentication Settings
export const accountTwoFactorSettings = pgTable("account_two_factor_settings", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull().unique(), // FK → accounts.account_id (one per account)
  isRequired: boolean("is_required").default(false).notNull(), // Whether 2FA is mandatory for all employees (users cannot opt out)
  enabledBy: varchar("enabled_by", { length: 36 }), // FK → users.id (admin who set the policy)
  enabledAt: timestamp("enabled_at"), // When 2FA was made mandatory
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User-Level Two-Factor Authentication (SMS-based verification)
export const twoFactor = pgTable("two_factor", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull().unique(), // FK → users.id (one per user)
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  isEnabled: boolean("is_enabled").default(true).notNull(), // Whether user has 2FA enabled
  lastCode: varchar("last_code", { length: 255 }), // Hashed last SMS code sent
  lastCodeSentAt: timestamp("last_code_sent_at"), // When the last code was sent
  lastCodeExpiresAt: timestamp("last_code_expires_at"), // When the last code expires
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Locations table
export const locations = pgTable("locations", {
  neighborhoodId: bigserial("neighborhood_id", { mode: "bigint" }).primaryKey(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 100 }).notNull(),
  neighborhoodClean: varchar("neighborhood_clean", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  polygon: jsonb("polygon").$type<Array<{ lat: number; lng: number }>>(), // Neighborhood boundary polygon from Nominatim
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  // Official INE 5-digit municipality code (cpro + cmun). Canonical anchor for
  // dedup. NULL when the muni cannot be resolved from the free-text fields.
  ineMunicipalityCode: varchar("ine_municipality_code", { length: 5 }),
  // Comunidad autónoma display name, derived from province via the INE table.
  comunidadAutonoma: varchar("comunidad_autonoma", { length: 100 }),
  // Provenance: 'cadastre' | 'google' | 'nominatim' | 'manual' | 'voice' | 'unknown'.
  // Used as a trust signal during dedup.
  source: varchar("source", { length: 20 }),
  // true = whole-city boundary polygon (cached from Nominatim) for city-only
  // prospect search areas. Excluded from the barrio picker + muni-level dedup.
  isCityBoundary: boolean("is_city_boundary").notNull().default(false),
  // NULL = global (shared / Nominatim). Non-NULL = custom polygon drawn by
  // this account; only that account sees it on maps and uses it for matching.
  accountId: bigint("account_id", { mode: "bigint" }),
});

// Properties table
export const properties = pgTable("properties", {
  // Primary Key
  propertyId: bigserial("property_id", { mode: "bigint" }).primaryKey(),

  // Account for multi-tenant security
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // Basic Information
  referenceNumber: varchar("reference_number", { length: 32 }).unique(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  // UI options: 'piso' (Piso) | 'casa' (Casa) | 'local' (Local) | 'solar' (Solar) | 'garaje' (Garaje) | 'edificio' (Edificio) | 'oficina' (Oficina) | 'industrial' (Industrial) | 'trastero' (Trastero)
  propertyType: varchar("property_type", { length: 20 }).default("piso"),
  // UI options vary by propertyType:
  //   piso: 'Tríplex' | 'Dúplex' | 'Ático' | 'Estudio' | 'Loft' | 'Piso' | 'Apartamento' | 'Bajo'
  //   casa: 'Casa' | 'Casa adosada' | 'Casa pareada' | 'Chalet' | 'Casa rústica' | 'Finca rústica' | 'Bungalow'
  //   local: 'Local Comercial' | 'Nave industrial'
  //   solar: 'Suelo residencial' | 'Suelo industrial' | 'Suelo rústico'
  //   garaje (Idealista capacity): 'motorcycle' | 'car_compact' | 'car_sedan' | 'car_and_motorcycle' | 'two_cars_and_more'
  //   edificio: 'Residencial' | 'Otros' | 'Mixto residencial' | 'Oficinas' | 'Hotel'
  propertySubtype: varchar("property_subtype", { length: 50 }),

  // Property Specifications
  bedrooms: smallint("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareMeter: integer("square_meter"),
  yearBuilt: smallint("year_built"),
  cadastralReference: varchar("cadastral_reference", { length: 255 }),
  builtSurfaceArea: decimal("built_surface_area", { precision: 10, scale: 2 }),
  // UI options: 1='Bueno' | 2='Muy bueno' | 3='Como nuevo' | 4='A reformar' | 6='Reformado'
  conservationStatus: smallint("conservation_status").default(1),

  // Location Information
  street: varchar("street", { length: 255 }),
  addressDetails: varchar("address_details", { length: 255 }),
  floor: smallint("floor"), // Floor number: 0=bajo, -1=sótano, 1+=planta
  door: varchar("door", { length: 20 }), // Door: "A", "B", "1", "Izq", "Dcha"
  postalCode: varchar("postal_code", { length: 20 }),
  neighborhoodId: bigint("neighborhood_id", { mode: "bigint" }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  // Energy and Heating
  energyCertification: text("energy_certification"),
  // UI options: 'en_tramite' (En trámite) | 'exento' (Exento) | 'uploaded' (auto-set when document uploaded)
  energyCertificateStatus: varchar("energy_certificate_status", { length: 20 }),
  // UI options: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' (A=most efficient, G=least efficient)
  energyConsumptionScale: varchar("energy_consumption_scale", { length: 2 }),
  energyConsumptionValue: decimal("energy_consumption_value", {
    precision: 6,
    scale: 2,
  }), // kWh/m² año
  // UI options: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' (A=lowest emissions, G=highest emissions)
  emissionsScale: varchar("emissions_scale", { length: 2 }),
  emissionsValue: decimal("emissions_value", { precision: 6, scale: 2 }), // kg CO2/m² año
  hasHeating: boolean("has_heating").default(false),
  // UI options: 'Gas natural' | 'Eléctrico' | 'Gasóleo' | 'Butano' | 'Propano' | 'Solar' | 'Bomba de calor' | 'Suelo radiante'
  heatingType: varchar("heating_type", { length: 50 }),

  // Basic Amenities
  hasElevator: boolean("has_elevator"),
  hasGarage: boolean("has_garage").default(false),
  hasStorageRoom: boolean("has_storage_room").default(false),

  // System Fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),

  // Property Features
  // UI options: 'abierto' (Abierto) | 'cerrado' (Cerrado)
  garageType: varchar("garage_type", { length: 50 }),
  garageSpaces: smallint("garage_spaces"),
  garageInBuilding: boolean("garage_in_building"),
  elevatorToGarage: boolean("elevator_to_garage"),
  garageNumber: varchar("garage_number", { length: 20 }),

  // Community and Recreational Amenities
  gym: boolean("gym").default(false),
  sportsArea: boolean("sports_area").default(false),
  childrenArea: boolean("children_area").default(false),
  suiteBathroom: boolean("suite_bathroom").default(false),
  nearbyPublicTransport: boolean("nearby_public_transport").default(false),
  communityPool: boolean("community_pool").default(false),
  privatePool: boolean("private_pool").default(false),
  tennisCourt: boolean("tennis_court").default(false),
  communityArea: boolean("community_area").default(false),

  // Property Characteristics
  disabledAccessible: boolean("disabled_accessible"),
  vpo: boolean("vpo"),
  videoIntercom: boolean("video_intercom"),
  conciergeService: boolean("concierge_service"),
  securityGuard: boolean("security_guard"),
  satelliteDish: boolean("satellite_dish"),
  doubleGlazing: boolean("double_glazing"),
  alarm: boolean("alarm"),
  securityDoor: boolean("security_door"),

  // Property Condition
  brandNew: boolean("brand_new"),
  newConstruction: boolean("new_construction"),
  underConstruction: boolean("under_construction"),
  needsRenovation: boolean("needs_renovation"),
  lastRenovationYear: smallint("last_renovation_year"),

  // Kitchen Features
  // UI options: 'gas' (Gas) | 'induccion' (Inducción) | 'vitroceramica' (Vitrocerámica) | 'carbon' (Carbón) | 'electrico' (Eléctrico) | 'mixto' (Mixto)
  kitchenType: varchar("kitchen_type", { length: 50 }),
  // UI options: 'Gas natural' | 'Eléctrico' | 'Gasóleo' | 'Butano' | 'Propano' | 'Solar' | 'Bomba de calor' | 'Suelo radiante'
  hotWaterType: varchar("hot_water_type", { length: 50 }),
  openKitchen: boolean("open_kitchen"),
  frenchKitchen: boolean("french_kitchen"),
  furnishedKitchen: boolean("furnished_kitchen"),
  pantry: boolean("pantry"),

  // Storage and Additional Spaces
  storageRoomSize: integer("storage_room_size"),
  storageRoomNumber: varchar("storage_room_number", { length: 20 }),
  terrace: boolean("terrace"),
  terraceSize: integer("terrace_size"),
  wineCellar: boolean("wine_cellar"),
  wineCellarSize: integer("wine_cellar_size"),
  livingRoomSize: integer("living_room_size"),
  balconyCount: smallint("balcony_count"),
  galleryCount: smallint("gallery_count"),
  buildingFloors: smallint("building_floors"),

  // Interior Features
  builtInWardrobes: boolean("built_in_wardrobes").default(false),
  // Zona seca (salón, dormitorios, pasillos): 'tarima_flotante' | 'parquet' | 'suelo_laminado' | 'madera_maciza' | 'marmol' | 'terrazo' | 'microcemento' | 'hormigon_pulido' | 'moqueta' | 'suelo_vinilico' | 'baldosa_hidraulica'
  mainFloorType: varchar("main_floor_type", { length: 50 }),
  // Zona húmeda (cocina, baños): 'gres_porcelanico' | 'azulejo_ceramico' | 'baldosa_hidraulica' | 'microcemento' | 'marmol' | 'piedra_natural' | 'gresite' | 'suelo_vinilico'
  wetFloorType: varchar("wet_floor_type", { length: 50 }),
  // UI options: 'sin_especificar' (Sin Especificar) | 'aluminio' (Aluminio) | 'plastico' (Plástico) | 'pvc' (PVC) | 'contras_madera' (Contras de Madera) | 'estores' (Estores) | 'blackout' (Blackout) | 'contraventanas' (Contraventanas)
  shutterType: varchar("shutter_type", { length: 50 }),
  // UI options: 'sin_especificar' (Sin Especificar) | 'roble' (Roble) | 'sapelly' (Sapelly) | 'nogal' (Nogal) | 'castano' (Castaño) | 'pino_rojo' (Pino rojo) | 'cerezo' (Cerezo) | 'lacada' (Lacada) | 'haya_vaporizada' (Haya vaporizada)
  carpentryType: varchar("carpentry_type", { length: 50 }),
  // UI options: 'norte' (Norte) | 'sur' (Sur) | 'este' (Este) | 'oeste' (Oeste) | 'noreste' (Noreste) | 'noroeste' (Noroeste) | 'sureste' (Sureste) | 'suroeste' (Suroeste)
  orientation: varchar("orientation", { length: 50 }),
  // UI options: 'central' (Central) | 'split' (Split) | 'portatil' (Portátil) | 'conductos' (Conductos) | 'cassette' (Cassette) | 'ventana' (Ventana)
  airConditioningType: varchar("air_conditioning_type", { length: 50 }),
  // UI options: 'aluminio' (Aluminio) | 'pvc' (PVC) | 'madera' (Madera) | 'climalit' (Climalit)
  windowType: varchar("window_type", { length: 50 }),

  // Views and Location Features
  exterior: boolean("exterior"),
  bright: boolean("bright"),
  views: boolean("views"),
  mountainViews: boolean("mountain_views"),
  seaViews: boolean("sea_views"),
  beachfront: boolean("beachfront"),

  // Luxury Amenities
  jacuzzi: boolean("jacuzzi"),
  hydromassage: boolean("hydromassage"),
  garden: boolean("garden"),
  pool: boolean("pool"),
  homeAutomation: boolean("home_automation"),
  musicSystem: boolean("music_system"),
  laundryRoom: boolean("laundry_room"),
  coveredClothesline: boolean("covered_clothesline"),
  fireplace: boolean("fireplace"),
  sauna: boolean("sauna"),
  loadingArea: boolean("loading_area"),
  patio: boolean("patio"),
  // UI options: 1='Agrícola' | 2='Comercial' | 3='Servicios' | 4='Industrial' | 8='Residencial plurifamiliar' | 9='Residencial unifamiliar'
  allowedUse: smallint("allowed_use"),
  // Solar/Land Infrastructure - Idealista Integration
  hasRoadAccess: boolean("has_road_access").default(false), // featuresUtilitiesRoadAccess
  hasSewerage: boolean("has_sewerage").default(false), // featuresUtilitiesSewerage
  hasSidewalk: boolean("has_sidewalk").default(false), // featuresUtilitiesSidewalk
  hasStreetLighting: boolean("has_street_lighting").default(false), // featuresUtilitiesStreetLighting
  nearestLocationKm: decimal("nearest_location_km", { precision: 6, scale: 2 }), // featuresNearestLocationKm

  // Rural/Land Parcel Identification (polígono/parcela system for solares)
  poligono: integer("poligono"), // Polygon district number (1-999)
  parcela: integer("parcela"), // Parcel number within polygon
  subparcelas: jsonb("subparcelas"), // Array of subparcela details: [{letter, cultivo, intensity, surfaceM2}]

  isDiafano: boolean("is_diafano"), // Only for 'local' property type - open-plan/open-space commercial
  hasEscaparate: boolean("has_escaparate"), // Only for 'local' property type - has shop window/storefront
  // UI options (only for 'local'): 'muy_transitada' (Muy transitada) | 'transitada' (Transitada) | 'moderada' (Tránsito moderado) | 'poco_transitada' (Poco transitada)
  streetType: varchar("street_type", { length: 50 }),
  // Local (commercial) property specific fields - Idealista integration
  locatedAtCorner: boolean("located_at_corner"), // featuresLocatedAtCorner - property is on a corner
  // UI options: 'street' (A pie de calle) | 'mezzanine' (Entreplanta) | 'shopping' (Centro comercial) | 'on_top_floor' (Planta alta) | 'belowGround' (Sótano) | 'other' (Otro) | 'unknown' (Desconocido)
  ubication: varchar("ubication", { length: 50 }),
  facadeArea: smallint("facade_area"), // featuresFacadeArea - meters of facade/storefront
  windowsNumber: smallint("windows_number"), // featuresWindowsShop - number of shop windows (escaparates)
  bridgeCrane: boolean("bridge_crane"), // featuresBridgeCrane - has bridge crane (puente grúa)
  smokeExtraction: boolean("smoke_extraction"), // featuresSmokeExtraction - has smoke extraction system

  // Finca (estate/land) - specific to 'casa' property type
  finca: boolean("finca").default(false), // Indicates if the casa has an estate/land
  superficieFinca: decimal("superficie_finca", { precision: 10, scale: 2 }), // Surface area of the estate in m²

  // Utilities and Installations
  // UI options: 'monofasica' (Monofásica) | 'trifasica' (Trifásica) | 'mixta' (Mixta) | 'no_disponible' (No disponible)
  electricityType: varchar("electricity_type", { length: 50 }),
  // UI options: 'nuevo' (Nuevo) | 'buen_estado' (Buen estado) | 'funcional' (Funcional) | 'necesita_actualizacion' (Necesita actualización) | 'necesita_reparacion' (Necesita reparación) | 'no_disponible' (No disponible)
  electricityStatus: varchar("electricity_status", { length: 50 }),
  // UI options: 'cobre' (Cobre) | 'pvc' (PVC) | 'multicapa' (Multicapa) | 'galvanizado' (Galvanizado) | 'mixto' (Mixto) | 'no_disponible' (No disponible)
  plumbingType: varchar("plumbing_type", { length: 50 }),
  // UI options: 'nuevo' (Nuevo) | 'buen_estado' (Buen estado) | 'funcional' (Funcional) | 'necesita_actualizacion' (Necesita actualización) | 'tiene_fugas' (Tiene fugas) | 'necesita_reparacion' (Necesita reparación) | 'no_disponible' (No disponible)
  plumbingStatus: varchar("plumbing_status", { length: 50 }),

  // Property Expenses - Taxes & Fees
  ibi: decimal("ibi", { precision: 10, scale: 2 }), // IBI property tax (€/year)
  garbageTax: decimal("garbage_tax", { precision: 10, scale: 2 }), // Garbage collection tax (€/year)
  vadoPermanente: decimal("vado_permanente", { precision: 10, scale: 2 }), // Permanent driveway permit (€/year)

  // Property Expenses - Community
  communityFees: decimal("community_fees", { precision: 10, scale: 2 }), // HOA/community fees (€/month)
  derrama: decimal("derrama", { precision: 10, scale: 2 }), // Special community assessment (€)

  // Property Expenses - Utility Estimates
  electricityEstimate: decimal("electricity_estimate", {
    precision: 10,
    scale: 2,
  }), // Estimated electricity (€/month)
  gasEstimate: decimal("gas_estimate", { precision: 10, scale: 2 }), // Estimated gas (€/month)
  waterEstimate: decimal("water_estimate", { precision: 10, scale: 2 }), // Estimated water (€/month)
  centralHeatingFee: decimal("central_heating_fee", {
    precision: 10,
    scale: 2,
  }), // Central heating fee (€/month)
  internetEstimate: decimal("internet_estimate", { precision: 10, scale: 2 }), // Estimated internet (€/month)

  // Property Expenses - Insurance
  homeInsurance: decimal("home_insurance", { precision: 10, scale: 2 }), // Home insurance (€/year)

  // Property Expenses - Mortgage (rental profitability inputs)
  mortgageMonthly: decimal("mortgage_monthly", { precision: 12, scale: 2 }), // Total monthly mortgage payment (€/month)
  mortgageInterestRate: decimal("mortgage_interest_rate", {
    precision: 5,
    scale: 3,
  }), // APR % (optional; enables later interest/principal split)

  // Legal documentation extracted by AI from documentacion-legal docs
  // (escritura, nota simple, catastro). Fields already on this table
  // (cadastralReference, builtSurfaceArea, yearBuilt, address) are verified
  // via the UI but not duplicated here.
  legalFields: jsonb("legal_fields")
    .$type<{
      // Registry references
      fincaNumber?: string;
      tomo?: string;
      libro?: string;
      folio?: string;
      registryOffice?: string;
      // Acquisition (escritura, nota simple)
      acquisitionDate?: string; // ISO
      acquisitionPrice?: number; // €
      acquisitionMethod?:
        | "compraventa"
        | "herencia"
        | "donacion"
        | "permuta"
        | "otro";
      // Notary (escritura)
      notaryName?: string;
      notaryProtocol?: string;
      // Catastro-specific
      catastralValue?: number; // €
      participationCoefficient?: number; // %
      plotArea?: number; // m²
      usableArea?: number; // m²
      landUse?: string;
      // Charges (nota simple) — critical for due diligence
      charges?: Array<{
        type: string; // "hipoteca" | "embargo" | "usufructo" | "afeccion" | "servidumbre" | other
        creditor?: string;
        amount?: number;
        description?: string;
      }>;
      cargasFree?: boolean; // true if "libre de cargas"
      // Owners (informational, verified against contacts elsewhere)
      registeredOwners?: Array<{
        name: string;
        nif?: string;
        sharePct?: number;
      }>;
      // Meta
      extractedFrom?: ("escritura" | "nota-simple" | "catastro")[];
      extractedAt?: string;
    }>()
    .default({}),

  // Mortgage data extracted by AI from the "hipoteca" folder.
  // Covers both buyer-side docs (new mortgage on this property: tasación,
  // FEIN, escritura de hipoteca) and seller-side docs (existing mortgage:
  // deuda pendiente, cancelación registral). Hybrid storage: stage here
  // first; promote-to-deal flow can later backfill deals.mortgageAmount /
  // mortgageBankName / mortgageInterestRate / mortgageYears for buyer-side data.
  mortgageFields: jsonb("mortgage_fields")
    .$type<{
      // Tasación — bank appraisal (buyer-side, required for any mortgage)
      tasacion?: {
        appraisedValue?: number; // €
        surveyDate?: string; // ISO
        appraiserCompany?: string; // Tinsa, ST, Arquitasa, etc.
        method?: "comparacion" | "residual" | "coste" | "otro";
        conservationState?: string; // "Normal" | "Bueno" | "Deficiente"
        warnings?: string;
        validUntil?: string; // ISO (appraisal validity ~6 months)
      };

      // FEIN — binding mortgage offer under Ley 5/2019
      fein?: {
        offerReference?: string;
        bankName?: string;
        borrowerFullName?: string;
        borrowerNif?: string;
        principalAmount?: number; // €
        termYears?: number;
        rateType?: "fijo" | "variable" | "mixto";
        nominalRatePct?: number; // TIN %
        aprPct?: number; // TAE %
        monthlyPayment?: number; // €
        totalCost?: number; // €
        linkedProducts?: string[];
        openingCommissionPct?: number;
        earlyRepaymentCommissionPct?: number;
        offerValidUntil?: string; // ISO
        bindingPeriodEnd?: string; // ISO (10-day cooling-off)
        stateSubsidized?: boolean; // VPO
      };

      // Escritura de Hipoteca — notarized mortgage deed at closing
      escrituraHipoteca?: {
        notaryName?: string;
        notaryProtocol?: string;
        notaryCity?: string;
        deedDate?: string; // ISO
        bankName?: string;
        borrowers?: Array<{ fullName: string; nif?: string }>;
        principalAmount?: number; // €
        termYears?: number;
        rateType?: "fijo" | "variable" | "mixto";
        nominalRatePct?: number;
        monthlyPayment?: number;
        firstMortgage?: boolean;
      };

      // Certificado de Deuda — outstanding mortgage debt (or zero-balance)
      deuda?: {
        bankName?: string;
        loanReference?: string; // mortgage account ID
        borrowerFullName?: string;
        borrowerNif?: string;
        outstandingAmount?: number; // € (0 for "deuda cero")
        status?: "pendiente" | "cero";
        issueDate?: string; // ISO
        validUntil?: string; // ISO (typically +3 months)
        cancellationCost?: number; // € early-repayment commission
        accruedInterest?: number; // €
      };

      // Cancelación Registral — official mortgage cancellation at registry
      cancelacion?: {
        notaryName?: string;
        notaryProtocol?: string;
        deedDate?: string; // ISO
        bankName?: string;
        bankRepresentative?: string;
        borrowerFullName?: string;
        registryCancellationDate?: string; // ISO (when filed at registry)
      };

      // Meta — applies across all sub-sections
      extractedFrom?: (
        | "tasacion"
        | "fein"
        | "escritura-hipoteca"
        | "certificado-deuda-hipoteca"
        | "cancelacion-registral"
      )[];
      extractedAt?: string;
    }>()
    .default({}),

  // Contract data extracted by AI from the "contratos" folder.
  // Nested by contract type. The jsonb is a staging area — users can
  // promote the extracted data to the native deals/leases tables via a
  // "Crear trato"/"Crear contrato de alquiler" button in the validation modal.
  //
  // NOTE on duplicates:
  //  - propertyAddress, cadastralReference, builtArea are extracted for UI
  //    verification only (modal shows them), but NOT persisted here — the
  //    canonical source is the `properties` table.
  //  - fincaNumber and registryOffice (compraventa) are routed to
  //    `properties.legalFields` instead — single source of truth.
  contractFields: jsonb("contract_fields")
    .$type<{
      // Contrato de Arras — deposit contract
      arras?: {
        buyers?: Array<{ fullName: string; nif?: string; address?: string }>;
        sellers?: Array<{ fullName: string; nif?: string; address?: string }>;
        salePrice?: number; // €
        arrasAmount?: number; // €
        arrasPct?: number; // computed
        arrasType?: "confirmatorias" | "penitenciales" | "penales";
        signingDate?: string; // ISO
        deedDeadline?: string; // ISO
        durationDays?: number;
        subjectToMortgage?: boolean;
        mortgageAmount?: number; // €
        financingDeadline?: string; // ISO
        occupancyStatus?: "libre" | "arrendado" | "ocupado" | "otro";
        chargesToCancel?: Array<{
          type: string;
          creditor?: string;
          amount?: number;
        }>;
        costAllocation?: string;
        penaltyClause?: string;
      };

      // Escritura de Compraventa — sale deed (this transaction)
      compraventa?: {
        buyers?: Array<{ fullName: string; nif?: string }>;
        sellers?: Array<{ fullName: string; nif?: string }>;
        // Notary info — kept here (not in deals) until a promote-to-deal flow copies it over
        notaryName?: string;
        notaryProtocol?: string;
        notaryCity?: string;
        deedDate?: string; // ISO
        declaredPrice?: number; // €
        paymentMethod?: "cash" | "transfer" | "check" | "mortgage" | "mixed";
        paymentDetails?: string;
        mortgageAmount?: number; // €
        mortgageBank?: string;
        deliveryDate?: string; // ISO
        occupancyStatus?: "libre" | "arrendado" | "ocupado" | "otro";
        communityDebtFree?: boolean;
        pendingDerramas?: string;
        // Charges at closing — semantically distinct from legalFields.charges
        // (which come from nota simple / historical registry state). Compraventa
        // charges represent what's being cancelled or transferred in this
        // specific transaction.
        charges?: Array<{
          type: string;
          creditor?: string;
          amount?: number;
          description?: string;
        }>;
      };

      // Contrato de Alquiler — rental contract (LAU-regulated)
      alquiler?: {
        landlords?: Array<{ fullName: string; nif?: string }>;
        tenants?: Array<{ fullName: string; nif?: string }>;
        guarantors?: Array<{ fullName: string; nif?: string }>;
        startDate?: string; // ISO
        endDate?: string; // ISO
        durationMonths?: number;
        minimumStayEndDate?: string; // ISO
        monthlyRent?: number; // €/month
        securityDeposit?: number; // €
        additionalGuarantee?: number; // €
        usage?:
          | "residencial"
          | "comercial"
          | "seasonal"
          | "short_term"
          | "otro";
        tacitRenewal?: boolean;
        hasIpcClause?: boolean;
        ipcUpdateMonth?: number; // 1-12
        paymentDueDay?: number; // 1-28
        paymentMethod?: string; // comma-separated
        paymentAccountIban?: string;
        furnished?: boolean;
        appliances?: string[];
        earlyTerminationPenalty?: string;
        lateExitPenalty?: string;
        governingLaw?: string;
        jurisdiction?: string;
      };

      // Meta
      extractedFrom?: (
        | "contrato-arras"
        | "contrato-alquiler"
        | "escritura-compraventa"
      )[];
      extractedAt?: string;
    }>()
    .default({}),

  // Utility supply data extracted by AI from the "suministros" folder
  // (facturas de luz, gas, agua, internet). Nested by utility type.
  // The most valuable extraction is the CUPS / supply point numbers which
  // are essential for contract transfers at property handover.
  utilityFields: jsonb("utility_fields")
    .$type<{
      electricity?: {
        cups?: string; // supply point (ES...20 chars)
        provider?: string; // Iberdrola, Endesa, Naturgy, etc.
        contractHolder?: string; // name of contract holder
        contractHolderNif?: string;
        contractedPower?: number; // kW
        tariff?: string; // e.g. "2.0TD"
        lastInvoiceAmount?: number; // € on last invoice seen
        lastInvoicePeriodStart?: string; // ISO
        lastInvoicePeriodEnd?: string; // ISO
        lastInvoiceDueDate?: string; // ISO
        lastInvoiceNumber?: string;
        lastUpdatedAt?: string; // ISO
      };
      gas?: {
        cups?: string;
        provider?: string;
        contractHolder?: string;
        contractHolderNif?: string;
        tariff?: string;
        lastInvoiceAmount?: number;
        lastInvoicePeriodStart?: string;
        lastInvoicePeriodEnd?: string;
        lastInvoiceDueDate?: string;
        lastInvoiceNumber?: string;
        lastUpdatedAt?: string;
      };
      water?: {
        supplyNumber?: string; // water doesn't have CUPS; use contract number
        provider?: string;
        contractHolder?: string;
        contractHolderNif?: string;
        lastInvoiceAmount?: number;
        lastInvoicePeriodStart?: string;
        lastInvoicePeriodEnd?: string;
        lastInvoiceDueDate?: string;
        lastInvoiceNumber?: string;
        lastUpdatedAt?: string;
      };
      internet?: {
        provider?: string;
        contractHolder?: string;
        contractHolderNif?: string;
        monthlyAmount?: number;
        lastInvoiceNumber?: string;
        lastUpdatedAt?: string;
      };
      // Meta — applies across all sub-sections
      extractedAt?: string;
    }>()
    .default({}),

  // Tax and payment data extracted by AI from the "impuestos-pagos" folder.
  // Nested by document type to avoid prefix collisions as more tax docs
  // are added (modelo 211 for non-resident withholding, modelo 303 for IVA,
  // comprobación de valores, etc.).
  taxFields: jsonb("tax_fields")
    .$type<{
      // IBI (Impuesto sobre Bienes Inmuebles) — annual municipal property tax
      ibi?: {
        year?: number; // fiscal year
        amount?: number; // € paid that year
        municipality?: string; // ayuntamiento
        catastralValue?: number; // valor catastral total
        catastralValueLand?: number; // valor catastral del suelo
        catastralValueConstruction?: number; // valor catastral construcción
        ratePct?: number; // tax rate applied
        paidDate?: string; // ISO
        receiptNumber?: string;
        status?: "pagado" | "pendiente";
      };

      // Modelo 600 — ITP / AJD / ISD (transmission taxes)
      modelo600?: {
        concept?: "ITP" | "AJD" | "ISD"; // which tax concept
        transaction?: "compraventa" | "donacion" | "herencia" | "otro";
        taxBase?: number; // € declared value
        ratePct?: number; // %
        amount?: number; // € paid
        filingDate?: string; // ISO
        referenceNumber?: string; // justificante number
        autonomousCommunity?: string; // CCAA where filed
      };

      // Plusvalía Municipal (IIVTNU)
      plusvalia?: {
        amount?: number; // € tax due/paid
        taxBase?: number; // € valor catastral del suelo used as base
        gainYears?: number; // years of ownership
        method?: "objetivo" | "real"; // calculation method
        municipality?: string;
        transferDate?: string; // ISO (devengo = sale date)
        paymentDate?: string; // ISO (when actually paid)
        status?: "pagado" | "pendiente";
        referenceNumber?: string;
        exemption?: string; // e.g. "pérdida patrimonial"
      };

      // Meta — applies across all sub-sections
      extractedFrom?: ("ibi" | "modelo-600" | "plusvalia-municipal")[];
      extractedAt?: string;
    }>()
    .default({}),

  // Certificate data extracted by AI from the "certificados" folder.
  // Nested by certificate type to keep each cert's data in its own bucket
  // and avoid prefix-collision as more cert types are added (BIE, gas,
  // calderas, CFO, LPO, antigüedad, etc.). The energy performance certificate
  // (CEE) has its own dedicated columns above.
  certificateFields: jsonb("certificate_fields")
    .$type<{
      // Cédula de Habitabilidad
      cedula?: {
        issueDate?: string; // ISO
        expiryDate?: string; // ISO
        issuingBody?: string; // e.g. "Generalitat de Catalunya"
        maxOccupants?: number;
        reference?: string; // certificate number/ID
      };

      // ITE / IEE — Inspección Técnica del Edificio
      ite?: {
        result?: "favorable" | "desfavorable" | "condicionada";
        date?: string; // ISO inspection date
        nextDate?: string; // ISO next required inspection
        inspector?: string; // architect/inspector name
        defects?: Array<{ description: string; severity?: string }>;
      };

      // Certificado de Comunidad
      comunidad?: {
        debtAmount?: number; // € pending debt; 0 if none
        debtFree?: boolean; // true if "al corriente"
        administrator?: string; // administrator name/firm
        issueDate?: string; // ISO
        periodCovered?: string; // free-form (e.g. "hasta 31/12/2025")
        monthlyFee?: number; // €/month if mentioned
      };

      // Meta — applies across all sub-sections
      extractedFrom?: (
        | "cedula-habitabilidad"
        | "ite"
        | "certificado-comunidad"
      )[];
      extractedAt?: string;
    }>()
    .default({}),

  // Data Processing Fields
  scrapedText: varchar("scraped_text", { length: 1024 }), // S3 path for property scraped text data
  // Nearby amenities (Ubicación subsection in the characteristics form)
  nearbySchools: boolean("nearby_schools").default(false),
  nearbyKindergarten: boolean("nearby_kindergarten").default(false),
  nearbyHealthCenter: boolean("nearby_health_center").default(false),
  nearbySupermarket: boolean("nearby_supermarket").default(false),
  nearbyPharmacy: boolean("nearby_pharmacy").default(false),
  nearbySportsCenter: boolean("nearby_sports_center").default(false),
  // True when a commercial premises (local) has an active operating license.
  // Distinct from `listings.short_term_license` (touristic, residential).
  commercialLicense: boolean("commercial_license").default(false),
  hasElectricInstallation: boolean("has_electric_installation").default(false),
  automaticDoor: boolean("automatic_door").default(false),
  hasPhoneLine: boolean("has_phone_line").default(false),
  remoteControl: boolean("remote_control").default(false),
  ceilingHeight: decimal("ceiling_height", { precision: 5, scale: 2 }),
  // Pisos.com (Habitatsoft) — feature catalogue gaps the platform asks
  // for but Vesta didn't store. Migration: pisoscom_feature_columns.
  bedroomsDouble: smallint("bedrooms_double"), // FeatureId 4
  bedroomsSingle: smallint("bedrooms_single"), // FeatureId 5
  neighborCount: smallint("neighbor_count"), // FeatureId 12
  energyCertificateRegistryNumber: varchar(
    "energy_certificate_registry_number",
    { length: 100 },
  ), // FeatureId 13
  // Acondicionamiento del local. Tri-estado a propósito — NULL es "no consta",
  // y SIN DEFAULT (migración 0350 del CRM) para que una ficha nueva no nazca
  // afirmando "sin acondicionar". Mantener sin `.default(false)`: si este espejo
  // del esquema lo reintroduce, un `drizzle-kit push` desde aquí volvería a
  // poner el DEFAULT en la base compartida y desharía esa migración.
  isFittedOut: boolean("is_fitted_out"),
  inCommercialGallery: boolean("in_commercial_gallery").default(false),
  idealFor: text("ideal_for"),
  lastBusiness: text("last_business"),
  barbecue: boolean("barbecue").default(false),
  septicTank: boolean("septic_tank").default(false),
  automaticIrrigation: boolean("automatic_irrigation").default(false),
  basketballCourt: boolean("basketball_court").default(false),
  accessType: varchar("access_type", { length: 50 }),
  wellType: varchar("well_type", { length: 50 }),
  fincaType: varchar("finca_type", { length: 50 }),
  fencingType: varchar("fencing_type", { length: 50 }),
  terrainType: varchar("terrain_type", { length: 50 }),
  titleType: varchar("title_type", { length: 50 }),
  accessRoadType: varchar("access_road_type", { length: 50 }),
  hasElectricity: boolean("has_electricity").default(false),
  isRegistered: boolean("is_registered").default(false),
  // Pool water type, shown when `pool` is set: 'sal' (saltwater) | 'cloro' (chlorine)
  poolType: varchar("pool_type", { length: 20 }),
  // Photovoltaic / solar panels installed (energy equipment)
  solarPanels: boolean("solar_panels").default(false),
  // Nearby amenities bundle (boolean flags) — added 2026-05-16 for inmovilla
  // Source CRMs (e.g. inmovilla) ship 10+ separate "near hospitals/schools/transport"
  // booleans. Bundle them here as a single object: {schools, hospitals, supermarkets,
  // shoppingCentres, parks, university, beach, mountain, train, metro, bus, tram, ...}.
  // Existing properties.nearby_public_transport stays as a coarse OR-of-transport.
  nearbyAmenities: jsonb("nearby_amenities")
    .$type<{
      schools?: boolean;
      hospitals?: boolean;
      medicalCentres?: boolean;
      supermarkets?: boolean;
      shoppingCentres?: boolean;
      parks?: boolean;
      university?: boolean;
      beach?: boolean;
      mountain?: boolean;
      golf?: boolean;
      train?: boolean;
      metro?: boolean;
      bus?: boolean;
      tram?: boolean;
      central?: boolean; // "Céntrico"
      rural?: boolean; // "Rural"
    } | null>()
    .default({}),
  // Per-room square meters (numerics) — added 2026-05-16 for inmovilla
  // properties.squareMeter holds the total only. Source CRMs sometimes carry
  // per-room metres (kitchen, dining, living, patio, basement, parcel, mezzanine,
  // ground-floor, top-floor). Stash here as { kitchen, dining, basement, patio,
  // mezzanine, parcel, groundFloor, perFloor }. All in m² as numbers.
  roomSizes: jsonb("room_sizes")
    .$type<{
      kitchen?: number;
      dining?: number;
      basement?: number;
      patio?: number;
      mezzanine?: number;
      parcel?: number;
      groundFloor?: number;
      perFloor?: number;
    } | null>()
    .default({}),
  // 2026-05-16 (round 2) — low-value inmovilla columns recovered from Section 4.
  // facadeType: 18 distinct values in source (`tipofachada_fachada`) — stored as raw
  //   varchar, no enum (downstream UI can normalise if it cares).
  // waterIncluded: 0/1 from `ofertas_agua`.
  facadeType: varchar("facade_type", { length: 50 }),
  waterIncluded: boolean("water_included"),
});

export const propertyImages = pgTable("property_images", {
  propertyImageId: bigserial("property_image_id", {
    mode: "bigint",
  }).primaryKey(),
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(),
  referenceNumber: varchar("reference_number", { length: 32 }).notNull(),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  thumbUrl: varchar("thumb_url", { length: 500 }),
  medUrl: varchar("med_url", { length: 500 }),
  fullUrl: varchar("full_url", { length: 500 }),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  imageKey: varchar("image_key", { length: 2048 }).notNull(),
  imageTag: varchar("image_tag", { length: 255 }),
  tourProvider: varchar("tour_provider", { length: 50 }),
  s3key: varchar("s3key", { length: 2048 }).notNull(),
  imageOrder: integer("image_order").default(0).notNull(),
  originImageId: bigint("origin_image_id", { mode: "bigint" }),
  // AI-recommended Vesta Studio fixes for this photo, e.g.
  // ["enhance-lighting","remove-clutter"]. Populated in the background after
  // upload by classifyPropertyImageFixes(). Values are Studio op keys.
  suggestedFixes: text("suggested_fixes").array(),
  // Editable AI-authored narrative for the cinematic public page (per photo).
  narrativeTitle: varchar("narrative_title", { length: 120 }),
  narrativeSubtitle: varchar("narrative_subtitle", { length: 280 }),
});

export const listings = pgTable("listings", {
  // Primary Key
  listingId: bigserial("listing_id", { mode: "bigint" }).primaryKey(),

  // Account for multi-tenant security
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // Basic Information
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(), // FK → properties.property_id
  agentId: varchar("agent_id", { length: 36 }).notNull(), // FK → users.user_id (agent) - Changed to varchar to match users.id
  // UI options: 'Sale' (Venta) | 'Rent' (Alquiler) | 'Transfer' (Transferencia) | 'RentWithOption' (Alquiler con opción a compra) | 'RoomSharing' (Compartir habitación)
  listingType: varchar("listing_type", { length: 20 }).notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  // UI options: 'En Venta' | 'En Alquiler' | 'Vendido' | 'Alquilado' | 'Descartado' | 'Draft' | 'Pendiente'
  status: varchar("status", { length: 20 }).notNull(),
  // UI options: 'En búsqueda' | 'En preparación' | 'Finalizado' | 'Archivado'
  prospectStatus: varchar("prospect_status", { length: 50 }),
  discardReason: varchar("discard_reason", { length: 500 }), // Reason for discarding listing (when status = 'Descartado')

  // Listing-specific descriptions
  publishableTitle: varchar("publishable_title", { length: 255 }), // Override title sent to portals and web (falls back to properties.title if null)
  description: text("description"), // Full listing description (can differ from property description)
  shortDescription: varchar("short_description", { length: 500 }), // Brief summary for listing cards/previews

  // Listing Features
  isFurnished: boolean("is_furnished"),
  // UI options: 'basic' (Básico) | 'standard' (Estándar) | 'high' (Alta) | 'luxury' (Lujo)
  furnitureQuality: varchar("furniture_quality", { length: 50 }),
  optionalGarage: boolean("optional_garage"),
  optionalGaragePrice: decimal("optional_garage_price", {
    precision: 12,
    scale: 2,
  }),
  optionalStorageRoom: boolean("optional_storage_room")
    .notNull()
    .default(false),
  optionalStorageRoomPrice: decimal("optional_storage_room_price", {
    precision: 12,
    scale: 2,
  }),
  hasKeys: boolean("has_keys").notNull().default(false),
  keysNumber: varchar("keys_number", { length: 50 }),
  encargo: boolean("encargo").notNull().default(false),
  studentFriendly: boolean("student_friendly"),
  petsAllowed: boolean("pets_allowed"),
  appliancesIncluded: boolean("appliances_included"),

  // Appliances and Amenities
  internet: boolean("internet").default(false),
  oven: boolean("oven").default(false),
  microwave: boolean("microwave").default(false),
  washingMachine: boolean("washing_machine").default(false),
  secadora: boolean("secadora").default(false),
  fridge: boolean("fridge").default(false),
  tv: boolean("tv").default(false),
  stoneware: boolean("stoneware").default(false),

  // Listing Status and Visibility
  isFeatured: boolean("is_featured").default(false),
  isBankOwned: boolean("is_bank_owned").default(false),
  isOpportunity: boolean("is_opportunity").default(false), // Mark listing as a special opportunity/deal
  isActive: boolean("is_active").default(true),
  publishToWebsite: boolean("publish_to_website").default(false), // Controls whether listing appears on company website
  // Instante del cierre comercial (Vendido / Alquilado / Descartado). Ancla de
  // la ventana "un vendido sigue visible N días" — ver
  // `visibleStatusCondition` en queries/filters.ts. Deliberadamente NO se usa
  // `updatedAt`: cualquier edición lo reinicia. NULL = nunca cerrado o
  // reabierto. Migración 0305 del CRM.
  closedAt: timestamp("closed_at", { withTimezone: true }),
  // UI options: 1=Exact location (Ubicación exacta) | 2=Street level (Calle) | 3=Zone/neighborhood level (Zona)
  visibilityMode: smallint("visibility_mode").default(1),

  // Analytics
  viewCount: integer("view_count").default(0),
  inquiryCount: integer("inquiry_count").default(0),

  // Portal Publication Fields (Spanish real estate portals)
  fotocasa: boolean("fotocasa").default(false), // Fotocasa.es publication status
  idealista: boolean("idealista").default(false), // Idealista.com publication status
  habitaclia: boolean("habitaclia").default(false), // Habitaclia.com publication status
  pisoscom: boolean("pisoscom").default(false), // Pisos.com publication status
  yaencontre: boolean("yaencontre").default(false), // Yaencontre.com publication status
  enalquiler: boolean("enalquiler").default(false), // EnAlquiler.com publication status
  milanuncios: boolean("milanuncios").default(false), // Milanuncios.com publication status
  kyero: boolean("kyero").default(false), // Kyero international portal (Adevinta)
  spainhouses: boolean("spainhouses").default(false), // Spainhouses international portal (Adevinta)
  thinkspain: boolean("thinkspain").default(false), // Think Spain portal (Adevinta)
  listglobally: boolean("listglobally").default(false), // ListGlobally international portal (Adevinta)

  // Fotocasa-specific settings (explicit fields for better performance and type safety)
  // UI options: 1=Exact (Ubicación exacta) | 2=Street (Calle) | 3=Zone (Zona)
  fcLocationVisibility: smallint("fc_location_visibility").default(1).notNull(),
  fcPriceVisibility: boolean("fc_price_visibility").default(false).notNull(), // true=hidden, false=shown

  // Idealista-specific settings (address visibility uses fcLocationVisibility - shared with Fotocasa)
  // UI options: 'exact' (Exacta) | 'moved' (Desplazada)
  idCoordinatesPrecision: varchar("id_coordinates_precision", { length: 10 }),
  // UI options: 'idealista' (Visible en Idealista) | 'microsite' (Solo micrositio) | 'private' (Privada) - null by default
  idPropertyVisibility: varchar("id_property_visibility", { length: 20 }),
  idealistaReference: varchar("idealista_reference", { length: 100 }),

  // Rental-specific fields (only for rent operations)
  // UI options: 'residential' (Residencial) | 'seasonal' (Temporada) | 'short_term' (Vacacional) - MUTUALLY EXCLUSIVE
  rentalType: varchar("rental_type", { length: 20 }),
  shortTermLicense: varchar("short_term_license", { length: 100 }), // Required if rentalType = "short_term"

  // Rental Terms (deposit and guarantees)
  securityDeposit: decimal("security_deposit", { precision: 10, scale: 2 }), // Security deposit amount (€)
  additionalGuarantee: decimal("additional_guarantee", {
    precision: 10,
    scale: 2,
  }), // Additional guarantee amount (€)
  bankGuaranteeRequired: boolean("bank_guarantee_required").default(false), // Bank guarantee requirement
  managementFees: decimal("management_fees", { precision: 10, scale: 2 }), // Property management fees (€/month)
  nonPaymentInsurance: boolean("non_payment_insurance").default(false), // Landlord's non-payment insurance
  nonPaymentInsuranceAmount: decimal("non_payment_insurance_amount", {
    precision: 10,
    scale: 2,
  }), // Non-payment insurance cost (€/year)

  // Sale-specific fields (only for sale operations)
  // UI options: 'free' (Libre) | 'tenanted' (Alquilado) | 'bare_ownership' (Nuda propiedad) | 'illegally_occupied' (Ocupado)
  occupationStatus: varchar("occupation_status", { length: 20 }),

  // Commercial Transfer fields (only for 'local' property type - Idealista integration)
  isATransfer: boolean("is_a_transfer"), // featuresIsATransfer - indicates if the local is a transfer (traspaso)
  priceTransfer: decimal("price_transfer", { precision: 12, scale: 2 }), // operationPriceTransfer - transfer price (only if isATransfer = true)
  // UI options: 'bar' (Bar) | 'cafeteria' (Cafetería) | 'restaurant' (Restaurante) | 'pub' (Pub) | 'disco' (Discoteca) | 'bakery' (Panadería) | 'butcher' (Carnicería) | 'fishmonger' (Pescadería) | 'grocery' (Ultramarinos) | 'supermarket' (Supermercado) | 'clothing' (Ropa) | 'shoes' (Zapatería) | 'jewelry' (Joyería) | 'furniture' (Muebles) | 'electronics' (Electrónica) | 'pharmacy' (Farmacia) | 'herbalist' (Herbolario) | 'beauty' (Estética) | 'hair_salon' (Peluquería) | 'gym' (Gimnasio) | 'travel_agency' (Agencia de viajes) | 'real_estate' (Inmobiliaria) | 'insurance' (Seguros) | 'bank' (Banca) | 'academy' (Academia) | 'nursery' (Guardería) | 'medical' (Clínica médica) | 'dental' (Clínica dental) | 'veterinary' (Veterinario) | 'workshop' (Taller) | 'garage' (Garaje) | 'printing' (Imprenta) | 'laundry' (Lavandería) | 'other' (Otro)
  commercialMainActivity: varchar("commercial_main_activity", { length: 50 }),
  // Same options as commercialMainActivity
  commercialSecondaryActivity: varchar("commercial_secondary_activity", {
    length: 50,
  }),
  transferEndContract: varchar("transfer_end_contract", { length: 7 }), // featuresTransferEndContractDate - yyyy-mm format (only if isATransfer + operation=rent)
  transferIncludedItems: jsonb("transfer_included_items").$type<string[]>(), // Items included in the transfer (e.g. "Nevera", "Sillas", "Barra de bar")

  // Catalonia-specific (mandatory for rentals in Catalonia)
  priceReferenceIndex: decimal("price_reference_index", {
    precision: 10,
    scale: 2,
  }), // 0.01-10000, mandatory for Catalonia rentals

  // Portal-specific configuration (JSON objects containing portal settings)
  fotocasaProps: jsonb("fotocasa_props").default({}), // Legacy JSON field (migrate to explicit fields above)
  idealistaProps: jsonb("idealista_props").default({}), // Portal-specific settings for Idealista
  habitacliaProps: jsonb("habitaclia_props").default({}), // Portal-specific settings for Habitaclia
  pisoscomProps: jsonb("pisoscom_props").default({}), // Portal-specific settings for Pisos.com
  yaencontreProps: jsonb("yaencontre_props").default({}), // Portal-specific settings for Yaencontre
  enalquilerProps: jsonb("enalquiler_props").default({}), // Portal-specific settings for EnAlquiler
  milanunciosProps: jsonb("milanuncios_props").default({}), // Portal-specific settings for Milanuncios
  kyeroProps: jsonb("kyero_props").default({}), // Portal-specific settings for Kyero
  spainhousesProps: jsonb("spainhouses_props").default({}), // Portal-specific settings for Spainhouses
  thinkspainProps: jsonb("thinkspain_props").default({}), // Portal-specific settings for Think Spain
  listgloballyProps: jsonb("listglobally_props").default({}), // Portal-specific settings for ListGlobally

  // Per-listing watermark overrides (overrides account-level watermark config)
  watermarkProps: jsonb("watermark_props").$type<{
    enabled?: boolean; // undefined/true = inherit account, false = disabled for this listing
    customImageUrl?: string; // Custom watermark image (overrides account logo)
    position?: "southeast" | "northeast" | "southwest" | "northwest" | "center";
    sizePercentage?: number;
    opacity?: number;
  }>(),

  // Portal URLs (stored after publishing, preserved for history)
  portalLinks: jsonb("portal_links")
    .$type<Record<string, string | null>>()
    .default({}), // { idealista: "https://...", fotocasa: "https://...", ... }

  // Progress Stage Tracking
  fichaCompletedAt: timestamp("ficha_completed_at"), // When all mandatory fields were first completed (24% stage)

  // Hoja de Encargo Authorizations
  allowSignage: boolean("allow_signage").default(true), // Authorization to place advertising signage on property
  allowVisits: boolean("allow_visits").default(true), // Authorization for property visits by interested parties
  allowKeyDelivery: boolean("allow_key_delivery").default(true), // Owner authorizes/commits to deliver keys to agency
  allowPortalPublication: boolean("allow_portal_publication").default(true), // Authorization to publish on real estate portals

  // Hoja de Encargo extracted fields (populated by AI document analysis)
  encargoFields: jsonb("encargo_fields")
    .$type<{
      encargoStartDate?: string; // ISO date string
      encargoEndDate?: string; // ISO date string
      encargoDurationMonths?: number;
    }>()
    .default({}),

  // Rental Management
  rentManaged: boolean("rent_managed").default(false), // Whether this rental is actively managed (appears in Alquileres module)

  // Utility split mode override (null = inherit accounts.utility_split_mode_default)
  // Values: 'equal_occupied' | 'equal_all_rooms' | 'by_m2'
  utilitySplitMode: varchar("utility_split_mode", { length: 30 }),

  // Commission Type
  // UI options: 'normal' (Normal) | 'zona' (Semi-exclusiva) | 'exclusiva' (Exclusiva)
  commissionType: varchar("commission_type", { length: 20 }).default("normal"),
  commissionOverrides: jsonb("commission_overrides"), // Per-listing commission rate overrides for negotiated deals

  // Valuation
  valuation: decimal("valuation", { precision: 12, scale: 2 }), // Property valuation estimate from external API
  valuationSqm: decimal("valuation_sqm", { precision: 10, scale: 2 }), // €/m² from Residelia API
  valuationData: jsonb("valuation_data"), // Full Residelia response (comparables, similarity %, input enrichment)
  valuatedAt: timestamp("valuated_at"), // When last valued
  customValuation: jsonb("custom_valuation"), // AI-generated custom valuation from selected comparables
  customValuatedAt: timestamp("custom_valuated_at"), // When custom valuation was generated

  // External valuation — fields extracted by AI from uploaded valuation documents
  // (informe de valoración / CMA). Kept separate from Residelia's valuationData.
  // Fields already stored on `properties` (surface, address, cadastralReference,
  // propertyType) are verified against the document via the UI but NOT duplicated here.
  externalValuation: jsonb("external_valuation")
    .$type<{
      estimatedValue?: number;
      valueMin?: number;
      valueMax?: number;
      pricePerSqm?: number;
      valuationDate?: string; // ISO date string
      method?: "comparativo" | "capitalizacion" | "coste" | "otro";
      author?: string;
      extractedAt?: string; // ISO timestamp
    }>()
    .default({}),

  // Private Information
  privateInfo: text("private_info"), // Internal notes/info visible only to agents, not published to portals

  // Urgency Note — prominent warning banner shown at top of property detail page
  urgencyNote: varchar("urgency_note", { length: 1000 }),

  // Promotion (New Development) — links listing as a "unit" within a promotion
  promotionId: bigint("promotion_id", { mode: "bigint" }), // nullable FK → promotions.promotion_id

  // Approval Workflow
  approvalSubmittedAt: timestamp("approval_submitted_at"), // When agent submitted for review
  approvalReviewedAt: timestamp("approval_reviewed_at"), // When admin approved/rejected
  approvalReviewedBy: varchar("approval_reviewed_by", { length: 36 }), // FK → users.id (who reviewed)
  approvalRejectionReason: varchar("approval_rejection_reason", {
    length: 1000,
  }), // Mandatory on reject, shown to agent

  // Custom Fields (per-listing values, keyed by custom_field_definitions.definition_id)
  customFieldValues: jsonb("custom_field_values")
    .$type<Record<string, boolean | string | string[]>>()
    .default({}),

  // Portal Contact Override
  useAgentPhone: boolean("use_agent_phone").notNull().default(false),

  // System Fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  captadorId: varchar("captador_id", { length: 36 }), // FK → users.id (agent who originally captured the listing; may differ from agentId after reassignment)
  labels: jsonb("labels").$type<string[]>().default([]), // User-added free-form custom labels (chips in the property labels panel)
  websiteUrl: text("website_url"), // Snapshot of the full public URL captured when publishToWebsite flips false→true; nulled on unpublish
  indomio: boolean("indomio").default(false), // Indomio publication status (piggybacks on pisoscom via Habitatsoft)
  luxuryestate: boolean("luxuryestate").default(false), // LuxuryEstate.com luxury portal (direct Kyero-compatible XML feed)
  vitrinemedia: boolean("vitrinemedia").default(false), // VitrineMedia portal (direct Kyero-compatible XML feed, parallel to kyero)
  // Original/public URL of the ad this listing was sourced from (e.g. a partner
  // CRM like Betterplace sending an opportunity). Traceability only.
  sourceUrl: varchar("source_url", { length: 1024 }),
  // Ingestion channel ('betterplace', …) for external-API records; NULL for
  // app-created listings. Mirrors contacts.source.
  source: varchar("source", { length: 100 }),
  indomioProps: jsonb("indomio_props").default({}), // Portal-specific settings for Indomio (sibling of Pisos.com)
  luxuryestateProps: jsonb("luxuryestate_props").default({}), // Portal-specific settings for LuxuryEstate (Kyero feed)
  vitrinemediaProps: jsonb("vitrinemedia_props").default({}), // Portal-specific settings for VitrineMedia (Kyero feed)
  // Lead-notification override for this listing (null = "Auto" → follow the
  // account-level leadNotificationRules). 'always' = force lead alerts even if
  // no rule matches; 'never' = mute. Wins over rules. See lead-notify-rules.
  leadNotifyOverride: varchar("lead_notify_override", { length: 10 }), // 'always' | 'never' | null
  // Co-broker for this listing. Identity (name, NIF, address, email, phone)
  // comes from the referenced account; sharePct is the per-listing setting.
  collaboratingAccountId: bigint("collaborating_account_id", {
    mode: "bigint",
  }),
  collaboratingSharePct: decimal("collaborating_share_pct", {
    precision: 5,
    scale: 2,
  }),
  // Editable AI-authored narrative for the cinematic public page (hero tagline
  // + when it was generated). Per-photo title/subtitle live on property_images.
  narrativeTagline: varchar("narrative_tagline", { length: 200 }),
  narrativeGeneratedAt: timestamp("narrative_generated_at", {
    withTimezone: true,
  }),
  closingAgentId: varchar("closing_agent_id", { length: 36 }), // FK → users.id — the agent who CLOSES the deal (may differ from capturer; nullable)
  enEscaparate: boolean("en_escaparate").default(false).notNull(), // Property poster/sign displayed in office shop window
  hasCartel: boolean("has_cartel").default(false).notNull(), // Whether a cartel (property poster/sign) has been designed
});

// Custom Field Definitions (per-account, shared across all listings)
export const customFieldDefinitions = pgTable("custom_field_definitions", {
  definitionId: bigserial("definition_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  name: varchar("name", { length: 100 }).notNull(),
  fieldType: varchar("field_type", { length: 20 }).notNull(), // "boolean" | "text" | "multi_select"
  options: jsonb("options").$type<string[]>(), // Only for multi_select
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Promotions (New Developments / Obra Nueva / Promociones)
// A promotion groups multiple listings as "units" (typologies) under a parent development.
// Maps to Idealista's customerNewDevelopments[] in the JSON feed.
export const promotions = pgTable("promotions", {
  // Primary Key
  promotionId: bigserial("promotion_id", { mode: "bigint" }).primaryKey(),

  // Account for multi-tenant security
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // Identification
  name: varchar("name", { length: 100 }).notNull(), // featuresNewDevelopmentName
  referenceCode: varchar("reference_code", { length: 50 }), // internal reference

  // Development Type
  // UI options: 'new_building' (Edificio nuevo) | 'restored_building' (Edificio restaurado) | 'house' (Casas) | 'mixed_promos' (Mixto)
  newDevelopmentType: varchar("new_development_type", { length: 20 }),

  // Operations (what the promotion offers)
  forSale: boolean("for_sale").default(true),
  forRent: boolean("for_rent").default(false),
  forRentToOwn: boolean("for_rent_to_own").default(false),

  // Location (same pattern as properties)
  street: varchar("street", { length: 255 }),
  addressDetails: varchar("address_details", { length: 255 }),
  postalCode: varchar("postal_code", { length: 20 }),
  neighborhoodId: bigint("neighborhood_id", { mode: "bigint" }), // FK → locations
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),

  // Construction Phase
  finished: boolean("finished").default(false), // featuresFinished
  startDate: varchar("start_date", { length: 10 }), // YYYY/MM/DD format
  keyDeliveryYear: smallint("key_delivery_year"), // featuresKeyDeliveryYear
  keyDeliveryMonth: smallint("key_delivery_month"), // featuresKeyDeliveryMonth (1-12)
  // UI options: 'land_move' | 'foundation' | 'carpentry' | 'pilot' | 'paving' | 'equipment' | 'keydelivery'
  builtPhase: varchar("built_phase", { length: 20 }),

  // Sales Booth / Availability
  // UI options: 'any_morning' | 'mornings' | 'at_noon' | 'afternoons' | 'nights' | 'weekends' | 'business_hour'
  availabilityHour: varchar("availability_hour", { length: 20 }),
  onSite: boolean("on_site"), // Sales booth on location
  accessComments: text("access_comments"), // Free text access instructions

  // Mortgage / Financing (all optional)
  mortgageStateSubsidized: boolean("mortgage_state_subsidized"),
  mortgageBankName: varchar("mortgage_bank_name", { length: 100 }),
  mortgagePercentage: decimal("mortgage_percentage", {
    precision: 5,
    scale: 2,
  }),
  mortgageEntryPercentage: decimal("mortgage_entry_percentage", {
    precision: 5,
    scale: 2,
  }),
  mortgageLettersPercentage: decimal("mortgage_letters_percentage", {
    precision: 5,
    scale: 2,
  }),
  mortgageInterestRate: decimal("mortgage_interest_rate", {
    precision: 5,
    scale: 3,
  }),
  mortgageYears: smallint("mortgage_years"),

  // Energy Certificate (promo-level)
  // UI options: 'project' (En proyecto) | 'completed' (Terminada)
  energyCertificateType: varchar("energy_certificate_type", { length: 20 }),
  // UI options: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  energyCertificateRating: varchar("energy_certificate_rating", { length: 2 }),
  energyCertificatePerformance: decimal("energy_certificate_performance", {
    precision: 8,
    scale: 2,
  }),
  energyCertificateEmissionsRating: varchar(
    "energy_certificate_emissions_rating",
    { length: 2 },
  ),
  energyCertificateEmissionsValue: decimal(
    "energy_certificate_emissions_value",
    { precision: 8, scale: 2 },
  ),

  // Common Amenities (promo-level)
  hasPool: boolean("has_pool"),
  hasGarden: boolean("has_garden"),
  hasLift: boolean("has_lift"),
  hasSecurityDoor: boolean("has_security_door"),
  hasSecurityAlarm: boolean("has_security_alarm"),
  hasDoorman: boolean("has_doorman"),

  // Description
  description: text("description"),

  // Idealista settings
  idealistaPropertyCode: varchar("idealista_property_code", { length: 50 }), // propertyCode for the feed
  idealistaEnabled: boolean("idealista_enabled").default(false), // Include in Idealista feed
  // UI options: 'full' (Ubicación completa) | 'street' (Calle) | 'hidden' (Oculta)
  idealistaAddressVisibility: varchar("idealista_address_visibility", {
    length: 10,
  }),
  // UI options: 'exact' (Exacta) | 'moved' (Desplazada)
  idealistaCoordinatesPrecision: varchar("idealista_coordinates_precision", {
    length: 10,
  }),

  // Documents (promotion-level PDFs: quality memoirs, dossiers)
  documents:
    jsonb("documents").$type<
      Array<{
        type: "quality" | "information_dossier";
        url: string;
        s3Key: string;
      }>
    >(),

  // System Fields
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Stable bridge ID from Fotocasa (set when a Fotocasa promotion lead
  // auto-creates a Vesta promotion). Match precedence in fotocasa-leads
  // importer: this UUID → name → auto-create. Partial unique index on
  // non-null values; see migration 0129.
  fotocasaPromotionId: varchar("fotocasa_promotion_id", { length: 36 }),
  // Pricing — "desde X €" anchor (lowest unit price). Optional override
  // surfaced on listings/portals so the promotion has a price even before any
  // unit is linked.
  priceFrom: decimal("price_from", { precision: 12, scale: 2 }),
});

// Promotion Images (separate from propertyImages — promotions are not properties)
export const promotionImages = pgTable("promotion_images", {
  promotionImageId: bigserial("promotion_image_id", {
    mode: "bigint",
  }).primaryKey(),
  promotionId: bigint("promotion_id", { mode: "bigint" }).notNull(), // FK → promotions.promotion_id
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  thumbUrl: varchar("thumb_url", { length: 500 }),
  medUrl: varchar("med_url", { length: 500 }),
  fullUrl: varchar("full_url", { length: 500 }),
  imageKey: varchar("image_key", { length: 2048 }).notNull(),
  s3key: varchar("s3key", { length: 2048 }).notNull(),
  imageTag: varchar("image_tag", { length: 255 }),
  imageOrder: integer("image_order").default(0).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Listing Activity (track important listing changes)
export const listingActivity = pgTable("listing_activity", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (WHO changed it)
  // Values: 'price_changed' | 'status_changed' | 'portal_published' | 'portal_unpublished'
  action: varchar("action", { length: 50 }).notNull(),
  details: jsonb("details").notNull(), // { field: 'price', oldValue: 150000, newValue: 145000, reason: 'Market adjustment' }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contacts (external people: buyers, sellers, etc.)
export const contacts = pgTable("contacts", {
  contactId: bigserial("contact_id", { mode: "bigint" }).primaryKey(),
  // Account for multi-tenant security
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  nif: varchar("nif", { length: 20 }), // Spanish NIF/DNI/NIE identification number
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  phoneNotes: text("phone_notes"), // Notes for primary phone number
  secondaryPhone: varchar("secondary_phone", { length: 20 }),
  secondaryPhoneNotes: text("secondary_phone_notes"), // Notes for secondary phone number
  phonePrefix: varchar("phone_prefix", { length: 10 }).default("+34"), // Phone country code prefix
  secondaryPhonePrefix: varchar("secondary_phone_prefix", {
    length: 10,
  }).default("+34"), // Secondary phone prefix
  address: varchar("address", { length: 500 }), // Contact's physical address
  rating: smallint("rating"), // Contact rating (e.g., 1-5 scale for quality/importance)
  additionalInfo: jsonb("additional_info").default({}),
  orgId: bigint("org_id", { mode: "bigint" }), // Nullable FK to organizations
  // UI options: 'Website' | 'Walk-In' | 'Referral' | 'Portal' | 'Llamada' | 'WhatsApp' | 'Otros'
  source: varchar("source", { length: 100 }),
  gdprConsent: boolean("gdpr_consent").default(false), // GDPR consent for commercial communications (legacy, used in hoja-encargo/contracts)
  // GDPR consent management (new system)
  gdprConsentStatus: varchar("gdpr_consent_status", { length: 20 }).default(
    "pending",
  ), // 'pending'|'accepted'|'rejected'|'withdrawn'
  gdprConsentDate: timestamp("gdpr_consent_date"), // when status last changed
  gdprConsentMethod: varchar("gdpr_consent_method", { length: 20 }), // 'email'|'whatsapp'|'manual'|'hoja_encargo'|'portal'
  gdprConsentIp: varchar("gdpr_consent_ip", { length: 45 }), // IP when accepted via web
  gdprConsentRequestedAt: timestamp("gdpr_consent_requested_at"), // when request was last sent
  // Granular consent categories — each can be independently accepted/rejected
  // Shape: { property_notifications: boolean, commercial_communications: boolean, appointment_reminders: boolean, document_notifications: boolean }
  gdprConsentCategories: jsonb("gdpr_consent_categories"),
  isActive: boolean("is_active").default(true),
  newLead: boolean("new_lead").default(false).notNull(), // If true, contact appears in borradores/drafts
  // UI options (kanban board): 'nuevo' (Pendiente Acción) | 'contactado' (Contactado) | 'gestionado' (Gestionado) | 'inactivo' (Inactivo)
  leadStatus: varchar("lead_status", { length: 30 }).default("nuevo"),
  // UI options (captacion kanban): 'pendiente' | 'contactado' | 'valoracion' | 'captado' | 'descartado'
  captacionStatus: varchar("captacion_status", { length: 30 }),
  assignedTo: varchar("assigned_to", { length: 36 }), // FK → users.id — agent who manages this contact
  profileRebuiltAt: timestamp("profile_rebuilt_at"), // Last time AI profile was rebuilt (NULL = never)
  lastContactedAt: timestamp("last_contacted_at"), // Last time agent contacted this person (email, WhatsApp, SMS, call). Used to decide intro vs no-intro templates.
  // Extended profile (used on the contact detail "Información" tab)
  profileImageUrl: varchar("profile_image_url", { length: 2048 }),
  entityType: varchar("entity_type", { length: 20 }), // 'individual' | 'company'
  dateOfBirth: date("date_of_birth"),
  civilStatus: varchar("civil_status", { length: 30 }), // 'single' | 'married' | 'divorced' | 'widowed' | 'partnership'
  occupation: varchar("occupation", { length: 255 }),
  gender: varchar("gender", { length: 20 }), // 'male' | 'female' | 'other' | 'prefer_not_to_say'
  nationality: varchar("nationality", { length: 100 }),
  idDocumentType: varchar("id_document_type", { length: 20 }), // 'nif' | 'cif' | 'nie' | 'passport'
  // Billing block
  billingName: varchar("billing_name", { length: 255 }),
  billingReference: varchar("billing_reference", { length: 100 }),
  billingEntityType: varchar("billing_entity_type", { length: 20 }),
  billingIdDocumentType: varchar("billing_id_document_type", { length: 20 }),
  billingNif: varchar("billing_nif", { length: 20 }),
  billingNationality: varchar("billing_nationality", { length: 100 }),
  billingAddress: varchar("billing_address", { length: 500 }),
  paymentMethod: varchar("payment_method", { length: 30 }), // 'transfer' | 'direct_debit' | 'cash' | 'card' | 'bizum' | 'check'
  iban: varchar("iban", { length: 34 }),
  bic: varchar("bic", { length: 11 }),
  bankAccountHolder: varchar("bank_account_holder", { length: 255 }),
  holdedContactId: varchar("holded_contact_id", { length: 64 }), // mirror id in Holded after first sync
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Free-form label for user-defined tagging (e.g. "VIP", "Inversor", "Reformar").
  // Surfaced on the contact detail page and used as a filter facet on /contactos.
  label: varchar("label", { length: 100 }),
  // When the contact entered its current lead_status. Distinct from
  // updated_at so generic contact edits don't reset the SLA clock — see
  // supabase/migrations/0044_contacts_lead_status_updated_at.sql.
  leadStatusUpdatedAt: timestamp("lead_status_updated_at"),
  // When the contact entered its current captacion_status. Distinct from
  // updated_at so generic contact edits don't reset the SLA clock — see
  // supabase/migrations/0043_contacts_captacion_status_updated_at.sql.
  captacionStatusUpdatedAt: timestamp("captacion_status_updated_at"),
  captadorId: varchar("captador_id", { length: 36 }), // FK → users.id — agent who originally captured this contact (may differ from assignedTo)
});

// Listing Contact junction table (Many-to-Many relationship between listings and contacts)
// Enhanced to replace leads table functionality
export const listingContacts = pgTable("listing_contacts", {
  listingContactId: bigserial("listing_contact_id", {
    mode: "bigint",
  }).primaryKey(),
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  // UI options: 'buyer' (Comprador) | 'owner' (Propietario) | 'viewer' (Visitante)
  contactType: varchar("contact_type", { length: 20 }).notNull(),

  agentId: varchar("agent_id", { length: 36 }), // FK → users.id — nullable override for deal attribution

  // NEW COLUMNS (from leads table):
  prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.id (nullable)
  // Values: 'Website' | 'Walk-In' | 'Appointment' | 'Portal' | 'Llamada' | 'WhatsApp'
  source: varchar("source", { length: 50 }),
  status: varchar("status", { length: 50 }), // Lead status workflow

  // Offer tracking:
  offer: integer("offer"), // Offer amount
  offerAccepted: boolean("offer_accepted"), // Whether the offer was accepted

  // Original inbound message from the lead (portal email/chat body as received)
  inboundMessage: text("inbound_message"),

  // Inbox draft message (pre-composed at portal import time)
  draftMessage: text("draft_message"), // Pre-composed message body for inbox Leads tab
  draftChannel: varchar("draft_channel", { length: 10 }), // "whatsapp" | "email"
  draftMessageType: varchar("draft_message_type", { length: 30 }), // Classifier result (e.g. "price_inquiry")
  // Stamped when the agent sends the draft reply via Vesta WhatsApp (Evolution).
  // NULL = still editable; NOT NULL = sent, bubbles render read-only with ✓✓.
  // Writers that overwrite draft_message MUST reset this to NULL.
  draftSentAt: timestamp("draft_sent_at"),
  draftQuestionAnswer: text("draft_question_answer"), // AI-generated answer for general_question leads
  bookingUrl: text("booking_url"), // Pre-generated short booking URL (kept for display/send)
  bookingToken: varchar("booking_token", { length: 12 }).unique(), // Short token for /reservar-visita/[token]
  bookingPayload: jsonb("booking_payload"), // Slots + expiry stored server-side

  // Auto-send tracking (when lead automation auto-send is enabled)
  autoSendStatus: varchar("auto_send_status", { length: 20 }), // 'pending' | 'sent' | 'failed' | 'cancelled'
  autoSendScheduledAt: timestamp("auto_send_scheduled_at"), // When the auto-send should fire
  autoSentAt: timestamp("auto_sent_at"), // When it was actually sent

  // Existing columns:
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),

  // Conversational lead agent — see specs/2026-04-20-conversational-lead-agent-design.md
  agentMode: text("agent_mode").default("off").notNull(),
  agentProcessingSince: timestamp("agent_processing_since"),
  agentHasPendingWork: boolean("agent_has_pending_work")
    .default(false)
    .notNull(),
  agentEscalationReason: text("agent_escalation_reason"),
  agentStartedAt: timestamp("agent_started_at"),

  // Rental reservation state — denormalized mirror of rental_reservations.status
  // for cheap UI filtering. NULL = no active reserva for this listing_contact.
  // Values: 'sent' | 'viewed' | 'paid' | 'expired' | 'cancelled' | 'cancelled_listing_assigned'
  reservationStatus: varchar("reservation_status", { length: 30 }),
  reservationId: bigint("reservation_id", { mode: "bigint" }),
  // Per-listing captación pipeline stage (B1). Authoritative for owner links of
  // internal listings — each property pursuit advances independently. Mirrors
  // contacts.captacion_status, which is retained as the home for listing-less
  // captación leads (portal/potencial). See docs / plan glowing-sparking-willow.
  captacionStatus: varchar("captacion_status", { length: 30 }),
  captacionStatusUpdatedAt: timestamp("captacion_status_updated_at"),
  // Ownership share (%) of this owner over the property — attribute of the
  // owner↔property link. Set for `contact_type='owner'` rows (from the hoja de
  // encargo, with equal-split of the remainder when the doc doesn't state it).
  // NULL = unknown. decimal(5,2) so 33.33 + 33.33 + 33.34 = 100 is exact.
  ownershipShare: decimal("ownership_share", { precision: 5, scale: 2 }),
  // Which agent owns the agent_mode slot: 'lead' | 'post_visit'. Stamped at
  // every activation site; routing and the turn executor dispatch on it.
  agentKind: text("agent_kind").default("lead").notNull(),
});

// Listing Contact Activity (track lead/contact changes)
export const listingContactActivity = pgTable("listing_contact_activity", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }).notNull(), // FK → listing_contacts.listing_contact_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (WHO changed it)
  // Values: 'status_changed' | 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'appointment_scheduled' |
  //         'reserva_sent' | 'reserva_viewed' | 'reserva_paid' | 'reserva_expired' | 'reserva_cancelled'
  action: varchar("action", { length: 50 }).notNull(),
  details: jsonb("details").notNull(), // Flexible for different action types: { oldStatus, newStatus, reason } or { amount, notes }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Rental reservations — lifecycle of a reserva sent to a selected potencial.
// One row per (listing, contact) selection; re-sending creates a new row and
// cancels the previous one. See supabase/migrations/0015_rental_reservations.sql.
export const rentalReservations = pgTable("rental_reservations", {
  reservationId: bigserial("reservation_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(),
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }).notNull(),

  // 'sent' | 'viewed' | 'paid' | 'expired' | 'cancelled'
  status: varchar("status", { length: 30 }).notNull().default("sent"),

  amountExpected: decimal("amount_expected", {
    precision: 12,
    scale: 2,
  }).notNull(),
  paymentDeadlineAt: timestamp("payment_deadline_at", {
    withTimezone: true,
  }).notNull(),
  proposedStartDate: date("proposed_start_date").notNull(),

  sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  sentChannel: varchar("sent_channel", { length: 20 }).notNull(), // 'email' | 'whatsapp'
  sentByUserId: varchar("sent_by_user_id", { length: 36 }).notNull(),

  firstViewedAt: timestamp("first_viewed_at", { withTimezone: true }),
  lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
  viewCount: integer("view_count").notNull().default(0),

  paidAt: timestamp("paid_at", { withTimezone: true }),
  paidMarkedByUserId: varchar("paid_marked_by_user_id", { length: 36 }),
  paymentProofS3Key: varchar("payment_proof_s3_key", { length: 500 }),
  paymentNotes: text("payment_notes"),

  expiredAt: timestamp("expired_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  cancelledReason: varchar("cancelled_reason", { length: 100 }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Conversational lead agent — append-only log of agent turns (one row per inbound→reply cycle)
// See specs/2026-04-20-conversational-lead-agent-design.md
export const leadAgentTurns = pgTable("lead_agent_turns", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }).notNull(),
  turnIndex: integer("turn_index").notNull(),
  inboundMessages: jsonb("inbound_messages").notNull(),
  draftReply: text("draft_reply"),
  toolCalls: jsonb("tool_calls").default([]).notNull(),
  action: text("action").notNull(), // 'sent' | 'escalated' | 'appointment_created'
  escalationReason: text("escalation_reason"),
  durationMs: integer("duration_ms").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Per-thread AI draft replies in the inbox. One row per (account_id, thread_key).
// thread_key holds the Gmail threadId (string) or WhatsApp conversationId (bigint stringified).
export const inboxDrafts = pgTable("inbox_drafts", {
  draftId: bigserial("draft_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(),
  threadKey: varchar("thread_key", { length: 255 }).notNull(),
  channel: varchar("channel", { length: 10 }).notNull(), // 'email' | 'whatsapp'
  generatedFromMessageId: varchar("generated_from_message_id", { length: 64 }),
  payload: jsonb("payload").notNull(), // {bubbles: string[]} or {subject, body}
  status: varchar("status", { length: 20 }).default("fresh").notNull(), // 'fresh' | 'stale' | 'dismissed'
  reasonSources: jsonb("reason_sources").default({}).notNull(),
  errorReason: text("error_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // How this draft was born: 'reply' (auto-reply to an inbound), 'suggested'
  // (draft_email suggested-action), or 'proactive' (CRM-event outreach, Tier 2).
  origin: varchar("origin", { length: 20 }).default("reply").notNull(),
});

// Organizations (companies, law firms, banks)
export const organizations = pgTable("organizations", {
  orgId: bigserial("org_id", { mode: "bigint" }).primaryKey(),
  orgName: varchar("org_name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),
});

// Deals (potential or closed transaction)
export const deals = pgTable("deals", {
  // Primary Key
  dealId: bigserial("deal_id", { mode: "bigint" }).primaryKey(),

  // Entity Relationships
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }), // FK → listing_contacts.listing_contact_id (nullable)

  // Deal Status & Timeline
  // UI options (DB values): 'Arras Pending' | 'UnderContract' | 'Closed' | 'Lost'
  // UI display: 'arras' (Arras Pendientes) | 'compraventa' (Pendiente de Escritura) | 'signed' (Escritura Firmada) | 'closed' (Cerrado) | 'lost' (Perdido)
  status: varchar("stage", { length: 50 }).notNull(),
  closeDate: timestamp("close_date"),

  // Financial Fields - Pricing
  finalPrice: decimal("final_price", { precision: 12, scale: 2 }), // Final agreed sale/rental price (may differ from listing price)

  // Financial Fields - Commission
  commissionPercentage: decimal("commission_percentage", {
    precision: 5,
    scale: 2,
  }), // Agency commission percentage (e.g., 3.00, 5.00)
  commissionAmount: decimal("commission_amount", { precision: 12, scale: 2 }), // Calculated commission in euros
  commissionPaidDate: timestamp("commission_paid_date"), // When commission was received

  // Commission Payment Status Tracking
  // UI options: 'pendiente' (Pendiente) | 'facturado' (Facturado) | 'cobrado' (Cobrado)
  ownerCommissionStatus: varchar("owner_commission_status", { length: 20 }),
  ownerCommissionInvoiceDate: timestamp("owner_commission_invoice_date"), // When invoice was issued
  ownerCommissionPaidDate: timestamp("owner_commission_paid_date"), // When payment was received
  // UI options: 'pendiente' (Pendiente) | 'facturado' (Facturado) | 'cobrado' (Cobrado)
  clientCommissionStatus: varchar("client_commission_status", { length: 20 }),
  clientCommissionInvoiceDate: timestamp("client_commission_invoice_date"), // When invoice was issued
  clientCommissionPaidDate: timestamp("client_commission_paid_date"), // When payment was received

  // Financial Fields - Arras (Deposit)
  arrasAmount: decimal("arras_amount", { precision: 12, scale: 2 }), // Deposit amount (contrato de arras)
  // UI options: 'confirmatorias' (Confirmatorias) | 'penitenciales' (Penitenciales)
  arrasType: varchar("arras_type", { length: 20 }),
  arrasDate: timestamp("arras_date"), // When arras were paid

  // Financial Fields - Transaction Costs
  notaryFees: decimal("notary_fees", { precision: 10, scale: 2 }), // Estimated/actual notary costs
  registryFees: decimal("registry_fees", { precision: 10, scale: 2 }), // Property registry fees
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }), // IVA or ITP (Impuesto de Transmisiones Patrimoniales)
  mortgageAmount: decimal("mortgage_amount", { precision: 12, scale: 2 }), // Loan amount if buyer is financing

  // Timeline & Milestones
  arrasSigningDate: timestamp("arras_signing_date"), // When deposit contract was signed
  expectedDeedDate: timestamp("expected_deed_date"), // Scheduled escritura pública date
  actualDeedDate: timestamp("actual_deed_date"), // Actual deed signing date
  keyHandoverDate: timestamp("key_handover_date"), // When keys were transferred
  financingDeadline: timestamp("financing_deadline"), // Deadline for mortgage approval
  contingencyExpirationDate: timestamp("contingency_expiration_date"), // Last date for contingencies

  // Parties & Professionals - Legal
  buyerLawyerId: bigint("buyer_lawyer_id", { mode: "bigint" }), // FK → contacts (buyer's abogado)
  sellerLawyerId: bigint("seller_lawyer_id", { mode: "bigint" }), // FK → contacts (seller's abogado)
  notaryId: bigint("notary_id", { mode: "bigint" }), // FK → contacts or organizations
  notaryName: varchar("notary_name", { length: 255 }), // Notary name if not tracked as contact

  // Parties & Professionals - Financing
  bankId: bigint("bank_id", { mode: "bigint" }), // FK → organizations (mortgage bank)
  bankName: varchar("bank_name", { length: 255 }), // Bank name

  // Parties & Professionals - Agents
  listingAgentId: varchar("listing_agent_id", { length: 36 }), // FK → users (captador)
  sellingAgentId: varchar("selling_agent_id", { length: 36 }), // FK → users (vendedor/closer)
  commissionSplitListingAgent: decimal("commission_split_listing_agent", {
    precision: 5,
    scale: 2,
  }), // % for listing agent
  commissionSplitSellingAgent: decimal("commission_split_selling_agent", {
    precision: 5,
    scale: 2,
  }), // % for selling agent

  // Status & Workflow
  // UI options: 'not_needed' (No necesario) | 'pending' (Pendiente) | 'pre_approved' (Pre-aprobado) | 'approved' (Aprobado) | 'denied' (Denegado)
  financingStatus: varchar("financing_status", { length: 20 }),
  // UI options: 'pending' (Pendiente) | 'scheduled' (Programada) | 'completed' (Completada) | 'issues_found' (Incidencias)
  inspectionStatus: varchar("inspection_status", { length: 20 }),
  // UI options: 'pending_review' (Pendiente revisión) | 'clear' (Limpio) | 'issues_found' (Incidencias)
  titleStatus: varchar("title_status", { length: 20 }),
  contingenciesCleared: boolean("contingencies_cleared"), // All contingencies satisfied?
  documentsComplete: boolean("documents_complete"), // All required documents received?
  // UI options: 'low' (Bajo) | 'medium' (Medio) | 'high' (Alto) - risk of deal falling through
  riskLevel: varchar("risk_level", { length: 20 }),

  // Required Documents Checklist (JSON)
  requiredDocuments: jsonb("required_documents").default({}), // Checklist of required documents with completion status

  // Cancellation Tracking
  cancellationReason: text("cancellation_reason"), // Why deal fell through
  // UI options: 'buyer' (Comprador) | 'seller' (Vendedor) | 'both' (Ambos) | 'external' (Externo) | 'none' (Ninguno)
  faultParty: varchar("fault_party", { length: 20 }),
  // UI options: 'returned_to_buyer' (Devuelto al comprador) | 'kept_by_seller' (Retenido por vendedor) | 'split' (Dividido)
  arrasDisposition: varchar("arras_disposition", { length: 30 }),
  cancelledBy: varchar("cancelled_by", { length: 36 }), // FK → users (who marked it as lost/cancelled)
  cancellationDate: timestamp("cancellation_date"), // When deal was cancelled

  // Notes & Observations
  internalNotes: text("internal_notes"), // Private notes for agency use
  contingencyNotes: text("contingency_notes"), // Details about pending contingencies
  specialConditions: text("special_conditions"), // Any special terms or conditions

  // Referrals
  referralSource: varchar("referral_source", { length: 100 }), // Where deal came from
  referralPartnerId: bigint("referral_partner_id", { mode: "bigint" }), // FK → contacts/organizations
  referralFeePercentage: decimal("referral_fee_percentage", {
    precision: 5,
    scale: 2,
  }), // Fee owed to referral partner
  referralFeePaid: boolean("referral_fee_paid"), // Whether referral fee was paid

  // System Fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Signature status (mirrors listings.encargoFields.signed). null = unknown,
  // true = confirmed signed, false = confirmed unsigned. Drives the
  // doc/signed warning axis on the Arras & Escritura progress milestones.
  arrasSigned: boolean("arras_signed"),
  arrasSignedAt: timestamp("arras_signed_at"),
  escrituraSigned: boolean("escritura_signed"),
  escrituraSignedAt: timestamp("escritura_signed_at"),
});

// Deal Participants (people involved in a deal)
export const dealParticipants = pgTable("deal_participants", {
  dealId: bigint("deal_id", { mode: "bigint" }).notNull(), // FK → deals.deal_id
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  // UI options: 'Buyer' (Comprador) | 'Seller' (Vendedor) | 'Lawyer' (Abogado)
  role: varchar("role", { length: 50 }).notNull(),
});

// Appointments table
export const appointments = pgTable(
  "appointments",
  {
    appointmentId: bigserial("appointment_id", { mode: "bigint" }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (BetterAuth compatible)
    contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (nullable - for internal appointments)
    listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
    listingContactId: bigint("listing_contact_id", { mode: "bigint" }), // FK → listing_contacts.listing_contact_id (nullable)
    dealId: bigint("deal_id", { mode: "bigint" }), // FK → deals.deal_id (nullable)
    prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.prospect_id (nullable)
    taskId: bigint("task_id", { mode: "bigint" }), // FK → tasks.task_id (nullable)
    datetimeStart: timestamp("datetime_start").notNull(),
    datetimeEnd: timestamp("datetime_end").notNull(),
    tripTimeMinutes: smallint("trip_time_minutes"), // Travel time in minutes
    // UI options: 'Scheduled' (Programada) | 'Completed' (Completada) | 'Cancelled' (Cancelada) | 'No Show' (No asistió)
    status: varchar("status", { length: 20 }).notNull().default("Scheduled"),
    title: varchar("title", { length: 255 }).notNull(), // Appointment title
    notes: text("notes"),
    // UI options: 'visita' (Visita) | 'reunion' (Reunión) | 'llamada' (Llamada) | 'firma' (Firma) | 'otro' (Otro)
    type: varchar("type", { length: 50 }),
    assignedTo: varchar("assigned_to", { length: 36 }), // FK → users.id (who is assigned to the appointment)
    editedBy: varchar("edited_by", { length: 36 }), // FK → users.id (who last edited the appointment)
    // Google Calendar integration fields
    googleEventId: varchar("google_event_id", { length: 255 }), // Google Calendar event ID
    googleEtag: varchar("google_etag", { length: 255 }), // For conflict resolution
    lastSyncedAt: timestamp("last_synced_at"), // Track sync status
    googleEventLink: varchar("google_event_link", { length: 500 }), // Google Calendar event deep link (htmlLink)
    documentOverrides: jsonb("document_overrides"), // Optional text overrides for visit document: { visitDescription, signatureIntro, disclaimer, gdprText, gdprConsent }
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    // Post-visit agent dedup: stamped when the feedback opener is sent for this
    // appointment (claim-before-send crash guard). NULL = not yet asked.
    feedbackRequestedAt: timestamp("feedback_requested_at"),
  },
  (table) => ({
    // Partial composite indexes already exist in the DB (created manually):
    //   appointments_assigned_dates_idx (assigned_to, datetime_start, datetime_end) WHERE is_active = true
    //   appointments_user_dates_idx     (user_id, datetime_start, datetime_end) WHERE is_active = true
    //   idx_appointments_user           (user_id)
    // The indexes below are kept in sync with those via db:push.
    datetimeStartIdx: index("appointments_datetime_start_idx").on(
      table.datetimeStart,
    ),
    datetimeEndIdx: index("appointments_datetime_end_idx").on(
      table.datetimeEnd,
    ),
    assignedToIdx: index("appointments_assigned_to_idx").on(table.assignedTo),
    assignedToStartIdx: index("appointments_assigned_to_start_idx").on(
      table.assignedTo,
      table.datetimeStart,
    ),
    isActiveIdx: index("appointments_is_active_idx").on(table.isActive),
    userIdIdx: index("appointments_user_id_idx").on(table.userId),
  }),
);

// User Integrations table (for OAuth tokens and sync metadata)
export const userIntegrations = pgTable("user_integrations", {
  integrationId: bigserial("integration_id", { mode: "bigint" }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  // Values: 'google_calendar' | 'gmail'
  provider: varchar("provider", { length: 50 }).notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiryDate: timestamp("expiry_date"),
  calendarId: varchar("calendar_id", { length: 255 }).default("primary"),
  syncToken: text("sync_token"), // For incremental sync
  channelId: varchar("channel_id", { length: 64 }), // Webhook channel ID
  resourceId: varchar("resource_id", { length: 255 }), // Webhook resource ID
  channelExpiration: timestamp("channel_expiration"),
  // UI options: 'bidirectional' | 'vesta_to_google' (Recommended) | 'google_to_vesta' | 'none'
  syncDirection: varchar("sync_direction", { length: 20 }).default(
    "vesta_to_google",
  ),
  // Gmail-specific fields
  gmailEmail: varchar("gmail_email", { length: 255 }), // Cached email for webhook lookup
  gmailHistoryId: varchar("gmail_history_id", { length: 50 }), // For incremental history sync
  // Shared (account-level) integration fields
  accountId: bigint("account_id", { mode: "bigint" }), // When set → shared integration visible to all admins
  label: varchar("label", { length: 100 }), // Display name e.g. "Info general"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Outlook-specific fields (provider = 'outlook'). See migration 0096.
  outlookEmail: varchar("outlook_email", { length: 255 }), // Cached UPN for webhook routing
  outlookDeltaLink: text("outlook_delta_link"), // Graph @odata.deltaLink for incremental sync
  outlookSubscriptionId: varchar("outlook_subscription_id", { length: 64 }), // /subscriptions id
  outlookSubscriptionExpiration: timestamp("outlook_subscription_expiration"), // Watch expiry (≤ ~70h)
  outlookTenantId: varchar("outlook_tenant_id", { length: 64 }), // Tenant id from id_token
  // IMAP/SMTP fields (provider = 'imap'). All nullable; existing Gmail/Calendar
  // rows leave these empty. encryptedPassword is AES-256-GCM ciphertext keyed
  // by env MAIL_CREDENTIAL_KEY — never read raw, decrypt only via the helper.
  imapHost: varchar("imap_host", { length: 255 }),
  imapPort: integer("imap_port"),
  smtpHost: varchar("smtp_host", { length: 255 }),
  smtpPort: integer("smtp_port"),
  // When true, accept self-signed / untrusted TLS certs for this mailbox's
  // IMAP + SMTP connections. Opt-in per integration (some small hosts serve a
  // self-signed cert). Never relax validation globally. See imap-tls.ts.
  imapAllowInvalidCert: boolean("imap_allow_invalid_cert")
    .default(false)
    .notNull(),
  emailAddress: varchar("email_address", { length: 255 }),
  encryptedPassword: text("encrypted_password"),
  uidValidity: bigint("uid_validity", { mode: "bigint" }), // IMAP folder UIDVALIDITY at last sync
  lastUid: bigint("last_uid", { mode: "bigint" }), // Highest INBOX UID seen
  // IMAP sync state (M1 mail cache). All nullable / defaulted — additive.
  highestModseq: bigint("highest_modseq", { mode: "bigint" }), // CONDSTORE high-water mark for flag deltas
  lastSyncAt: timestamp("last_sync_at"), // Last successful IMAP sync tick
  lastSyncError: text("last_sync_error"), // Last error message (null when healthy)
  backfillCursor: bigint("backfill_cursor", { mode: "bigint" }), // Oldest UID walked during background backfill
  backfillCompletedAt: timestamp("backfill_completed_at"), // Set when backfill cap / mailbox start reached
  imapSyncEnabled: boolean("imap_sync_enabled").default(false).notNull(), // Per-integration opt-in for cron sync
  imapReadFromCache: boolean("imap_read_from_cache").default(false).notNull(), // Per-integration opt-in for DB-backed reads
  // Per-folder sync state for the cache syncer (INBOX + Sent track UID/MODSEQ
  // independently). BIGINTs stored as strings inside JSON. See migration 0095.
  folderSyncState: jsonb("folder_sync_state").default({}).notNull(),
});

// Tasks
export const tasks = pgTable("tasks", {
  taskId: bigserial("task_id", { mode: "bigint" }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (BetterAuth compatible)
  title: varchar("title", { length: 255 }).notNull(), // Task title
  description: text("description").notNull(),
  dueDate: timestamp("due_date"),
  dueTime: time("due_time"),
  completed: boolean("completed").default(false),
  createdBy: varchar("created_by", { length: 36 }), // FK → users.id (who created the task)
  completedBy: varchar("completed_by", { length: 36 }), // FK → users.id (who completed the task)
  editedBy: varchar("edited_by", { length: 36 }), // FK → users.id (who last edited the task)
  category: varchar("category", { length: 100 }), // Task category/type
  // UI options: 1=Baja | 2=Media | 3=Alta | 4=Urgente | 5=Crítica
  urgency: smallint("urgency"),
  // UI options: 'backlog' (Backlog) | 'blocked' (Bloqueada) | 'ready' (Lista) | 'in_progress' (En progreso) | 'validation' (Validación) | 'finished' (Finalizada)
  status: varchar("status", { length: 20 }).default("backlog"),
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }), // FK → listing_contacts.listing_contact_id (nullable)
  dealId: bigint("deal_id", { mode: "bigint" }), // FK → deals.deal_id (nullable)
  appointmentId: bigint("appointment_id", { mode: "bigint" }), // FK → appointments.appointment_id (nullable)
  prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.prospect_id (nullable)
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (nullable)
  activityId: bigint("activity_id", { mode: "bigint" }), // FK → activity log/table (nullable)
  activityType: varchar("activity_type", { length: 50 }), // Type of activity this task is related to (e.g., 'contact_activity', 'listing_contact_activity')
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  activationStepId: varchar("activation_step_id", { length: 64 }), // FK-less link → activation-guide step id (see ~/lib/activation-guide)
  activationAccountId: bigint("activation_account_id", { mode: "bigint" }), // FK-less → the incorporated account this activation task refers to (tasks live in the admin account)
});

// Documents table
export const documents = pgTable("documents", {
  docId: bigserial("doc_id", { mode: "bigint" }).primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  // Values: 'PDF' | 'DOC' | 'Image' | etc.
  fileType: varchar("file_type", { length: 255 }).notNull(),
  fileUrl: varchar("file_url", { length: 2048 }).notNull(), // Public S3 URL
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (who uploaded, BetterAuth compatible)

  // Entity relationships (only one should be set per document)
  propertyId: bigint("property_id", { mode: "bigint" }), // FK → properties.property_id (nullable)
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (nullable)
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable)
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }), // FK → listing_contacts.listing_contact_id (nullable)
  dealId: bigint("deal_id", { mode: "bigint" }), // FK → deals.deal_id (nullable)
  appointmentId: bigint("appointment_id", { mode: "bigint" }), // FK → appointments.appointment_id (nullable)
  prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.prospect_id (nullable)
  leaseId: bigint("lease_id", { mode: "bigint" }), // FK → leases.lease_id (nullable)
  // La promoción de obra nueva de la que cuelga el PDF (0340).
  promotionId: bigint("promotion_id", { mode: "bigint" }), // FK → promotions.promotion_id (nullable)

  // AWS S3 fields (similar to property_images)
  documentKey: varchar("document_key", { length: 2048 }).notNull(), // S3 object key for operations
  s3key: varchar("s3key", { length: 2048 }).notNull(), // S3 storage key
  // Values: 'contract' | 'ID' | 'deed' | 'invoice' | 'certificate' | etc.
  documentTag: varchar("document_tag", { length: 255 }),
  documentOrder: integer("document_order").default(0).notNull(), // Display order within entity

  // Document integrity fields
  documentHash: varchar("document_hash", { length: 64 }), // SHA-256 hash (64 hex characters)
  documentTimestamp: timestamp("document_timestamp"), // ISO timestamp when document was created/signed

  // AI-extracted contract data, populated by processContractUpload after the
  // contract parser succeeds. Saved before the user finishes the review form
  // so the parse work survives modal abandonment. Shape matches
  // ExtractedContractData (~/types/contract-parser).
  parsedData: jsonb("parsed_data"),

  // System fields
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Flat { dbColumn: value } snapshot of the AI-extracted fields, captured at
  // extraction time. A faithful record of what this document yielded —
  // independent of where the values were applied or later edited. Read by the
  // document detail sheet ("Datos extraídos"). Populated by the ficha-encargo
  // flow; generic so other extraction flows can adopt it.
  extractedFields: jsonb("extracted_fields"),
  // Account-wide favorite — powers the "Referencias" tab in /documentos.
  isFavorite: boolean("is_favorite").default(false).notNull(),
});

// Prospects table (Enhanced for dual-type prospect system)
export const prospects = pgTable("prospects", {
  id: bigserial("prospect_id", { mode: "bigint" }).primaryKey(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.id
  // UI options: 'En búsqueda' | 'En preparación' | 'Finalizado' | 'Archivado'
  status: varchar("status", { length: 50 }).notNull(),
  // UI options: 'Sale' (Venta) | 'Rent' (Alquiler)
  listingType: varchar("listing_type", { length: 20 }),

  // Dual-type discriminator field
  // UI options: 'search' (Buscando propiedad) | 'listing' (Quiere vender/alquilar)
  prospectType: varchar("prospect_type", { length: 20 })
    .notNull()
    .default("search"),

  // Search prospect fields (existing - for people looking FOR properties)
  // UI options: 'piso' | 'casa' | 'garaje' | 'local' | 'terreno'
  propertyType: varchar("property_type", { length: 20 }),
  excludedSubtypes: jsonb("excluded_subtypes"), // ["Ático", "Bajo"] — null = no exclusions
  minPrice: decimal("min_price", { precision: 12, scale: 2 }),
  maxPrice: decimal("max_price", { precision: 12, scale: 2 }),
  preferredCities: jsonb("preferred_cities"), // Array of city names: ["Madrid", "Barcelona"]
  preferredAreas: jsonb("preferred_areas"), // Array of neighborhood objects: [{"neighborhoodId": 1, "name": "Salamanca"}, {"neighborhoodId": 2, "name": "Retiro"}]
  preferredPolygon: jsonb("preferred_polygon"), // Single polygon: [{lat, lng}, ...] — null when not set
  locationMode: varchar("location_mode", { length: 20 }), // 'text' | 'polygon' | null (null = legacy text)
  minBedrooms: smallint("min_bedrooms"), // 0-10 is enough
  minBathrooms: smallint("min_bathrooms"), // Same
  minSquareMeters: integer("min_square_meters"),
  maxSquareMeters: integer("max_square_meters"),
  moveInBy: timestamp("move_in_by"), // Desired move-in date; leave NULL if "when something comes up"
  extras: jsonb("extras"), // { "ascensor": true, "terraza": true, "garaje": false }
  fieldPriorities: jsonb("field_priorities"), // { "elevator": "must", "garage": "nth", ... } — null = all must
  criteria: jsonb("criteria"), // Multi-select criteria: { "orientation": ["S","SE"], "ubication": ["ático"] }
  urgencyLevel: smallint("urgency_level"), // 1-5 - homemade lead-scoring
  fundingReady: boolean("funding_ready"), // Has mortgage/pre-approval?

  // Listing prospect fields (new - for people wanting to LIST properties)
  // NOTE: These fields are commented out because they don't exist in the database yet
  // propertyToList: jsonb("property_to_list"), // { address, propertyType, estimatedValue, condition, readyToList }
  // valuationStatus: varchar("valuation_status", { length: 50 }), // 'pending' | 'scheduled' | 'completed'
  // listingAgreementStatus: varchar("listing_agreement_status", { length: 50 }), // 'not_started' | 'in_progress' | 'signed'

  // Portal sourcing fields
  // Array of {portal, searchUrl, location, status, activatedAt}
  portalAlerts: jsonb("portal_alerts"),
  lastPortalEmailParsedAt: timestamp("last_portal_email_parsed_at"),

  // Common fields
  notesInternal: text("notes_internal"), // Everything the client shouldn't see
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Always-populated search area used for matching: a list of polygon rings.
  // Derived at creation from drawn polygon / neighborhood polygons / city boundary.
  // null = location pending (status "Información básica") or legacy row.
  searchPolygons:
    jsonb("search_polygons").$type<
      Array<Array<{ lat: number; lng: number }>>
    >(),
  // 2026-05-16 (round 2) — low-value inmovilla columns recovered from Section 4.
  // titleHolderName: name of the buyer/title-holder if different from the contact
  //   (inmovilla `demandas_titularnoms` + `_titular`).
  // consultedListings: jsonb array of listing references the buyer has already
  //   inquired about (inmovilla `demandas_refconsultadas`, semicolon-delimited).
  titleHolderName: varchar("title_holder_name", { length: 255 }),
  consultedListings: jsonb("consulted_listings"),
});

// Prospect History table to track status changes
export const prospectHistory = pgTable("prospect_history", {
  historyId: bigserial("history_id", { mode: "bigint" }).primaryKey(),
  prospectId: bigint("prospect_id", { mode: "bigint" }).notNull(),
  previousStatus: varchar("previous_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }).notNull(),
  changedBy: varchar("changed_by", { length: 36 }).notNull(), // FK → users.id (BetterAuth compatible)
  changeReason: text("change_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Prospect-Listing Matches table (pre-calculated matches for performance)
// Indexes will be created in migration file for better control
export const prospectListingMatches = pgTable(
  "prospect_listing_matches",
  {
    // Primary Key
    id: bigserial("id", { mode: "bigint" }).primaryKey(),

    // Foreign Keys
    prospectId: bigint("prospect_id", { mode: "bigint" }).notNull(), // FK → prospects.prospect_id
    listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
    accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id (for multi-tenant queries)

    // Match Quality Score (0-100)
    matchQualityScore: smallint("match_quality_score"), // Overall quality score: considers all factors weighted
    // Values: 'high' | 'medium' | 'low'
    confidenceLevel: varchar("confidence_level", { length: 20 }),

    // Match Metadata
    // Values: 'strict' | 'near-strict'
    matchType: varchar("match_type", { length: 20 }).notNull(),
    toleranceReasons: jsonb("tolerance_reasons"), // Array of strings: ["Price +3.2%", "Area -4.1%"]
    // Values: 'exact' | 'tolerance' | 'out-of-range'
    priceMatch: varchar("price_match", { length: 20 }).notNull(),

    // Cross-Account Flag
    isCrossAccount: boolean("is_cross_account").notNull().default(false),
    crossAccountId: bigint("cross_account_id", { mode: "bigint" }), // Account ID of the listing if cross-account

    // Detailed Match Scores (for sorting and filtering)
    priceMatchScore: smallint("price_match_score"), // 0-100: How well price matches (100 = exact, lower = more deviation)
    locationMatchScore: smallint("location_match_score"), // 0-100: How well location matches
    featureMatchScore: smallint("feature_match_score"), // 0-100: How many required features are met
    sizeMatchScore: smallint("size_match_score"), // 0-100: How well bedrooms/bathrooms/area match
    urgencyScore: smallint("urgency_score"), // 0-100: Based on prospect's urgency level and moveInBy date

    // Tolerance Details (for debugging/filtering)
    priceDeviation: decimal("price_deviation", { precision: 5, scale: 2 }), // Percentage deviation from prospect's range
    areaDeviation: decimal("area_deviation", { precision: 5, scale: 2 }), // Percentage deviation from prospect's range
    bedroomDifference: smallint("bedroom_difference"), // Difference: listing.bedrooms - prospect.minBedrooms (positive = extra bedrooms)
    bathroomDifference: smallint("bathroom_difference"), // Difference: listing.bathrooms - prospect.minBathrooms

    // Location Match Details
    // Values: 'string-similarity' | 'geolocation' | 'both' | 'exact'
    locationMatchType: varchar("location_match_type", { length: 20 }),
    distanceKm: decimal("distance_km", { precision: 5, scale: 2 }), // Distance in kilometers if geolocation match
    neighborhoodMatch: boolean("neighborhood_match"), // True if neighborhood name matches exactly

    // Feature Matching Details
    missingFeatures: jsonb("missing_features"), // Array of features prospect wants but listing doesn't have: ["elevator", "garage"]
    extraFeatures: jsonb("extra_features"), // Array of bonus features listing has that prospect didn't require: ["pool", "garden"]
    featureMatchPercentage: smallint("feature_match_percentage"), // 0-100: Percentage of required features that are present

    // Business Logic Flags
    isAutoMatched: boolean("is_auto_matched").default(true), // True if auto-calculated, false if manually created by agent
    requiresManualReview: boolean("requires_manual_review").default(false), // Flag for matches that need agent review
    reviewedBy: varchar("reviewed_by", { length: 36 }), // FK → users.id (agent who reviewed this match)
    reviewedAt: timestamp("reviewed_at"), // When the match was manually reviewed
    reviewNotes: text("review_notes"), // Agent notes about this match

    // Match Status Tracking
    // Values: 'new' | 'viewed' | 'shared' | 'contacted' | 'dismissed' | 'lead_created'
    matchStatus: varchar("match_status", { length: 30 }).default("new"),
    viewedAt: timestamp("viewed_at"), // When agent first viewed this match
    viewCount: integer("view_count").default(0), // How many times this match was viewed
    sharedAt: timestamp("shared_at"), // When match was shared with prospect
    sharedBy: varchar("shared_by", { length: 36 }), // FK → users.id (agent who shared)

    // Dismissal Tracking
    dismissedAt: timestamp("dismissed_at"), // When match was dismissed
    dismissedBy: varchar("dismissed_by", { length: 36 }), // FK → users.id (who dismissed it)
    // Values: 'not_interested' | 'already_seen' | 'wrong_criteria' | 'other'
    dismissalReason: varchar("dismissal_reason", { length: 50 }),
    dismissalNotes: text("dismissal_notes"), // Optional notes about why dismissed

    // Analytics & ML Features
    prospectEngagementScore: smallint("prospect_engagement_score"), // 0-100: How engaged this prospect typically is
    historicalConversionRate: decimal("historical_conversion_rate", {
      precision: 5,
      scale: 2,
    }), // Percentage: Similar matches that converted to deals
    similarMatchesCount: integer("similar_matches_count"), // How many similar matches exist for this prospect
    // Values: 'high' | 'medium' | 'low' (how many other prospects match this listing)
    competitionLevel: varchar("competition_level", { length: 20 }),

    // Time-sensitive Factors
    prospectUrgency: smallint("prospect_urgency"), // 1-5: Copy of prospect's urgency level at time of match
    daysUntilMoveIn: integer("days_until_move_in"), // Days between calculatedAt and prospect's moveInBy date
    listingAgeInDays: integer("listing_age_in_days"), // How old the listing was when match was calculated
    isNewListing: boolean("is_new_listing"), // True if listing was created within last 7 days

    // Notification & Communication Tracking
    notificationSent: boolean("notification_sent").default(false), // Whether agent was notified about this match
    notificationSentAt: timestamp("notification_sent_at"),
    prospectNotified: boolean("prospect_notified").default(false), // Whether prospect was notified
    prospectNotifiedAt: timestamp("prospect_notified_at"),
    emailSent: boolean("email_sent").default(false),
    emailSentAt: timestamp("email_sent_at"),

    // Pricing Intelligence
    pricePerSqMeter: decimal("price_per_sq_meter", { precision: 10, scale: 2 }), // Calculated at match time
    isGoodDeal: boolean("is_good_deal"), // True if price is below market average for area
    marketPriceDeviation: decimal("market_price_deviation", {
      precision: 5,
      scale: 2,
    }), // Percentage above/below market price

    // Timestamps
    calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"), // For TTL-based invalidation (optional)
    firstCalculatedAt: timestamp("first_calculated_at"), // When this match was first created (doesn't change on recalc)

    // Soft Delete / Stale Flag
    isStale: boolean("is_stale").default(false), // Mark as stale instead of deleting
    // Values: 'recalculated' | 'prospect_updated' | 'listing_updated' | 'listing_sold'
    staleReason: varchar("stale_reason", { length: 100 }),

    // System Fields
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    // Version tracking (for schema evolution)
    schemaVersion: smallint("schema_version").default(1), // Track which version of matching algorithm was used
    // Client Response Tracking (independent of matchStatus — tracks what the
    // prospect actually replied after a match was sent).
    // Values: 'pending' | 'accepted' | 'finalized' | 'rejected'
    clientResponse: varchar("client_response", { length: 20 })
      .notNull()
      .default("pending"),
    clientResponseAt: timestamp("client_response_at"),
    clientResponseBy: varchar("client_response_by", { length: 36 }), // FK → users.id
    clientResponseNotes: text("client_response_notes"),
    // Denormalized last-update blob for card-level rendering — bounded shape:
    // { lastSharedAt?, lastBucketChangeAt?, lastViewedAt?, lastCommentAt?,
    //   lastCommentPreview?, lastCommentBy? }
    // Comment THREADS live in match_comments; this is just the read-time
    // shortcut so cards don't need to join.
    activity: jsonb("activity").default({}).notNull(),
  },
  (table) => [
    uniqueIndex("uq_prospect_listing_match").on(
      table.prospectId,
      table.listingId,
    ),
  ],
);

// Testimonials table
export const testimonials = pgTable("testimonials", {
  testimonialId: bigserial("testimonial_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  content: text("content").notNull(),
  avatar: varchar("avatar", { length: 1024 }),
  rating: smallint("rating").notNull().default(5),
  isVerified: boolean("is_verified").default(true),
  sortOrder: integer("sort_order").default(1),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Website configuration table
export const websiteProperties = pgTable("website_config", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  socialLinks: text("social_links").notNull(), // JSON containing social media links
  seoProps: text("seo_props").notNull(), // JSON containing SEO properties
  logo: varchar("logo", { length: 1024 }).notNull(), // URL to logo file
  logotype: varchar("logotype", { length: 1024 }).notNull(), // URL to logotype file
  favicon: varchar("favicon", { length: 1024 }).notNull(), // URL to favicon file
  heroProps: text("hero_props").notNull(), // JSON containing hero section properties
  featuredProps: text("featured_props").notNull(), // JSON containing featured section properties
  aboutProps: text("about_props").notNull(), // JSON containing about section properties
  propertiesProps: text("properties_props").notNull(), // JSON containing properties section configuration
  testimonialProps: text("testimonial_props").notNull(), // JSON containing testimonial section properties
  contactProps: text("contact_props"), // JSON containing contact section properties
  footerProps: text("footer_props").notNull(), // JSON containing footer configuration
  headProps: text("head_props").notNull(), // JSON containing head section properties
  watermarkProps: text("watermark_props").notNull().default("{}"), // JSON containing watermark configuration
  linksProps: text("links_props"), // JSON array of LinkCategory entries for the "Enlaces de interés" page
  faqsProps: text("faqs_props"), // JSON array of FaqCategory entries for the "/faqs" page. null → built-in default FAQs
  colorProps: text("color_props").notNull().default("{}"), // JSON containing primary/secondary color selection
  fontProps: text("font_props"), // JSON { sansFamily, headingFamily? }; null → Geist default
  rebuildHistory: text("rebuild_history").notNull().default("[]"), // JSON array of ISO timestamps for rebuild clicks
  promoCardsProps: text("promo_cards_props"), // JSON array of PromoCard entries — Vesta-controlled homepage promo cards (DSL-driven)
  bannerProps: text("banner_props"), // JSON BannerProps — big homepage banner below hero/search. null or {kind:"none"} → hidden (default for all accounts)
  metadata: text("metadata"), // JSON containing metadata configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  featuresProps: text("features_props"), // JSON FeaturesProps — per-account page/section toggles + menu labels + logo size. null → all defaults (current behavior)
});

// Comments table
export const comments = pgTable("comments", {
  commentId: bigserial("comment_id", { mode: "bigint" }).primaryKey(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(), // FK → properties.property_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }), // Comment category/type
  parentId: bigint("parent_id", { mode: "bigint" }), // Self-reference for replies
  isDeleted: boolean("is_deleted").default(false),
  pinnedAt: timestamp("pinned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Comments table (Contact-based comments)
export const userComments = pgTable("user_comments", {
  commentId: bigserial("comment_id", { mode: "bigint" }).primaryKey(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  content: text("content").notNull(),
  parentId: bigint("parent_id", { mode: "bigint" }), // Self-reference for replies
  isDeleted: boolean("is_deleted").default(false),
  pinnedAt: timestamp("pinned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Listing Contact Comments table (Comments on listing-contact relationships)
export const listingContactComments = pgTable("listing_contact_comments", {
  commentId: bigserial("comment_id", { mode: "bigint" }).primaryKey(),
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }).notNull(), // FK → listing_contacts.listing_contact_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  content: text("content").notNull(),
  // Values: 'general' | 'offer' | 'viewing' | 'negotiation' | 'follow_up' | 'internal'
  category: varchar("category", { length: 100 }),
  parentId: bigint("parent_id", { mode: "bigint" }), // Self-reference for replies
  isDeleted: boolean("is_deleted").default(false),
  pinnedAt: timestamp("pinned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Appointment Comments table (Comments on appointments)
export const appointmentComments = pgTable("appointment_comments", {
  commentId: bigserial("comment_id", { mode: "bigint" }).primaryKey(),
  appointmentId: bigint("appointment_id", { mode: "bigint" }).notNull(), // FK → appointments.appointment_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  content: text("content").notNull(),
  parentId: bigint("parent_id", { mode: "bigint" }), // Self-reference for replies
  isDeleted: boolean("is_deleted").default(false),
  pinnedAt: timestamp("pinned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Incident Comments table (Progress notes on rental incidents)
export const incidentComments = pgTable("incident_comments", {
  commentId: bigserial("comment_id", { mode: "bigint" }).primaryKey(),
  incidentId: bigint("incident_id", { mode: "bigint" }).notNull(), // FK → incidents.incident_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  content: text("content").notNull(),
  parentId: bigint("parent_id", { mode: "bigint" }), // Self-reference for replies
  isDeleted: boolean("is_deleted").default(false),
  pinnedAt: timestamp("pinned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Task Comments table (Comments on tasks)
export const taskComments = pgTable("task_comments", {
  commentId: bigserial("comment_id", { mode: "bigint" }).primaryKey(),
  taskId: bigint("task_id", { mode: "bigint" }).notNull(), // FK → tasks.task_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  content: text("content").notNull(),
  parentId: bigint("parent_id", { mode: "bigint" }), // Self-reference for replies
  isDeleted: boolean("is_deleted").default(false),
  pinnedAt: timestamp("pinned_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Cartel Configurations table
export const cartelConfigurations = pgTable("cartel_configurations", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: varchar("user_id", { length: 36 }), // FK → users.id (nullable)
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  propertyId: bigint("property_id", { mode: "bigint" }), // FK → properties.property_id (nullable)
  name: varchar("name", { length: 255 }).notNull(),
  templateConfig: jsonb("template_config").notNull(),
  propertyOverrides: jsonb("property_overrides").default("{}"),
  selectedContacts: jsonb("selected_contacts").default("{}"),
  selectedImageIndices: jsonb("selected_image_indices").default("[]"),
  isDefault: boolean("is_default").default(false),
  isGlobal: boolean("is_global").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Escaparate (shop window) layout definitions
export const escaparates = pgTable("escaparates", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  name: varchar("name", { length: 100 }).notNull(), // e.g. "Escaparate principal", "Ventana lateral"
  gridColumns: integer("grid_columns").notNull().default(12),
  gridRows: integer("grid_rows").notNull().default(8),
  slots: jsonb("slots").notNull().default("[]"), // Array of EscaparateSlotDef
  maxDays: integer("max_days"), // nullable — if set, alerts after N days (Phase 2)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Escaparate slot → listing assignments
export const escaparatePositions = pgTable("escaparate_positions", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  escaparateId: bigint("escaparate_id", { mode: "bigint" }).notNull(), // FK → escaparates.id
  slotId: varchar("slot_id", { length: 50 }).notNull(), // Matches slot id in escaparate layout
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable = empty slot)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Feedback table
export const feedback = pgTable("feedback", {
  feedbackId: bigserial("feedback_id", { mode: "bigint" }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  feedbackComment: text("feedback_comment").notNull(),
  scale: smallint("scale").notNull(), // 1-4 scale rating
  url: varchar("url", { length: 2048 }), // URL where feedback was submitted
  category: varchar("category", { length: 50 }), // e.g. 'bug', 'feature', 'ux', 'performance', 'other'
  githubIssueUrl: varchar("github_issue_url", { length: 2048 }), // URL to the linked GitHub issue
  // UI options: 'submitted' (Enviado) | 'backlog' (Backlog) | 'resolved' (Resuelto) | 'evaluating' (Evaluando) | 'testing' (Probando) | 'ongoing' (En curso)
  status: varchar("status", { length: 50 }).default("submitted").notNull(),
  resolved: boolean("resolved").default(false).notNull(), // 1=resolved, 0=unresolved (kept for backward compatibility)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  urgency: varchar("urgency", { length: 20 }), // 'critical' | 'high' | 'medium' | 'low' — auto-classified by Haiku on submission
  title: text("title"), // Haiku's 4-7 word Spanish headline above the comment in /feedback and /admin/support
  urgencyReason: text("urgency_reason"), // Haiku's short Spanish justification for the urgency assignment
  callScript: text("call_script"), // Spanish briefing read aloud by Twilio when the alert is placed (~350 chars)
  summary: text("summary"), // Haiku's 2-3 sentence Spanish summary of what the ticket is about
  nextSteps: text("next_steps"), // Haiku's bullet list of suggested next steps to resolve the ticket
});

// Account-specific roles table
export const accountRoles = pgTable("account_roles", {
  accountRoleId: bigserial("account_role_id", { mode: "bigint" }).primaryKey(),
  // Values: 1=Superadmin (internal only) | 2=Agent | 3=Account Admin | 4=Office Manager | 5=Inactive
  roleId: bigint("role_id", { mode: "bigint" }).notNull(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  permissions: jsonb("permissions").notNull().default({}), // JSON with all permissions for this role in this account
  isSystem: boolean("is_system").default(false), // True for default roles that shouldn't be deleted
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Notifications table
export const notifications = pgTable("notifications", {
  // Primary Key
  notificationId: bigserial("notification_id", { mode: "bigint" }).primaryKey(),

  // Account for multi-tenant security
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // User targeting
  userId: varchar("user_id", { length: 36 }), // FK → users.id (null = broadcast to all account users)
  fromUserId: varchar("from_user_id", { length: 36 }), // FK → users.id (who triggered it, can be system)

  // Notification content
  // Values: 'appointment_reminder' | 'new_lead' | 'property_update' | 'task_due' | 'deal_status' | 'document_uploaded' | 'comment_reply' | 'portal_sync' | 'system_alert'
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("action_url", { length: 500 }), // Where to navigate when clicked

  // Priority and categorization
  // Values: 'low' | 'normal' | 'high' | 'urgent'
  priority: varchar("priority", { length: 20 }).default("normal"),
  // Values: 'appointments' | 'properties' | 'contacts' | 'deals' | 'tasks' | 'system'
  category: varchar("category", { length: 50 }).notNull(),

  // Entity relationships (polymorphic references)
  // Values: 'property' | 'listing' | 'contact' | 'appointment' | 'task' | 'deal' | 'prospect' | 'document'
  entityType: varchar("entity_type", { length: 50 }),
  entityId: bigint("entity_id", { mode: "bigint" }), // ID of the related entity

  // Additional metadata
  metadata: jsonb("metadata").default({}), // Flexible field for extra data (e.g., appointment time, property address)

  // Notification state
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  isDismissed: boolean("is_dismissed").default(false),
  dismissedAt: timestamp("dismissed_at"),

  // Delivery tracking
  // Values: 'in_app' | 'email' | 'push' | 'sms'
  deliveryChannel: varchar("delivery_channel", { length: 50 }).default(
    "in_app",
  ),
  isDelivered: boolean("is_delivered").default(false),
  deliveredAt: timestamp("delivered_at"),
  deliveryError: text("delivery_error"), // Error message if delivery failed

  // Scheduling (for future notifications)
  scheduledFor: timestamp("scheduled_for"), // When to send (null = immediate)
  expiresAt: timestamp("expires_at"), // Auto-dismiss after this time

  // System fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Push Subscriptions table (for browser push notifications)
export const pushSubscriptions = pgTable("push_subscriptions", {
  subscriptionId: bigserial("subscription_id", { mode: "bigint" }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  endpoint: text("endpoint").notNull(), // Push service URL
  p256dh: text("p256dh").notNull(), // Encryption key
  auth: text("auth").notNull(), // Auth secret
  userAgent: text("user_agent"), // Device/browser info (optional)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Deal Activity (track important deal changes and milestones)
export const dealActivity = pgTable("deal_activity", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  dealId: bigint("deal_id", { mode: "bigint" }).notNull(), // FK → deals.deal_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (WHO changed it)
  // Values: 'deal_created' | 'status_changed' | 'price_changed' | 'commission_paid' | 'arras_received' | 'deed_signed' | 'deal_closed' | 'deal_cancelled'
  action: varchar("action", { length: 50 }).notNull(),
  details: jsonb("details").notNull(), // Action-specific data: { oldValue, newValue, reason, etc. }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Contact Activity (track contact lifecycle and GDPR compliance)
export const contactActivity = pgTable("contact_activity", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (WHO changed it, or 'system' for automated)
  // Values: 'contact_created' | 'contact_deactivated' | 'consent_given' | 'consent_withdrawn' | 'gdpr_data_export_requested'
  action: varchar("action", { length: 50 }).notNull(),
  details: jsonb("details").notNull(), // Action-specific data: { reason, method, compliance info, etc. }
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Pending GDPR Notifications (queue for notifications blocked by missing consent)
export const pendingGdprNotifications = pgTable(
  "pending_gdpr_notifications",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
    accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
    // Values: 'property_notifications' | 'commercial_communications' | 'appointment_reminders' | 'document_notifications'
    category: varchar("category", { length: 50 }).notNull(),
    notificationType: varchar("notification_type", { length: 100 }).notNull(),
    deduplicationKey: varchar("deduplication_key", { length: 255 }).notNull(),
    payload: jsonb("payload").notNull(), // Entity IDs + metadata needed to replay the notification
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(), // Auto-cleanup after 7 days
  },
  (table) => [
    uniqueIndex("uq_pending_gdpr_contact_dedup").on(
      table.contactId,
      table.deduplicationKey,
    ),
  ],
);

// Call Records table (Twilio phone calls with recording & transcription)
export const callRecords = pgTable("call_records", {
  callId: bigserial("call_id", { mode: "bigint" }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (agent who made/received call)
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (optional)
  serviceProviderId: bigint("service_provider_id", { mode: "bigint" }), // FK → service_providers.service_provider_id (optional, for vendor calls)
  propertyId: bigint("property_id", { mode: "bigint" }), // FK → listings.listing_id (optional context)

  // Twilio identifiers
  twilioCallSid: varchar("twilio_call_sid", { length: 64 }).unique().notNull(), // CA... unique identifier
  twilioAccountSid: varchar("twilio_account_sid", { length: 64 }).notNull(), // AC... for multi-tenant tracking

  // Call metadata
  // Values: 'inbound' | 'outbound'
  direction: varchar("direction", { length: 20 }).notNull(),
  from: varchar("from", { length: 20 }).notNull(), // E.164 format phone number
  to: varchar("to", { length: 20 }).notNull(), // E.164 format phone number
  // Values: 'initiated' | 'ringing' | 'in-progress' | 'completed' | 'failed' | 'busy' | 'no-answer' | 'canceled'
  status: varchar("status", { length: 20 }).notNull(),
  duration: integer("duration"), // Total call duration in seconds
  billDuration: integer("bill_duration"), // Billable duration in seconds

  // Recording details
  recordingUrl: varchar("recording_url", { length: 2048 }), // S3 URL after download from Twilio
  recordingSid: varchar("recording_sid", { length: 64 }), // RE... Twilio recording identifier
  recordingDuration: integer("recording_duration"), // Recording length in seconds

  // Transcription details (AI-powered via Whisper)
  transcriptionText: text("transcription_text"), // Full transcription from Whisper API
  transcriptionSummary: text("transcription_summary"), // AI-generated summary (GPT-4)
  transcriptionLanguage: varchar("transcription_language", {
    length: 10,
  }).default("es"), // 'es' | 'en' | etc.
  // Values: 'pending' | 'processing' | 'completed' | 'failed'
  transcriptionStatus: varchar("transcription_status", { length: 20 }).default(
    "pending",
  ),

  // AI-generated insights (structured analysis)
  keyPoints: jsonb("key_points").default([]).$type<string[]>(), // Main discussion points
  actionItems: jsonb("action_items")
    .default([])
    .$type<
      Array<{
        task: string;
        owner?: string;
        deadline?: string;
        priority?: string;
      }>
    >(), // Tasks with deadlines
  decisions: jsonb("decisions").default([]).$type<string[]>(), // Decisions made during call
  openQuestions: jsonb("open_questions").default([]).$type<string[]>(), // Unanswered questions

  // Sentiment & urgency
  // Values: 'positive' | 'neutral' | 'negative'
  sentiment: varchar("sentiment", { length: 20 }),
  // Values: 'low' | 'medium' | 'high'
  urgency: varchar("urgency", { length: 20 }),

  // Legacy fields (kept for backwards compatibility)
  topics: jsonb("topics").default([]).$type<string[]>(), // Extracted conversation topics
  transcriptionActionItems: jsonb("transcription_action_items")
    .default([])
    .$type<string[]>(), // Legacy action items

  // Cost tracking
  price: decimal("price", { precision: 10, scale: 4 }), // Call cost from Twilio
  priceUnit: varchar("price_unit", { length: 10 }).default("USD"),

  // Timestamps
  startedAt: timestamp("started_at"), // When call was initiated
  answeredAt: timestamp("answered_at"), // When call was answered
  endedAt: timestamp("ended_at"), // When call ended
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // GDPR/LOPDGDD: which disclosure version was played (inbound only; null on outbound — verbal disclosure by agent)
  recordingDisclosureVersion: varchar("recording_disclosure_version", {
    length: 32,
  }),
});

// Email Threads table (stored Gmail threads for DB-first reads)
export const emailThreads = pgTable("email_threads", {
  threadId: bigserial("thread_id", { mode: "bigint" }).primaryKey(),
  gmailThreadId: varchar("gmail_thread_id", { length: 255 }).notNull(), // Gmail's thread ID
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  subject: varchar("subject", { length: 1000 }),
  snippet: text("snippet"),
  participants: jsonb("participants")
    .default([])
    .$type<Array<{ name: string; email: string }>>(), // [{name, email}]
  isRead: boolean("is_read").default(false),
  isStarred: boolean("is_starred").default(false),
  messageCount: integer("message_count").default(0),
  labels: jsonb("labels").default([]).$type<string[]>(),
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (primary contact)
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }), // FK → listing_contacts (migrated from emailThreadContexts)
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  category: varchar("category", { length: 10 }).default("primary").notNull(),
  isActive: boolean("is_active").default(true),

  // Pending reply tracking (AI-classified)
  pendingReplyOwner: varchar("pending_reply_owner", { length: 10 }), // 'agent' | 'contact' | null (needs classification)
  pendingReplyClassifiedAt: timestamp("pending_reply_classified_at"),

  // Incident automation classification
  // Values: 'incidencia' | 'solicitud_info' | 'pago' | 'general'
  messageClassification: varchar("message_classification", { length: 30 }),

  // Source integration (for shared inbox separation)
  integrationId: bigint("integration_id", { mode: "bigint" }), // FK → user_integrations.integration_id
  provider: varchar("provider", { length: 20 }).default("gmail").notNull(), // 'gmail' | 'outlook'
});

// Email Messages table (stored Gmail messages for DB-first reads)
export const emailMessages = pgTable("email_messages", {
  messageId: bigserial("message_id", { mode: "bigint" }).primaryKey(),
  emailThreadId: bigint("email_thread_id", { mode: "bigint" }).notNull(), // FK → email_threads.thread_id
  gmailMessageId: varchar("gmail_message_id", { length: 255 }).notNull(), // Gmail's message ID
  gmailThreadId: varchar("gmail_thread_id", { length: 255 }).notNull(), // Denormalized for queries
  // Values: 'inbound' | 'outbound'
  direction: varchar("direction", { length: 10 }).notNull(),
  fromAddress: jsonb("from_address")
    .notNull()
    .$type<{ name: string; email: string }>(), // {name, email}
  toAddresses: jsonb("to_addresses")
    .default([])
    .$type<Array<{ name: string; email: string }>>(), // [{name, email}]
  ccAddresses: jsonb("cc_addresses")
    .default([])
    .$type<Array<{ name: string; email: string }>>(), // [{name, email}]
  subject: varchar("subject", { length: 1000 }),
  body: text("body"), // Plain text
  htmlBody: text("html_body"), // HTML
  attachments: jsonb("attachments")
    .default([])
    .$type<
      Array<{
        name: string;
        type: string;
        size?: string;
        attachmentId?: string;
        messageId?: string;
      }>
    >(),
  internalDate: timestamp("internal_date"), // Gmail's timestamp
  labels: jsonb("labels").default([]).$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  provider: varchar("provider", { length: 20 }).default("gmail").notNull(), // 'gmail' | 'outlook'
  // Per-message cost. Zero today (Resend free tier); populated when we move to a paid email plan.
  costUsd: decimal("cost_usd", { precision: 10, scale: 6 })
    .default("0")
    .notNull(),
});

// Mappings table (for data ingestion column mappings)
export const mappings = pgTable("mappings", {
  // Primary Key
  sourceId: bigserial("source_id", { mode: "bigint" }).primaryKey(),

  // Source information
  sourceName: varchar("source_name", { length: 255 }).notNull(), // e.g., "Inmogesco", "Aliseda", "Custom CRM"

  // Mapping configuration
  mappings: jsonb("mappings").notNull(), // JSON object containing column mappings

  // System fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Fotocasa Logs table (for tracking Fotocasa API interactions)
export const fotocasaLogs = pgTable("fotocasa_logs", {
  // Primary Key
  id: bigserial("id", { mode: "bigint" }).primaryKey(),

  // Timestamp
  timestamp: timestamp("timestamp").notNull(),

  // Listing reference
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (nullable for build_payload operations)

  // Operation type
  // Values: 'BUILD_PAYLOAD' | 'POST' | 'PUT' | 'DELETE'
  operation: varchar("operation", { length: 20 }).notNull(),

  // Request and response data
  requestData: jsonb("request_data"), // Request payload (sanitized)
  responseData: jsonb("response_data"), // Response payload (sanitized)

  // Operation result
  success: boolean("success").notNull(),
  error: text("error"), // Error message if operation failed

  // Additional metadata
  metadata: jsonb("metadata"), // Additional context (e.g., watermarked images count)

  // System field
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Property Description Examples table (for AI-generated property descriptions)
export const propertyDescriptionExamples = pgTable(
  "property_description_examples",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
    // UI options: 'piso' | 'casa' | 'local' | 'garaje' | 'solar' | 'all'
    propertyType: varchar("property_type", { length: 20 }).notNull(),
    // UI options: 'Sale' (Venta) | 'Rent' (Alquiler) | null (applies to both)
    listingType: varchar("listing_type", { length: 20 }),
    exampleText: text("example_text").notNull(), // The actual example description text
    title: varchar("title", { length: 100 }), // Optional title/label for the example
    metadata: jsonb("metadata"), // Flexible metadata for future use
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(), // For ordering examples
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

// Image Token Transactions table (track all token usage and purchases)
export const imageTokenTransactions = pgTable("image_token_transactions", {
  // Primary Key
  transactionId: bigserial("transaction_id", { mode: "bigint" }).primaryKey(),

  // Account reference
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // Transaction type and details
  // Values: 'freepik_enhance' | 'gemini_renovate' | 'gemini_detect' | 'token_purchase' | 'admin_credit' | 'admin_debit'
  operation: varchar("operation", { length: 50 }).notNull(),
  tokensChanged: integer("tokens_changed").notNull(), // Positive for purchases/credits, negative for usage
  beforeBalance: integer("before_balance").notNull(), // Token balance before transaction
  afterBalance: integer("after_balance").notNull(), // Token balance after transaction

  // Operation metadata (flexible JSON for different operation types)
  metadata: jsonb("metadata").default({}), // { imageWidth, imageHeight, upscaleFactor, roomType, style, etc. }

  // Related entities
  propertyImageId: bigint("property_image_id", { mode: "bigint" }), // FK → property_images (nullable)
  propertyId: bigint("property_id", { mode: "bigint" }), // FK → properties (nullable)
  userId: varchar("user_id", { length: 36 }), // FK → users.id (who performed the operation)

  // Payment/purchase details (for token purchases)
  purchaseAmount: decimal("purchase_amount", { precision: 10, scale: 2 }), // Amount paid in EUR (nullable)
  // Values: 'stripe' | 'paypal' | 'manual'
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentReference: varchar("payment_reference", { length: 255 }), // External payment ID

  // System fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  // Operation tracking
  operationStatus: varchar("operation_status", { length: 20 }), // 'saved' | 'discarded' | 'error' | null
});

// WhatsApp Conversations table (for two-way messaging with contacts)
export const whatsappConversations = pgTable("whatsapp_conversations", {
  // Primary Key
  conversationId: bigserial("conversation_id", { mode: "bigint" }).primaryKey(),

  // Account for multi-tenant security
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // User who owns this conversation (has the WhatsApp number configured)
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id

  // Contact link (nullable: orphan conversations from unknown numbers stay unlinked
  // until the user manually creates/links a contact via the inbox UI — mirrors the email flow)
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id

  // WhatsApp identity (E.164 format: +34612345678)
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(),

  // Conversation state
  // Values: 'active' | 'closed' | 'archived'
  status: varchar("status", { length: 20 }).default("active"),
  lastMessageAt: timestamp("last_message_at"), // Last message timestamp (for sorting)
  lastCustomerMessageAt: timestamp("last_customer_message_at"), // For 24h window tracking
  unreadCount: integer("unread_count").default(0).notNull(),
  isStarred: boolean("is_starred").default(false),

  // Context linking (similar to email_thread_contexts)
  listingContactId: bigint("listing_contact_id", { mode: "bigint" }), // FK → listing_contacts.listing_contact_id (optional)

  // Pending reply tracking (AI-classified)
  pendingReplyOwner: varchar("pending_reply_owner", { length: 10 }), // 'agent' | 'contact' | null (needs classification)
  pendingReplyClassifiedAt: timestamp("pending_reply_classified_at"),

  // Incident automation classification
  // Values: 'incidencia' | 'solicitud_info' | 'pago' | 'general'
  messageClassification: varchar("message_classification", { length: 30 }),

  // Provider: 'twilio' (default, WhatsApp Business API) or 'evolution' (personal WhatsApp via Evolution API)
  provider: varchar("provider", { length: 20 }).default("twilio").notNull(),

  // System fields
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
  // Incident agent v2: per-conversation lock + pending flag (the conversation
  // is the only row that exists before classification creates incident state).
  incidentAgentProcessingSince: timestamp("incident_agent_processing_since"),
  incidentAgentHasPendingWork: boolean("incident_agent_has_pending_work")
    .default(false)
    .notNull(),
});

// WhatsApp Messages table (individual messages in conversations)
export const whatsappMessages = pgTable(
  "whatsapp_messages",
  {
    // Primary Key
    messageId: bigserial("message_id", { mode: "bigint" }).primaryKey(),

    // Conversation reference
    conversationId: bigint("conversation_id", { mode: "bigint" }).notNull(), // FK → whatsapp_conversations.conversation_id

    // Provider identifiers
    twilioMessageSid: varchar("twilio_message_sid", { length: 64 }), // SM... or MM... SID from Twilio
    evolutionMessageId: varchar("evolution_message_id", { length: 64 }), // BAE... ID from Evolution API

    // Message direction and status
    // Values: 'inbound' | 'outbound'
    direction: varchar("direction", { length: 10 }).notNull(),
    sentBy: text("sent_by").default("human"),
    // Values: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
    status: varchar("status", { length: 20 }).default("sent"),

    // Content
    body: text("body"), // Message text content
    mediaUrls: jsonb("media_urls").default([]), // Array of media URLs: [{url, contentType}]

    // Sender info
    // Values: 'agent' | 'contact' | 'system'
    senderType: varchar("sender_type", { length: 20 }).notNull(),
    senderUserId: varchar("sender_user_id", { length: 36 }), // FK → users.id (if agent)

    // Template info (for business-initiated messages after 24h)
    isTemplate: boolean("is_template").default(false),
    templateSid: varchar("template_sid", { length: 64 }), // Content template SID if used
    templateVariables: jsonb("template_variables"), // Variables passed to template

    // Error tracking
    errorCode: varchar("error_code", { length: 20 }),
    errorMessage: text("error_message"),

    // Timestamps
    sentAt: timestamp("sent_at"), // When message was sent/received
    deliveredAt: timestamp("delivered_at"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    // Composite index to make "load latest N messages for a conversation"
    // an index range scan instead of a filesort. Used by getMessages().
    conversationCreatedIdx: index(
      "whatsapp_messages_conversation_created_idx",
    ).on(table.conversationId, table.createdAt.desc()),
  }),
);

// =============================================
// RENTAL MANAGEMENT (Alquileres) TABLES
// =============================================

// Leases table - Store lease/rental agreement information
export const leases = pgTable("leases", {
  leaseId: bigserial("lease_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  roomId: bigint("room_id", { mode: "bigint" }), // FK → listing_rooms.room_id (null = whole property, set = by_room rental)

  // Primary tenant reference (can have multiple via lease_tenants junction)
  primaryTenantContactId: bigint("primary_tenant_contact_id", {
    mode: "bigint",
  }).notNull(), // FK → contacts.contact_id

  // Lease terms
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"), // null = indefinite contract
  // UI options: 'auto' (Automática) | 'manual' (Manual) | 'none' (Sin renovación)
  renewalType: varchar("renewal_type", { length: 20 }),
  noticePeriodDays: smallint("notice_period_days"), // Days of notice required before termination (e.g., 30, 60, 90)

  // Financial
  monthlyRent: decimal("monthly_rent", { precision: 12, scale: 2 }).notNull(),
  securityDeposit: decimal("security_deposit", { precision: 12, scale: 2 }),
  additionalGuarantee: decimal("additional_guarantee", {
    precision: 12,
    scale: 2,
  }),
  paymentDueDay: smallint("payment_due_day").default(1), // Day of month rent is due (1-28)
  paymentDueEndDay: smallint("payment_due_end_day"), // Last acceptable day (e.g., 7 for "between days 1 and 7")
  // Comma-separated: "bizum,transferencia,domiciliacion,efectivo,otro"
  paymentMethod: varchar("payment_method", { length: 100 }),
  paymentAccountDetails: varchar("payment_account_details", { length: 500 }), // JSON: {"bizum":"612345678","transferencia":"ES12..."}

  // Early termination & minimum stay
  earlyTerminationPenalty: text("early_termination_penalty"), // Description: "1 month rent per remaining month"
  minimumStayEndDate: timestamp("minimum_stay_end_date"), // Date after which contract can be terminated freely

  // IPC/Rent updates. IPC applies to every lease — /api/cron/rental-ipc-auto-apply
  // writes the IPC-adjusted rent automatically on the lease anniversary.
  hasIpcClause: boolean("has_ipc_clause").default(false),
  ipcUpdateMonth: smallint("ipc_update_month"), // 1-12, month when IPC update applies
  ipcUpdateDay: smallint("ipc_update_day"), // 1-31, day of month when IPC update applies
  lastRentUpdateDate: timestamp("last_rent_update_date"),
  rentUpdatePercentage: decimal("rent_update_percentage", {
    precision: 5,
    scale: 2,
  }),

  // Legal
  governingLaw: varchar("governing_law", { length: 255 }), // e.g., "LAU art. 4.3"
  jurisdiction: varchar("jurisdiction", { length: 255 }), // e.g., "Juzgados y Tribunales de León"

  // Exit conditions
  checkoutTime: varchar("checkout_time", { length: 10 }), // e.g., "12:00"
  lateExitPenalty: text("late_exit_penalty"), // e.g., "15 days extra rent"

  // Bundled utility fee (typical in habitación contracts: "40€/mes incluye
  // luz + agua + gas + internet + limpieza"). NULL = no bundle.
  utilitiesFlatFee: decimal("utilities_flat_fee", { precision: 12, scale: 2 }),
  utilitiesFlatFeeCovers: jsonb("utilities_flat_fee_covers"), // string[] of utility_type values
  utilitiesFlatFeeDescription: text("utilities_flat_fee_description"),
  // Utilities model on the lease: "simple" (itemized) or "flat_with_caps"
  // (bundle + per-utility monthly caps). Drives the rendered cláusula.
  utilitiesMode: varchar("utilities_mode", { length: 20 })
    .notNull()
    .default("simple"),
  // When utilitiesMode = "flat_with_caps": array of {type, monthlyCap}
  utilityCaps: jsonb("utility_caps"),
  // "equal" | "by_consumption"
  utilitiesExcedenteSplit: varchar("utilities_excedente_split", { length: 20 }),
  // e.g. "2x_month", "weekly" — free-form when included in the flat fee
  cleaningServiceFrequency: varchar("cleaning_service_frequency", {
    length: 32,
  }),

  // UI options: 'active' (Activo) | 'ended' (Finalizado) | 'pending' (Pendiente)
  status: varchar("status", { length: 20 }).notNull().default("active"),
  terminationDate: timestamp("termination_date"),
  terminationReason: varchar("termination_reason", { length: 255 }),

  // Accounting classification (drives IVA/retención per invoice)
  // 'residential' (vivienda LAU) | 'rooms' (habitación) | 'tourist' | 'commercial'
  rentalCategory: varchar("rental_category", { length: 20 })
    .notNull()
    .default("residential"),
  // Whether the stated monthly_rent includes IVA (true for residential, usually false for commercial)
  rentIsIvaInclusive: boolean("rent_is_iva_inclusive").notNull().default(true),
  // Drives modelo-115 retention on commercial rentals (tenant withholds 19% only if company)
  tenantIsCompany: boolean("tenant_is_company").notNull().default(false),

  // Sidecar metadata extracted from rental documents (fianza receipt, inventario,
  // etc.). The amount itself stays in `securityDeposit` — this stores the
  // bank/holder/reference details that don't deserve top-level columns.
  leaseFields: jsonb("lease_fields").$type<{
    deposit?: {
      bankName?: string;
      bankAccountIban?: string;
      holderName?: string;
      depositReference?: string;
      depositDate?: string;
      depositAmount?: number;
      receiptDocumentId?: string;
    };
    inventory?: {
      entradaDocumentId?: string;
      salidaDocumentId?: string;
    };
    extractedAt?: string;
  }>(),

  // Termination fault attribution (set on early termination via the
  // EndLeaseDialog settlement flow). null for leases ended in plazo.
  terminationFault: varchar("termination_fault", { length: 60 }),
  terminationFaultNotes: text("termination_fault_notes"),
  // Full settlement breakdown (line items + LAU rule trace) for audit and
  // for rendering the tenant-facing liquidación page.
  terminationSettlement: jsonb("termination_settlement"),
  // Lifecycle of the settlement: 'draft' (saved but not yet committed —
  // no rent_payments row, room not freed, lease still active) or 'final'
  // (committed). null when no settlement exists yet.
  terminationStatus: varchar("termination_status", { length: 20 }),
  // Termination date the agent chose for a draft. For final settlements
  // the date lives in `endDate` instead. null for drafts that haven't
  // picked a date yet.
  terminationDraftDate: timestamp("termination_draft_date"),

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  /**
   * Which index drives the annual update:
   *   'ipc'  → INE IPC general
   *   'irav' → INE IRAV (residential post-2023-05-26 — Ley 12/2023)
   *   'none' → no automatic update (e.g. turístico, or pacto sin cláusula)
   */
  indexType: varchar("index_type", { length: 10 })
    .notNull()
    .default("ipc")
    .$type<"ipc" | "irav" | "none">(),
});

// Lease Activity (track important lease changes and milestones)
export const leaseActivity = pgTable("lease_activity", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  leaseId: bigint("lease_id", { mode: "bigint" }).notNull(), // FK → leases.lease_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (WHO changed it, or 'system' for automated)
  // Values: 'lease_created' | 'lease_activated' | 'lease_renewed' | 'lease_terminated' | 'lease_cancelled' | 'rent_updated' | 'payment_received' | 'payment_missed' | ...
  action: varchar("action", { length: 50 }).notNull(),
  details: jsonb("details").notNull(), // Action-specific data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Listing Rooms table - For "alquiler por habitaciones" (room-by-room rental)
export const listingRooms = pgTable("listing_rooms", {
  roomId: bigserial("room_id", { mode: "bigint" }).primaryKey(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // Room identification
  name: varchar("name", { length: 100 }).notNull(), // "Habitación 1", "Suite Principal" (internal)
  title: varchar("title", { length: 200 }), // Public-facing title for portals (Idealista, etc.)
  roomNumber: integer("room_number"), // Optional numeric identifier

  // Room characteristics
  squareMeters: decimal("square_meters", { precision: 8, scale: 2 }),
  hasPrivateBath: boolean("has_private_bath").default(false),
  hasWindow: boolean("has_window").default(true),
  hasBalcony: boolean("has_balcony").default(false),
  features: text("features"), // Additional features like balcony, views, etc.

  // Rental info
  monthlyRent: decimal("monthly_rent", { precision: 12, scale: 2 }),
  depositAmount: decimal("deposit_amount", { precision: 12, scale: 2 }),
  noticePeriodDays: smallint("notice_period_days"), // Days of notice required before termination

  // Tenant assignment (direct - allows assigning before lease creation)
  tenantContactId: bigint("tenant_contact_id", { mode: "bigint" }), // FK → contacts.contact_id

  // UI options: 'available' (Disponible) | 'occupied' (Ocupada) | 'reserved' (Reservada) | 'unavailable' (No disponible)
  status: varchar("status", { length: 20 }).notNull().default("available"),

  // Description
  description: text("description"),
  shortDescription: varchar("short_description", { length: 200 }),

  // ═══════════════════════════════════════════════════════════════════════════
  // IDEALISTA REQUIRED FIELDS (10) - Must have for room publishing
  // ═══════════════════════════════════════════════════════════════════════════
  tenantNumber: smallint("tenant_number"), // 2-99, total tenants in flat
  smokingAllowed: boolean("smoking_allowed"), // smoking permitted in flat
  minTenantAge: smallint("min_tenant_age"), // youngest current tenant age (1-99)
  maxTenantAge: smallint("max_tenant_age"), // oldest current tenant age (1-99)
  couplesAllowed: boolean("couples_allowed"), // couples permitted
  // UI options: 'single' | 'double' | 'two_beds' | 'none'
  bedType: varchar("bed_type", { length: 20 }),
  minimalStay: smallint("minimal_stay"), // 1-6 months minimum
  // UI options: 'street_view' | 'courtyard_view' | 'no_window'
  windowView: varchar("window_view", { length: 20 }),
  ownerLiving: boolean("owner_living"), // owner lives in flat
  availableFrom: varchar("available_from", { length: 10 }), // yyyy-mm-dd format

  // ═══════════════════════════════════════════════════════════════════════════
  // IDEALISTA OPTIONAL FIELDS (22) - For complete room publishing
  // ═══════════════════════════════════════════════════════════════════════════
  // Tenant Demographics
  // UI options: 'female' | 'male' | 'both'
  tenantGender: varchar("tenant_gender", { length: 10 }),
  // UI options: 'female' | 'male' | 'no_preference'
  genderPreference: varchar("gender_preference", { length: 15 }),
  // UI options: 'student' | 'worker' | 'no_preference'
  occupationPreference: varchar("occupation_preference", { length: 15 }),
  minNewTenantAge: smallint("min_new_tenant_age"), // 18-99, min age for new tenant
  maxNewTenantAge: smallint("max_new_tenant_age"), // 18-99, max age for new tenant
  tenantWorkers: boolean("tenant_workers"), // current tenants are workers
  tenantStudents: boolean("tenant_students"), // current tenants are students

  // Room Amenities
  internetAvailable: boolean("internet_available"), // internet in flat
  hasCupboard: boolean("has_cupboard"), // wardrobe in room
  hasDesk: boolean("has_desk"), // desk in room
  hasRoomAC: boolean("has_room_ac"), // A/C in room specifically
  hasWashingMachine: boolean("has_washing_machine"), // washing machine in flat
  houseKeeper: boolean("house_keeper"), // housekeeper service

  // Lifestyle & Preferences
  lgbtFriendly: boolean("lgbt_friendly"), // LGBTQ+ friendly
  childrenAllowed: boolean("children_allowed"), // children allowed
  // UI options: 'quiet' | 'friendly' | 'animated'
  lifeStyle: varchar("life_style", { length: 15 }),
  occupiedNow: boolean("occupied_now"), // room currently has tenant

  // Accessibility
  exteriorAccessibility: boolean("exterior_accessibility"), // building adapted for mobility
  interiorAccessibility: boolean("interior_accessibility"), // interior adapted for mobility

  // Costs
  couplesCosts: smallint("couples_costs"), // extra cost for couples (1-1000€)

  // ═══════════════════════════════════════════════════════════════════════════
  // IDEALISTA PUBLISHING
  // ═══════════════════════════════════════════════════════════════════════════
  idealista: boolean("idealista").default(false),
  idealistaPropertyCode: varchar("idealista_property_code", { length: 50 }),

  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // ═══════════════════════════════════════════════════════════════════════════
  // PISOS.COM (HABITATSOFT) PUBLISHING — per-room
  // Independent of the parent listing's pisoscom flag. When true, the room
  // is PUT to Habitatsoft as its own PropertyTypeId=40 (Habitación) listing
  // at externalId={agencyId}-{parent.referenceNumber}-R{roomId}.
  // ═══════════════════════════════════════════════════════════════════════════
  pisoscom: boolean("pisoscom").notNull().default(false),
  // Habitatsoft FeatureId 99 (Gastos Incluidos) — true when room rent
  // covers utilities. Pending the per-room publish flow to consume it.
  utilitiesIncluded: boolean("utilities_included").notNull().default(false),
});

// Lease Tenants junction table - Support multiple tenants per lease with assessment
export const leaseTenants = pgTable("lease_tenants", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  leaseId: bigint("lease_id", { mode: "bigint" }).notNull(), // FK → leases.lease_id
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  roomId: bigint("room_id", { mode: "bigint" }), // FK → listing_rooms.room_id (for by_room rentals)
  isPrimary: boolean("is_primary").default(false),

  // ID Verification
  idVerified: boolean("id_verified").default(false),
  idVerifiedDate: timestamp("id_verified_date"),
  // UI options: 'dni' (DNI) | 'nie' (NIE) | 'passport' (Pasaporte)
  idDocumentType: varchar("id_document_type", { length: 20 }),

  // Income Verification
  incomeVerified: boolean("income_verified").default(false),
  incomeVerifiedDate: timestamp("income_verified_date"),
  // UI options: 'nomina' (Nómina) | 'pension' (Pensión) | 'autonomo' (Autónomo) | 'other' (Otro)
  incomeSource: varchar("income_source", { length: 50 }),
  monthlyIncome: decimal("monthly_income", { precision: 12, scale: 2 }),
  incomeDocuments: varchar("income_documents", { length: 200 }), // comma-separated doc types provided

  // Employment Verification
  employmentVerified: boolean("employment_verified").default(false),
  employerName: varchar("employer_name", { length: 200 }),
  // UI options: 'indefinido' (Indefinido) | 'temporal' (Temporal) | 'autonomo' (Autónomo) | 'funcionario' (Funcionario)
  employmentType: varchar("employment_type", { length: 30 }),
  employmentStartDate: timestamp("employment_start_date"),

  // References
  referencesChecked: boolean("references_checked").default(false),
  previousLandlordReference: boolean("previous_landlord_reference").default(
    false,
  ),
  previousLandlordNotes: text("previous_landlord_notes"),

  // Guarantor
  hasGuarantor: boolean("has_guarantor").default(false),
  guarantorContactId: bigint("guarantor_contact_id", { mode: "bigint" }), // FK → contacts.contact_id
  guarantorVerified: boolean("guarantor_verified").default(false),
  guarantorRelationship: varchar("guarantor_relationship", { length: 100 }), // e.g. "padre", "familiar", "empresa"

  // Final Assessment
  // UI options: 'low' (Bajo) | 'medium' (Medio) | 'high' (Alto)
  riskLevel: varchar("risk_level", { length: 20 }),
  riskNotes: text("risk_notes"),
  assessmentDate: timestamp("assessment_date"),
  assessedByUserId: varchar("assessed_by_user_id", { length: 36 }), // FK → users.id

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tenant Evaluations table - Track potential tenants being evaluated for a listing
export const tenantEvaluations = pgTable("tenant_evaluations", {
  evaluationId: bigserial("evaluation_id", { mode: "bigint" }).primaryKey(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // Analysis results (filled after document analysis)
  analysisSummary: text("analysis_summary"),
  analysisNotes: text("analysis_notes"),

  // Solicitud-driven workflow: which documentTags the agent requested in the
  // "Solicitar documentación" modal. Drives auto-analysis trigger and the
  // asterisks on /solicitud-publica.
  requestedDocTags: jsonb("requested_doc_tags"),

  // Lifecycle of the AI analysis. UI status options:
  //   'idle' (nothing scheduled) | 'pending' (queued) | 'analyzing' | 'completed' | 'failed'
  analysisStatus: varchar("analysis_status", { length: 20 })
    .notNull()
    .default("idle"),
  analysisStartedAt: timestamp("analysis_started_at"),
  analysisCompletedAt: timestamp("analysis_completed_at"),
  analysisError: text("analysis_error"),

  // Metadata
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true),
});

// Rent Payments table - Track monthly rent payments (manual tracking)
export const rentPayments = pgTable("rent_payments", {
  paymentId: bigserial("payment_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  leaseId: bigint("lease_id", { mode: "bigint" }).notNull(), // FK → leases.lease_id

  // Payment details
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }),

  // UI options: 'pending' (Pendiente) | 'paid' (Pagado) | 'partial' (Parcial) | 'late' (Atrasado) | 'unpaid' (Impagado) | 'cancelled' (Cancelado, set when the lease ends and the row was future-dated)
  status: varchar("status", { length: 20 }).notNull().default("pending"),

  // UI options: 'transfer' (Transferencia) | 'domiciliation' (Domiciliación) | 'cash' (Efectivo) | 'check' (Cheque)
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentReference: varchar("payment_reference", { length: 100 }),

  // Late payment tracking
  daysLate: smallint("days_late"),
  lateFee: decimal("late_fee", { precision: 12, scale: 2 }),

  notes: text("notes"),

  // OCR receipt data — stores extracted receipt details when a payment is matched
  // (auto-applied or pending review). Allows comparing what was detected vs expected.
  receiptData: jsonb("receipt_data"),

  // Rent collection sequence log — tracks which reminder steps have been sent.
  // Shape: Array<{ step: string; sentAt: string; messageId?: string; error?: string }>
  reminderLog: jsonb("reminder_log"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // 'rent' (monthly alquiler) | 'utility_bundle' (flat utilities cuota when
  // lease.utilitiesMode='flat_with_caps'). Default 'rent'; lets us reuse the
  // same table for both row kinds.
  paymentType: varchar("payment_type", { length: 20 })
    .notNull()
    .default("rent"),
  // Recibo emission state. Source of truth — accounting_invoices.recibo_*
  // mirrors these for head-lease leases during the transition (will be
  // dropped in a follow-up migration).
  reciboNumber: varchar("recibo_number", { length: 64 }),
  reciboPdfUrl: varchar("recibo_pdf_url", { length: 2048 }),
  reciboSentAt: timestamp("recibo_sent_at"),
  reciboEmailMessageId: varchar("recibo_email_message_id", { length: 255 }),
  // Silk Pay direct-card-collection identity (see silk_payments for the charge
  // ledger). silk_status mirrors the Silk enum and is kept SEPARATE from `status`
  // (the Vesta enum) — they drift if merged. NULL until the tenant pays by card.
  silkPaymentRequestId: varchar("silk_payment_request_id", { length: 128 }),
  silkPaymentUrl: varchar("silk_payment_url", { length: 2048 }),
  silkStatus: varchar("silk_status", { length: 20 }), // pending | received | error | refunded
  // Bank auto-matching (CaixaBank PSD2 integration)
  bankTransactionId: bigint("bank_transaction_id", { mode: "bigint" }), // FK → bank_transactions.transaction_id
  bankReference: varchar("bank_reference", { length: 255 }),
  autoMatchedAt: timestamp("auto_matched_at"),
  // Confidence: "high" | "medium" | "low"
  matchConfidence: varchar("match_confidence", { length: 20 }),
  // Stripe integration
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", {
    length: 255,
  }),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
});

// Incidents table - Track rental incidents and maintenance
export const incidents = pgTable("incidents", {
  incidentId: bigserial("incident_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  leaseId: bigint("lease_id", { mode: "bigint" }), // FK → leases.lease_id (nullable for property-level incidents)
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id

  // Incident details
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  // UI options: 'maintenance' (Mantenimiento) | 'payment' (Pago) | 'noise' (Ruido) | 'damage' (Daño) | 'contract_violation' (Incumplimiento) | 'other' (Otro)
  category: varchar("category", { length: 50 }).notNull(),
  // UI options: 'low' (Baja) | 'medium' (Media) | 'high' (Alta) | 'urgent' (Urgente)
  priority: varchar("priority", { length: 20 }).default("medium"),
  // UI options: 'open' (Abierta) | 'comunicado' (Comunicado) | 'in_progress' (En progreso) | 'resolved' (Resuelta) | 'closed' (Cerrada)
  status: varchar("status", { length: 20 }).default("open"),

  // UI options: 'tenant' (Inquilino) | 'owner' (Propietario) | 'agent' (Agente) | 'neighbor' (Vecino)
  reportedBy: varchar("reported_by", { length: 50 }),
  reporterContactId: bigint("reporter_contact_id", { mode: "bigint" }), // FK → contacts.contact_id

  // Resolution
  assignedToUserId: varchar("assigned_to_user_id", { length: 36 }), // FK → users.id
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  costEstimate: decimal("cost_estimate", { precision: 12, scale: 2 }),
  finalCost: decimal("final_cost", { precision: 12, scale: 2 }),
  // UI options: 'owner' (Propietario) | 'tenant' (Inquilino) | 'insurance' (Seguro) | 'shared' (Compartido)
  paidBy: varchar("paid_by", { length: 20 }),

  // AI automation
  incidentConversationId: bigint("incident_conversation_id", {
    mode: "bigint",
  }), // FK → incident_conversations.id
  aiGenerated: boolean("ai_generated").default(false),
  mediaUrls: jsonb("media_urls").default([]).$type<string[]>(), // Photos/media collected from tenant

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Listing utilities configuration - Define which utilities exist for a listing
export const listingUtilities = pgTable("listing_utilities", {
  utilityId: bigserial("utility_id", { mode: "bigint" }).primaryKey(),
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // UI options: 'electricity' (Electricidad) | 'water' (Agua) | 'gas' (Gas) | 'internet' (Internet) | 'comunidad' (Comunidad) | 'garbage' (Basura) | 'heating' (Calefacción) | 'cleaning' (Limpieza)
  utilityType: varchar("utility_type", { length: 30 }).notNull(),

  // Is this utility included in the rent price?
  includedInRent: boolean("included_in_rent").default(false).notNull(),

  // TRUE when the cost doesn't vary period-to-period (e.g. internet 39,90 €/mes,
  // comunidad 80 €/mes). estimations.default is then the exact amount rather
  // than a guess; used for confident gastos prediction and (later) auto-billing.
  isFixedCost: boolean("is_fixed_cost").default(false).notNull(),

  // Only relevant when NOT included in rent
  // UI options: 'landlord_bills_tenant' (Propietario factura al inquilino) | 'tenant_direct' (Inquilino paga directamente)
  paymentResponsibility: varchar("payment_responsibility", { length: 30 }),

  providerName: varchar("provider_name", { length: 100 }),
  serviceProviderId: bigint("service_provider_id", { mode: "bigint" }), // FK → service_providers.service_provider_id (optional, when "Compañía" is a registered provider like a cleaner)
  vendorContactId: bigint("vendor_contact_id", { mode: "bigint" }), // FK → contacts.contact_id (links to fiscal vendor for contabilidad)
  contractNumber: varchar("contract_number", { length: 50 }), // Utility contract/account number (e.g., Iberdrola contract)
  // Month-by-month estimations: { "default": 45.00, "2025-01": 48.00, "2025-02": 52.00 }
  estimations: jsonb("estimations").default({}),
  // UI options: 'monthly' (Mensual) | 'bimonthly' (Bimestral) | 'quarterly' (Trimestral) | 'annual' (Anual)
  paymentFrequency: varchar("payment_frequency", { length: 20 }),

  // Monthly €-cap before overage is split among tenants (e.g., 40€ for luz,
  // 80€ for gas in a habitación contract). NULL = no cap.
  overageThresholdMonthly: decimal("overage_threshold_monthly", {
    precision: 12,
    scale: 2,
  }),
  // Cadence for service-type utilities like cleaning.
  // UI options: 'weekly' | 'biweekly' | '2x_month' | 'monthly'
  serviceFrequency: varchar("service_frequency", { length: 32 }),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Utility payments - Track individual utility bill payments
// leaseId may be NULL for landlord-borne rows (vacancy share when split mode
// is equal_all_rooms or by_m2). borneBy = 'landlord' in that case.
export const utilityPayments = pgTable("utility_payments", {
  paymentId: bigserial("payment_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  listingId: bigint("listing_id", { mode: "bigint" }).notNull(), // FK → listings.listing_id
  leaseId: bigint("lease_id", { mode: "bigint" }), // FK → leases.lease_id (NULL for landlord-borne rows)
  utilityId: bigint("utility_id", { mode: "bigint" }).notNull(), // FK → listing_utilities.utility_id
  // UI options: 'tenant' | 'landlord'
  borneBy: varchar("borne_by", { length: 20 }).notNull().default("tenant"),

  // Billing period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidDate: timestamp("paid_date"),

  // Amounts
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }),

  // UI options: 'pending' (Pendiente) | 'paid' (Pagado) | 'partial' (Parcial) | 'late' (Atrasado) | 'unpaid' (Impagado)
  status: varchar("status", { length: 20 }).default("pending").notNull(),

  // UI options: 'transfer' (Transferencia) | 'domiciliation' (Domiciliación) | 'cash' (Efectivo) | 'check' (Cheque)
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentReference: varchar("payment_reference", { length: 100 }),
  daysLate: smallint("days_late"),
  notes: text("notes"),

  // OCR receipt data — stores extracted receipt details when a tenant uploads
  // a justificante from the public portal. Mirrors rent_payments.receipt_data
  // so the same dedupe + review-queue logic works for utilities.
  receiptData: jsonb("receipt_data"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Cap-aware splitter trace (Plan B). Populated only on tenant rows whose
  // lease was in flat_with_caps mode at registration time AND whose bundle
  // covers this bill's utility type. Shape:
  //   { prorataShare, coveredByBundle, excedente, capAllowance, source: "flat_with_caps" }
  // NULL on simple-mode rows, landlord rows, and historical rows.
  coverageBreakdown: jsonb("coverage_breakdown"),
  // Silk Pay direct-card-collection identity (mirror of rent_payments). Silk
  // `type` for these rows is always 'supplies'. silk_status kept separate from
  // `status`. NULL until the tenant pays by card.
  silkPaymentRequestId: varchar("silk_payment_request_id", { length: 128 }),
  silkPaymentUrl: varchar("silk_payment_url", { length: 2048 }),
  silkStatus: varchar("silk_status", { length: 20 }), // pending | received | error | refunded
});

// Rental Management Agreements - Contract between the agency (Vesta user)
// and the landlord for a property. Three business models:
//   'fee_based'     → agency charges % of rent collected (gestión)
//   'head_lease'    → agency pays landlord a flat monthly amount and sublets
//   'owner_managed' → the account itself owns the property; no third-party
//                     landlord. management_fee_pct, head_lease_payment_monthly
//                     and landlord_contact_id are all null in this case.
// Only one active agreement per property at a time (enforced by a partial
// unique index in the migration).
export const rentalManagementAgreements = pgTable(
  "rental_management_agreements",
  {
    agreementId: bigserial("agreement_id", { mode: "bigint" }).primaryKey(),
    accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
    propertyId: bigint("property_id", { mode: "bigint" }).notNull(), // FK → properties.property_id
    listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (optional)

    // UI options: 'fee_based' (Gestión con comisión) | 'head_lease' (Arrendamiento operativo) | 'owner_managed' (Propiedad propia)
    model: varchar("model", { length: 20 }).notNull(),

    managementFeePct: decimal("management_fee_pct", { precision: 5, scale: 2 }), // % retained by agency (fee_based)
    headLeasePaymentMonthly: decimal("head_lease_payment_monthly", {
      precision: 12,
      scale: 2,
    }), // €/mes agency pays landlord (head_lease)

    startDate: date("start_date", { mode: "date" }).notNull(),
    endDate: date("end_date", { mode: "date" }), // null = open-ended

    landlordContactId: bigint("landlord_contact_id", { mode: "bigint" }), // FK → contacts.contact_id
    documentId: bigint("document_id", { mode: "bigint" }), // FK → documents.doc_id (optional signed contract)

    isActive: boolean("is_active").default(true).notNull(),
    notes: text("notes"),

    createdBy: varchar("created_by", { length: 36 }).notNull(), // FK → users.id
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

// Property Expense Events - One-off / ad-hoc expenses tied to a property
// (repairs, renovations, legal, etc.). Complements utility_payments &
// rent_payments for transactional money flows; recurring fixed costs
// (mortgage, IBI, community_fees, home_insurance) live as columns on
// properties.
export const propertyExpenseEvents = pgTable("property_expense_events", {
  eventId: bigserial("event_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  propertyId: bigint("property_id", { mode: "bigint" }).notNull(), // FK → properties.property_id
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id (optional: scope to a specific listing)
  leaseId: bigint("lease_id", { mode: "bigint" }), // FK → leases.lease_id (optional: attribute to a specific tenancy)

  // UI options: 'maintenance' (Mantenimiento) | 'repair' (Reparación) | 'legal' (Legal) | 'renovation' (Reforma) | 'insurance' (Seguro) | 'tax' (Impuesto) | 'other' (Otro)
  category: varchar("category", { length: 30 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  occurredOn: date("occurred_on", { mode: "date" }).notNull(),
  description: text("description"),
  vendorName: varchar("vendor_name", { length: 200 }),
  vendorContactId: bigint("vendor_contact_id", { mode: "bigint" }), // FK → contacts.contact_id (links to fiscal vendor for contabilidad)
  invoiceDocumentId: bigint("invoice_document_id", { mode: "bigint" }), // FK → documents.doc_id (optional)

  // When true, agency absorbs the cost (head-lease / property management
  // contracts); default false = landlord pays. Affects P&L attribution.
  isAgencyResponsible: boolean("is_agency_responsible")
    .default(false)
    .notNull(),

  createdBy: varchar("created_by", { length: 36 }).notNull(), // FK → users.id
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================
// DocuSign Integration Tables
// ============================================

// DocuSign Envelopes - Track documents sent for signature
export const docusignEnvelopes = pgTable("docusign_envelopes", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),

  // DocuSign envelope ID (from DocuSign API)
  envelopeId: varchar("envelope_id", { length: 64 }).notNull().unique(),

  // Vesta entity relationships (polymorphic - typically only one is set)
  propertyId: bigint("property_id", { mode: "bigint" }), // FK → properties.property_id
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id
  dealId: bigint("deal_id", { mode: "bigint" }), // FK → deals.deal_id
  roomId: bigint("room_id", { mode: "bigint" }), // FK → rooms.room_id (for room rentals)

  // Envelope metadata
  // Values: 'contrato-arras' | 'contrato-alquiler' | 'hoja-encargo' | etc.
  documentType: varchar("document_type", { length: 64 }).notNull(),
  emailSubject: varchar("email_subject", { length: 512 }),
  // Values: 'created' | 'sent' | 'delivered' | 'signed' | 'completed' | 'declined' | 'voided'
  status: varchar("status", { length: 20 }).default("created").notNull(),

  // Source document info
  sourceDocumentId: bigint("source_document_id", { mode: "bigint" }), // FK → documents.doc_id
  sourceDocumentUrl: varchar("source_document_url", { length: 2048 }),

  // Signed document info (populated after completion)
  signedDocumentId: bigint("signed_document_id", { mode: "bigint" }), // FK → documents.doc_id
  signedDocumentUrl: varchar("signed_document_url", { length: 2048 }),

  // Timestamps from DocuSign
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  completedAt: timestamp("completed_at"),
  declinedAt: timestamp("declined_at"),
  voidedAt: timestamp("voided_at"),
  expiresAt: timestamp("expires_at"),

  // Audit fields
  createdBy: varchar("created_by", { length: 255 }).notNull(), // userId who initiated
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// DocuSign Recipients - Track signers for each envelope
export const docusignRecipients = pgTable("docusign_recipients", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),

  // Envelope reference
  envelopeDbId: bigint("envelope_db_id", { mode: "bigint" }).notNull(), // FK → docusign_envelopes.id
  envelopeId: varchar("envelope_id", { length: 64 }).notNull(), // DocuSign envelope ID (denormalized for queries)

  // DocuSign recipient info
  recipientId: varchar("recipient_id", { length: 64 }).notNull(), // DocuSign recipient ID ("1", "2", etc.)
  clientUserId: varchar("client_user_id", { length: 255 }), // For embedded signing (null = remote signing)

  // Signer info
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  // Values: 'owner' (Propietario) | 'buyer' (Comprador) | 'tenant' (Inquilino) | 'agent' (Agente) | 'witness' (Testigo)
  role: varchar("role", { length: 64 }),

  // Vesta contact reference (if signer is a known contact)
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id

  // Signing order (for sequential signing)
  routingOrder: smallint("routing_order").default(1),

  // Values: 'created' | 'sent' | 'delivered' | 'signed' | 'completed' | 'declined'
  status: varchar("status", { length: 20 }).default("created").notNull(),
  signedAt: timestamp("signed_at"),
  declinedAt: timestamp("declined_at"),
  declineReason: text("decline_reason"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// DocuSign Webhook Events - Log all webhook events for debugging and replay
export const docusignWebhookEvents = pgTable("docusign_webhook_events", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),

  // Event info
  envelopeId: varchar("envelope_id", { length: 64 }).notNull(),
  // Values: 'envelope-sent' | 'envelope-completed' | 'envelope-declined' | 'envelope-voided' | 'recipient-signed' | etc.
  eventType: varchar("event_type", { length: 64 }).notNull(),
  eventTimestamp: timestamp("event_timestamp").notNull(),

  // Raw payload (for debugging/replay)
  payload: text("payload"),

  // Processing status
  processed: boolean("processed").default(false),
  processedAt: timestamp("processed_at"),
  processingError: text("processing_error"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============================================
// Service Providers (for incident management)
// ============================================

// Service Providers table - External professionals for incident resolution
export const serviceProviders = pgTable("service_providers", {
  serviceProviderId: bigserial("service_provider_id", {
    mode: "bigint",
  }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // Provider info
  name: varchar("name", { length: 200 }).notNull(), // Company/provider name
  contactName: varchar("contact_name", { length: 200 }), // Contact person
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),

  // UI options: 'plumber' (Fontanero) | 'electrician' (Electricista) | 'carpenter' (Carpintero) | 'cleaner' (Limpieza) | 'insurance' (Seguro) | 'locksmith' (Cerrajero) | 'hvac' (Climatización) | 'painter' (Pintor) | 'general' (General) | 'other' (Otro)
  category: varchar("category", { length: 50 }).notNull(),

  // Service area (cities/zones where they operate)
  serviceArea: text("service_area"), // Comma-separated or JSON array

  address: text("address"),
  notes: text("notes"),

  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Incident Notifications table - Track notifications sent to service providers
export const incidentNotifications = pgTable("incident_notifications", {
  notificationId: bigserial("notification_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  incidentId: bigint("incident_id", { mode: "bigint" }).notNull(), // FK → incidents.incident_id
  serviceProviderId: bigint("service_provider_id", {
    mode: "bigint",
  }).notNull(), // FK → service_providers.service_provider_id

  // Notification details
  notifiedAt: timestamp("notified_at").defaultNow().notNull(),
  notifiedByUserId: varchar("notified_by_user_id", { length: 36 }).notNull(), // FK → users.id

  // UI options: 'phone' (Teléfono) | 'email' (Email) | 'whatsapp' (WhatsApp) | 'in_person' (En persona)
  notificationMethod: varchar("notification_method", { length: 20 }).notNull(),

  // Response tracking
  // Values: 'pending' | 'accepted' | 'declined' | 'no_response'
  responseStatus: varchar("response_status", { length: 20 })
    .default("pending")
    .notNull(),
  responseAt: timestamp("response_at"),
  quotedPrice: decimal("quoted_price", { precision: 12, scale: 2 }),

  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================================================================
// STRIPE INTEGRATION TABLES
// =============================================================================

// Stripe Customers - Link Vesta contacts to Stripe customers
export const stripeCustomers = pgTable("stripe_customers", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),

  // Vesta references
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (nullable)

  // Stripe identifiers
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 })
    .notNull()
    .unique(),

  // Customer details (synced from Stripe)
  email: varchar("email", { length: 255 }),
  name: varchar("name", { length: 255 }),

  // Billing address (collected during Stripe Checkout)
  billingLine1: varchar("billing_line1", { length: 255 }),
  billingCity: varchar("billing_city", { length: 100 }),
  billingPostalCode: varchar("billing_postal_code", { length: 20 }),
  billingCountry: varchar("billing_country", { length: 2 }),

  // Tax ID / CIF collected during checkout
  taxId: varchar("tax_id", { length: 50 }),

  // Default payment method
  defaultPaymentMethodId: varchar("default_payment_method_id", { length: 255 }),

  // Metadata
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stripe Subscriptions - Track recurring payment subscriptions
export const stripeSubscriptions = pgTable("stripe_subscriptions", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),

  // Relations
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  stripeCustomerId: bigint("stripe_customer_id", { mode: "bigint" }).notNull(), // FK → stripe_customers.id
  leaseId: bigint("lease_id", { mode: "bigint" }), // FK → leases.lease_id (for rent subscriptions)

  // Stripe identifiers
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 })
    .notNull()
    .unique(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  stripeProductId: varchar("stripe_product_id", { length: 255 }),

  // Values: 'active' | 'past_due' | 'unpaid' | 'canceled' | 'incomplete' | 'trialing' | 'paused'
  status: varchar("status", { length: 50 }).notNull(),

  // Billing period
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),

  // Cancellation
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  cancelAt: timestamp("cancel_at"), // Scheduled cancellation date
  canceledAt: timestamp("canceled_at"),

  // Trial
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),

  // Amount
  amount: decimal("amount", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("eur"),
  // Values: 'month' | 'year'
  interval: varchar("interval", { length: 20 }),

  // Metadata
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Per-extra-user add-on item (seats beyond the plan's included allowance),
  // billed by quantity on this same subscription. Null when no extra seats.
  stripeExtraUserItemId: varchar("stripe_extra_user_item_id", { length: 255 }),
  extraUserQuantity: integer("extra_user_quantity").default(0),
});

// Stripe Payments - Track individual payments and checkout sessions
export const stripePayments = pgTable("stripe_payments", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),

  // Relations
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  stripeCustomerId: bigint("stripe_customer_id", { mode: "bigint" }), // FK → stripe_customers.id
  rentPaymentId: bigint("rent_payment_id", { mode: "bigint" }), // FK → rent_payments.payment_id

  // Stripe identifiers
  stripePaymentIntentId: varchar("stripe_payment_intent_id", {
    length: 255,
  }).unique(),
  stripeCheckoutSessionId: varchar("stripe_checkout_session_id", {
    length: 255,
  }).unique(),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),

  // Payment details
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("eur"),
  // Values: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled' | 'requires_action'
  status: varchar("status", { length: 50 }).notNull(),
  description: text("description"),

  // Payment method info
  // Values: 'card' | 'sepa_debit'
  paymentMethodType: varchar("payment_method_type", { length: 50 }),
  paymentMethodLast4: varchar("payment_method_last4", { length: 4 }),
  // Values: 'visa' | 'mastercard' | 'amex' | etc.
  paymentMethodBrand: varchar("payment_method_brand", { length: 50 }),

  // Receipt
  receiptUrl: text("receipt_url"),
  receiptEmail: varchar("receipt_email", { length: 255 }),

  // Error handling
  failureCode: varchar("failure_code", { length: 100 }),
  failureMessage: text("failure_message"),

  // Raw webhook data (for debugging)
  rawWebhookData: jsonb("raw_webhook_data"),

  // Metadata
  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Stripe processed events — used to deduplicate webhook deliveries.
// Stripe guarantees at-least-once delivery; we insert event.id here before
// processing and skip if it already exists (onConflictDoNothing).
export const stripeEvents = pgTable("stripe_events", {
  eventId: varchar("event_id", { length: 255 }).primaryKey(), // Stripe event id (evt_...)
  type: varchar("type", { length: 100 }).notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
});

// External Listings table - Properties found on portals via email alerts
export const externalListings = pgTable("external_listings", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  prospectId: bigint("prospect_id", { mode: "bigint" }), // FK → prospects.prospect_id (nullable)

  // Portal info
  // Values: 'idealista' | 'fotocasa'
  portal: varchar("portal", { length: 30 }).notNull(),
  externalUrl: varchar("external_url", { length: 1024 }).notNull(),
  externalId: varchar("external_id", { length: 100 }).notNull(), // Unique ID per portal+account

  // Data from email parsing
  title: varchar("title", { length: 500 }),
  price: integer("price"),
  priceText: varchar("price_text", { length: 50 }),
  location: varchar("location", { length: 500 }),
  city: varchar("city", { length: 200 }),
  neighborhood: varchar("neighborhood", { length: 200 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  propertyType: varchar("property_type", { length: 50 }),
  listingType: varchar("listing_type", { length: 20 }), // 'Sale' | 'Rent'
  bedrooms: smallint("bedrooms"),
  bathrooms: smallint("bathrooms"),
  squareMeters: integer("square_meters"),
  floor: varchar("floor", { length: 50 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 1024 }),
  description: text("description"),

  // Data from scraping (Phase 4)
  fullDescription: text("full_description"),
  images: jsonb("images"), // Array of image URLs
  contactName: varchar("contact_name", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  agencyName: varchar("agency_name", { length: 255 }),
  scrapedData: jsonb("scraped_data"), // Full scraped data blob
  scrapedAt: timestamp("scraped_at"),

  // Workflow
  matchScore: smallint("match_score"), // 0-100
  // Values: 'new' | 'viewed' | 'interesting' | 'contacted' | 'dismissed'
  status: varchar("status", { length: 30 }).default("new").notNull(),
  agentNotes: text("agent_notes"),
  viewedAt: timestamp("viewed_at"),
  contactedAt: timestamp("contacted_at"),
  dismissedAt: timestamp("dismissed_at"),

  // Source
  gmailMessageId: varchar("gmail_message_id", { length: 100 }),
  gmailThreadId: varchar("gmail_thread_id", { length: 100 }),
  listedAt: timestamp("listed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Captacion Listings table (dedicated for zone-based property sourcing from Residelia)
// Separated from external_listings which handles prospect portal alerts
export const captacionListings = pgTable("captacion_listings", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (linked when "selected")

  // Source info
  portal: varchar("portal", { length: 30 }).notNull(), // 'residelia' | 'idealista' | 'fotocasa'
  externalId: varchar("external_id", { length: 100 }).notNull(),
  externalUrl: varchar("external_url", { length: 1024 }).notNull(),
  portalUrl: varchar("portal_url", { length: 1024 }),

  // Zone tracking
  zoneId: varchar("zone_id", { length: 100 }).notNull(),
  searchedAt: timestamp("searched_at").defaultNow().notNull(),

  // Property data
  title: varchar("title", { length: 500 }),
  price: integer("price"),
  location: varchar("location", { length: 500 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  propertyType: varchar("property_type", { length: 50 }),
  bedrooms: smallint("bedrooms"),
  bathrooms: smallint("bathrooms"),
  squareMeters: integer("square_meters"),
  floor: varchar("floor", { length: 50 }),
  thumbnailUrl: varchar("thumbnail_url", { length: 1024 }),
  description: text("description"),

  // Residelia-specific fields
  sqmPrice: integer("sqm_price"),
  priceDrop: boolean("price_drop"),
  subtype: varchar("subtype", { length: 50 }),
  constructionYear: smallint("construction_year"),
  lift: boolean("lift"),
  parking: boolean("parking"),
  terrace: boolean("terrace"),
  garden: boolean("garden"),
  pool: boolean("pool"),
  boxroom: boolean("boxroom"),
  locationVisible: boolean("location_visible"),
  lastUpdate: timestamp("last_update"),
  expiredOn: timestamp("expired_on"),
  isExpired: boolean("is_expired"),

  // Contact info (from portal listing)
  contactName: varchar("contact_name", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactType: varchar("contact_type", { length: 30 }), // 'private' | 'professional'

  // Full scraped data blob
  scrapedData: jsonb("scraped_data"),

  // Workflow
  // Values: 'new' | 'viewed' | 'interesting' | 'contacted' | 'dismissed'
  status: varchar("status", { length: 30 }).default("new").notNull(),
  agentNotes: text("agent_notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  publishedAt: timestamp("published_at"),
  lastSeenAt: timestamp("last_seen_at"),
});

// Call Suggested Actions table (AI-generated actionable suggestions from call transcriptions)
export const callSuggestedActions = pgTable("call_suggested_actions", {
  actionId: bigserial("action_id", { mode: "bigint" }).primaryKey(),
  callId: bigint("call_id", { mode: "bigint" }).notNull(), // FK → call_records.call_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  contactId: bigint("contact_id", { mode: "bigint" }), // FK → contacts.contact_id (for context)

  // Action definition
  // Values: 'create_task' | 'create_appointment' | 'send_email' | 'update_contact'
  actionType: varchar("action_type", { length: 30 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // Values: 'low' | 'medium' | 'high'
  priority: varchar("priority", { length: 10 }).default("medium"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00–1.00

  // Action-specific parameters (discriminated union JSON)
  params: jsonb("params").notNull(),

  // Lifecycle
  // Values: 'pending' | 'approved' | 'dismissed' | 'executed' | 'failed'
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  executionResult: jsonb("execution_result"), // Result or error from execution
  dismissReason: varchar("dismiss_reason", { length: 255 }),

  // Timestamps
  executedAt: timestamp("executed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// SSO Tokens table - Short-lived, single-use tokens for vestapicture.com authentication
export const ssoTokens = pgTable("sso_tokens", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  token: varchar("token", { length: 64 }).notNull().unique(),
  redirectPath: varchar("redirect_path", { length: 500 }),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

// AI Chat Sessions — persisted conversations with Vesta AI
export const aiChats = pgTable("ai_chats", {
  id: varchar("id", { length: 36 }).primaryKey(), // nanoid generated client-side
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  title: varchar("title", { length: 255 }),
  messages: jsonb("messages").notNull().default([]),
  /** 'web' (default) | 'whatsapp' | 'telegram' — surface that owns this chat */
  source: varchar("source", { length: 20 }).notNull().default("web"),
  isDeleted: boolean("is_deleted").default(false).notNull(), // Soft delete — keeps row for AI message counting
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Document Templates — reusable TipTap document templates with variable tokens
export const documentTemplates = pgTable("document_templates", {
  templateId: bigserial("template_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull(),
  description: text("description"),
  // Values: 'arras' | 'nota_encargo' | 'arrendamiento' | 'visita' | 'otros'
  category: varchar("category", { length: 50 }).notNull().default("otros"),
  content: jsonb("content").notNull(), // TipTap JSON with variableToken nodes
  variables: jsonb("variables").notNull().default([]), // Extracted list of variable keys used
  headerConfig: jsonb("header_config").default({ enabled: false }), // { enabled: boolean } — show agency header in PDF
  signatureConfig: jsonb("signature_config").default({
    enabled: false,
    signers: [],
  }), // { enabled: boolean, signers: { label: string }[] }
  version: integer("version").notNull().default(1),
  isSystem: boolean("is_system").default(false).notNull(), // System-provided templates (non-deletable)
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: varchar("created_by", { length: 36 }), // FK → users.id
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================================================================
// INCIDENT AUTOMATION TABLES
// =============================================================================

// Incident Conversations — AI automation state machine for tenant incident reports
export const incidentConversations = pgTable("incident_conversations", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id (agent identity for sending)

  // Source channel (exactly one set)
  whatsappConversationId: bigint("whatsapp_conversation_id", {
    mode: "bigint",
  }), // FK → whatsapp_conversations.conversation_id
  emailThreadId: bigint("email_thread_id", { mode: "bigint" }), // FK → email_threads.thread_id

  // Resolved tenant context
  contactId: bigint("contact_id", { mode: "bigint" }).notNull(), // FK → contacts.contact_id
  leaseId: bigint("lease_id", { mode: "bigint" }), // FK → leases.lease_id
  listingId: bigint("listing_id", { mode: "bigint" }), // FK → listings.listing_id

  // State machine phase
  // Values: 'classified' | 'gathering_info' | 'info_complete' | 'diagnosed' | 'awaiting_approval' | 'executing' | 'completed' | 'cancelled'
  phase: varchar("phase", { length: 30 }).notNull().default("classified"),

  // Classification
  // Values: 'incidencia' | 'solicitud_info' | 'pago' | 'general'
  messageClassification: varchar("message_classification", { length: 30 }),
  classificationConfidence: decimal("classification_confidence", {
    precision: 3,
    scale: 2,
  }),

  // Gathering info state
  questionsAsked: integer("questions_asked").default(0).notNull(),
  maxQuestions: integer("max_questions").default(3).notNull(),
  hasPhotos: boolean("has_photos").default(false).notNull(),
  hasSufficientInfo: boolean("has_sufficient_info").default(false).notNull(),
  gatheringSummary: text("gathering_summary"),

  // Resolution
  incidentId: bigint("incident_id", { mode: "bigint" }), // FK → incidents.incident_id (set when auto-created)
  aiDiagnosisReport: text("ai_diagnosis_report"), // Markdown report

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Incident Suggested Actions — AI-proposed actions for admin approval
export const incidentSuggestedActions = pgTable("incident_suggested_actions", {
  actionId: bigserial("action_id", { mode: "bigint" }).primaryKey(),
  incidentConversationId: bigint("incident_conversation_id", {
    mode: "bigint",
  }).notNull(), // FK → incident_conversations.id
  incidentId: bigint("incident_id", { mode: "bigint" }), // FK → incidents.incident_id
  userId: varchar("user_id", { length: 36 }).notNull(), // FK → users.id

  // Action definition
  // Values: 'notify_provider' | 'notify_insurance' | 'notify_tenant' | 'notify_owner' | 'send_quote_request'
  actionType: varchar("action_type", { length: 30 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  // Values: 'low' | 'medium' | 'high' | 'urgent'
  priority: varchar("priority", { length: 10 }).default("medium"),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),

  // Action-specific parameters (JSON with provider details, message draft, photos, method)
  params: jsonb("params").notNull(),

  // Lifecycle
  // Values: 'pending' | 'approved' | 'dismissed' | 'executed' | 'failed'
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  executedAt: timestamp("executed_at"),
  executionResult: jsonb("execution_result"),
  dismissReason: varchar("dismiss_reason", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Collaboration Groups — trusted partner agencies that share more property details
export const collaborationGroups = pgTable("collaboration_groups", {
  groupId: bigserial("group_id", { mode: "bigint" }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdByAccountId: bigint("created_by_account_id", {
    mode: "bigint",
  }).notNull(), // FK → accounts
  isActive: boolean("is_active").default(true).notNull(),
  commissionAgreement: jsonb("commission_agreement"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Collaboration Group Members — accounts belonging to a collaboration group
export const collaborationGroupMembers = pgTable(
  "collaboration_group_members",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    groupId: bigint("group_id", { mode: "bigint" }).notNull(), // FK → collaboration_groups
    accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts
    // Values: 'pending' | 'active' | 'declined' | 'removed'
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    // Values: 'creator' | 'admin' | 'member'
    role: varchar("role", { length: 20 }).default("member").notNull(),
    invitedByAccountId: bigint("invited_by_account_id", {
      mode: "bigint",
    }).notNull(),
    joinedAt: timestamp("joined_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
);

// AI Usage Events — tracks non-chat AI calls (description gen, document review, etc.)
// Each row = 1 "message" toward the monthly AI quota
export const aiUsageEvents = pgTable("ai_usage_events", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  feature: varchar("feature", { length: 50 }).notNull(), // 'description_gen' | 'document_review' | 'tenant_evaluation' | 'description_analysis'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  model: varchar("model", { length: 100 }),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  cacheCreationTokens: integer("cache_creation_tokens"),
  cacheReadTokens: integer("cache_read_tokens"),
  costUsd: decimal("cost_usd", { precision: 10, scale: 6 }),
});

// =============================================================================
// WHATSAPP AI BOT — per-account Meta Cloud API credentials + user phone links
// See migration 0019_whatsapp_ai_bot.sql and src/server/whatsapp/vesta-ai/.
// =============================================================================

export const accountWhatsappAiConfigs = pgTable("account_whatsapp_ai_configs", {
  configId: bigserial("config_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(),
  phoneNumberId: varchar("phone_number_id", { length: 32 }).notNull().unique(),
  displayPhone: varchar("display_phone", { length: 20 }).notNull(),
  wabaId: varchar("waba_id", { length: 32 }),
  accessTokenCt: text("access_token_ct").notNull(),
  accessTokenIv: varchar("access_token_iv", { length: 32 }).notNull(),
  verifyToken: varchar("verify_token", { length: 64 }).notNull(),
  appSecretCt: text("app_secret_ct"),
  appSecretIv: varchar("app_secret_iv", { length: 32 }),
  isActive: boolean("is_active").notNull().default(true),
  connectedAt: timestamp("connected_at").defaultNow().notNull(),
  connectedBy: varchar("connected_by", { length: 36 }),
  // Health tracking — populated from webhook auto-deactivate and admin smoke
  // tests. Nullable: never-errored configs stay clean.
  lastErrorAt: timestamp("last_error_at"),
  lastErrorKind: varchar("last_error_kind", { length: 20 }),
  lastErrorMessage: text("last_error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userWhatsappAiLinks = pgTable("user_whatsapp_ai_links", {
  linkId: bigserial("link_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(),
  userId: varchar("user_id", { length: 36 }).notNull(),
  whatsappNumber: varchar("whatsapp_number", { length: 20 }).notNull(), // E.164
  linkCode: varchar("link_code", { length: 8 }),
  linkCodeExpiresAt: timestamp("link_code_expires_at"),
  verifiedAt: timestamp("verified_at"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// =============================================================================
// WHATSAPP TEMPLATES — per-account Twilio Content API template library.
// See migration 0041_whatsapp_templates.sql and src/server/services/twilio-content-api.ts.
//
// Lifecycle: draft → pending → approved/rejected/paused → deleted.
// content_sid is null while the template is local-only (status='draft') and
// gets populated once Twilio's createContent endpoint returns. Soft-deletes
// set status='deleted' + deleted_at; rows are purged after 31 days because
// Meta reserves the friendly name for 30 days after deletion.
// =============================================================================

export const whatsappTemplates = pgTable("whatsapp_templates", {
  templateId: bigserial("template_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id
  contentSid: varchar("content_sid", { length: 64 }),
  twilioFriendlyName: varchar("twilio_friendly_name", {
    length: 128,
  }).notNull(),
  category: varchar("category", { length: 20 }).notNull(), // UTILITY | MARKETING | AUTHENTICATION
  languageCode: varchar("language_code", { length: 10 })
    .notNull()
    .default("es"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  rejectionReason: text("rejection_reason"),
  body: text("body").notNull(),
  variables: jsonb("variables").notNull().default([]),
  headerType: varchar("header_type", { length: 20 }),
  headerValue: text("header_value"),
  footer: varchar("footer", { length: 60 }),
  buttons: jsonb("buttons").default([]),
  authoredBy: varchar("authored_by", { length: 20 }).notNull().default("human"),
  aiPrompt: text("ai_prompt"),
  createdByUserId: varchar("created_by_user_id", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  lastUsedAt: timestamp("last_used_at"),
  lastSyncedAt: timestamp("last_synced_at"),
  deletedAt: timestamp("deleted_at"),
});

// ============================================
// Contabilidad (accounting) module
// ============================================

// A single concept row in a multi-concept invoice. NULL `lines` = legacy
// single-concept invoice rendered from the row-level concept/base/iva.
export interface AccountingInvoiceLine {
  concept: string;
  base: number;
  // VAT rate as a percentage (e.g. 21 for 21%); optional for exempt lines.
  iva?: number;
  quantity?: number;
}

// Unified invoice ledger — both issued (emitidas) and received (recibidas).
// Numbering and Verifactu submission are delegated to Holded; while a draft
// is unsynced, holded_document_number is NULL and the local invoice_id is
// used as the internal reference. Single-line invoices: concept/base/iva
// live on this row (no separate lines table in the thin slice).
export const accountingInvoices = pgTable("accounting_invoices", {
  invoiceId: bigserial("invoice_id", { mode: "bigint" }).primaryKey(),
  accountId: bigint("account_id", { mode: "bigint" }).notNull(), // FK → accounts.account_id

  // 'issued' (emitida) | 'received' (recibida)
  direction: varchar("direction", { length: 10 }).notNull(),

  issueDate: date("issue_date", { mode: "date" }).notNull(),
  operationDate: date("operation_date", { mode: "date" }).notNull(),

  // 'account' = the Vesta account company; 'contact' = a contact (owner, vendor, tenant)
  issuerType: varchar("issuer_type", { length: 10 }).notNull(),
  issuerContactId: bigint("issuer_contact_id", { mode: "bigint" }), // required iff issuerType='contact'
  recipientType: varchar("recipient_type", { length: 10 }).notNull(),
  recipientContactId: bigint("recipient_contact_id", { mode: "bigint" }), // required iff recipientType='contact'

  concept: text("concept").notNull(),
  // e.g. "Operación exenta art. 20.Uno.23 LIVA" for residential rent
  legalMention: text("legal_mention"),

  base: decimal("base", { precision: 12, scale: 2 }).notNull(),
  ivaRate: decimal("iva_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  ivaAmount: decimal("iva_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  retentionRate: decimal("retention_rate", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  retentionAmount: decimal("retention_amount", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),

  // 'draft' | 'issued' | 'paid' | 'cancelled'
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  pdfUrl: varchar("pdf_url", { length: 2048 }),

  // Origin refs (at most one set)
  rentPaymentId: bigint("rent_payment_id", { mode: "bigint" }), // FK → rent_payments.payment_id
  utilityPaymentId: bigint("utility_payment_id", { mode: "bigint" }), // FK → utility_payments.payment_id
  propertyExpenseEventId: bigint("property_expense_event_id", {
    mode: "bigint",
  }), // FK → property_expense_events.event_id
  managementAgreementId: bigint("management_agreement_id", { mode: "bigint" }), // FK → rental_management_agreements.agreement_id

  holdedDocumentId: varchar("holded_document_id", { length: 64 }),
  holdedDocumentNumber: varchar("holded_document_number", { length: 64 }), // legal number assigned by Holded
  // 'pending' | 'synced' | 'error'
  holdedSyncStatus: varchar("holded_sync_status", { length: 20 })
    .notNull()
    .default("pending"),
  holdedLastSyncAt: timestamp("holded_last_sync_at", { withTimezone: true }),
  holdedLastError: text("holded_last_error"),

  verifactuHash: varchar("verifactu_hash", { length: 128 }),
  verifactuQrUrl: varchar("verifactu_qr_url", { length: 2048 }),

  // Rectificative invoices: 'normal' (default) or 'rectificative' (credit note
  // that cancels/corrects rectifies_invoice_id).
  kind: varchar("kind", { length: 20 }).notNull().default("normal"),
  rectifiesInvoiceId: bigint("rectifies_invoice_id", { mode: "bigint" }), // FK → accounting_invoices.invoice_id

  createdBy: varchar("created_by", { length: 36 }).notNull(), // FK → users.id
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  // Multi-concept breakdown (honorarios + extra conceptos). NULL = legacy
  // single-concept invoice; render from `concept` / `base`.
  lines: jsonb("lines").$type<AccountingInvoiceLine[] | null>(),
  dealId: bigint("deal_id", { mode: "bigint" }), // FK → deals.deal_id (commission invoices)
  // In-house recibo emission state (separate from holded_* sync columns).
  // The PDF is rendered from a docxtemplater template + CloudConvert.
  reciboPdfUrl: varchar("recibo_pdf_url", { length: 2048 }),
  reciboNumber: varchar("recibo_number", { length: 64 }), // e.g. "BEATRIZ-2026-0001"
  reciboSentAt: timestamp("recibo_sent_at", { withTimezone: true }),
  reciboEmailMessageId: varchar("recibo_email_message_id", { length: 255 }), // Resend id for delivery audit
});
