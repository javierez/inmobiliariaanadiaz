CREATE TABLE "account_roles" (
	"account_role_id" bigserial PRIMARY KEY NOT NULL,
	"role_id" bigint NOT NULL,
	"account_id" bigint NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "account_two_factor_settings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"account_id" bigint NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"enabled_by" varchar(36),
	"enabled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "account_two_factor_settings_account_id_unique" UNIQUE("account_id")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"account_id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"short_name" varchar(50),
	"legal_name" varchar(255),
	"logo" varchar(2048),
	"address" varchar(500),
	"phone" varchar(20),
	"email" varchar(255),
	"website" varchar(255),
	"account_type" varchar(20) DEFAULT 'company',
	"tax_id" varchar(50),
	"collegiate_number" varchar(50),
	"registry_details" text,
	"legal_email" varchar(255),
	"jurisdiction" varchar(255),
	"privacy_email" varchar(255),
	"dpo_email" varchar(255),
	"portal_settings" jsonb DEFAULT '{}'::jsonb,
	"payment_settings" jsonb DEFAULT '{}'::jsonb,
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"terms" jsonb DEFAULT '{}'::jsonb,
	"onboarding_data" jsonb DEFAULT '{}'::jsonb,
	"plan" varchar(50) DEFAULT 'basic',
	"subscription_type" varchar(100),
	"subscription_status" varchar(20) DEFAULT 'active',
	"subscription_start_date" timestamp,
	"subscription_end_date" timestamp,
	"status" varchar(20) DEFAULT 'active',
	"image_token_balance" integer DEFAULT 0 NOT NULL,
	"image_tokens_used" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"appointment_id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"contact_id" bigint NOT NULL,
	"listing_id" bigint,
	"listing_contact_id" bigint,
	"deal_id" bigint,
	"prospect_id" bigint,
	"datetime_start" timestamp NOT NULL,
	"datetime_end" timestamp NOT NULL,
	"trip_time_minutes" smallint,
	"status" varchar(20) DEFAULT 'Scheduled' NOT NULL,
	"notes" text,
	"type" varchar(50),
	"assigned_to" varchar(36),
	"edited_by" varchar(36),
	"google_event_id" varchar(255),
	"google_etag" varchar(255),
	"last_synced_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cartel_configurations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar(36),
	"account_id" bigint NOT NULL,
	"property_id" bigint,
	"name" varchar(255) NOT NULL,
	"template_config" jsonb NOT NULL,
	"property_overrides" jsonb DEFAULT '{}',
	"selected_contacts" jsonb DEFAULT '{}',
	"selected_image_indices" jsonb DEFAULT '[]',
	"is_default" boolean DEFAULT false,
	"is_global" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"comment_id" bigserial PRIMARY KEY NOT NULL,
	"listing_id" bigint NOT NULL,
	"property_id" bigint NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100),
	"parent_id" bigint,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_activity" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"contact_id" bigint NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"action" varchar(50) NOT NULL,
	"details" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"contact_id" bigserial PRIMARY KEY NOT NULL,
	"account_id" bigint NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"nif" varchar(20),
	"email" varchar(255),
	"phone" varchar(20),
	"phone_notes" text,
	"secondary_phone" varchar(20),
	"secondary_phone_notes" text,
	"rating" smallint,
	"additional_info" jsonb DEFAULT '{}'::jsonb,
	"org_id" bigint,
	"source" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deal_activity" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"deal_id" bigint NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"action" varchar(50) NOT NULL,
	"details" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deal_participants" (
	"deal_id" bigint NOT NULL,
	"contact_id" bigint NOT NULL,
	"role" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"deal_id" bigserial PRIMARY KEY NOT NULL,
	"listing_id" bigint NOT NULL,
	"listing_contact_id" bigint,
	"stage" varchar(50) NOT NULL,
	"close_date" timestamp,
	"final_price" numeric(12, 2),
	"commission_percentage" numeric(5, 2),
	"commission_amount" numeric(12, 2),
	"commission_paid_date" timestamp,
	"arras_amount" numeric(12, 2),
	"arras_type" varchar(20),
	"arras_date" timestamp,
	"notary_fees" numeric(10, 2),
	"registry_fees" numeric(10, 2),
	"tax_amount" numeric(12, 2),
	"mortgage_amount" numeric(12, 2),
	"arras_signing_date" timestamp,
	"expected_deed_date" timestamp,
	"actual_deed_date" timestamp,
	"key_handover_date" timestamp,
	"financing_deadline" timestamp,
	"contingency_expiration_date" timestamp,
	"buyer_lawyer_id" bigint,
	"seller_lawyer_id" bigint,
	"notary_id" bigint,
	"notary_name" varchar(255),
	"bank_id" bigint,
	"bank_name" varchar(255),
	"listing_agent_id" varchar(36),
	"selling_agent_id" varchar(36),
	"commission_split_listing_agent" numeric(5, 2),
	"commission_split_selling_agent" numeric(5, 2),
	"financing_status" varchar(20),
	"inspection_status" varchar(20),
	"title_status" varchar(20),
	"contingencies_cleared" boolean,
	"documents_complete" boolean,
	"risk_level" varchar(20),
	"required_documents" jsonb DEFAULT '{}'::jsonb,
	"cancellation_reason" text,
	"fault_party" varchar(20),
	"arras_disposition" varchar(30),
	"cancelled_by" varchar(36),
	"cancellation_date" timestamp,
	"internal_notes" text,
	"contingency_notes" text,
	"special_conditions" text,
	"referral_source" varchar(100),
	"referral_partner_id" bigint,
	"referral_fee_percentage" numeric(5, 2),
	"referral_fee_paid" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"doc_id" bigserial PRIMARY KEY NOT NULL,
	"filename" varchar(255) NOT NULL,
	"file_type" varchar(50) NOT NULL,
	"file_url" varchar(2048) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"property_id" bigint,
	"contact_id" bigint,
	"listing_id" bigint,
	"listing_contact_id" bigint,
	"deal_id" bigint,
	"appointment_id" bigint,
	"prospect_id" bigint,
	"document_key" varchar(2048) NOT NULL,
	"s3key" varchar(2048) NOT NULL,
	"document_tag" varchar(255),
	"document_order" integer DEFAULT 0 NOT NULL,
	"document_hash" varchar(64),
	"document_timestamp" timestamp,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"feedback_id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"account_id" bigint NOT NULL,
	"feedback_comment" text NOT NULL,
	"scale" smallint NOT NULL,
	"url" varchar(2048),
	"resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fotocasa_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"timestamp" timestamp NOT NULL,
	"listing_id" bigint,
	"operation" varchar(20) NOT NULL,
	"request_data" jsonb,
	"response_data" jsonb,
	"success" boolean NOT NULL,
	"error" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_token_transactions" (
	"transaction_id" bigserial PRIMARY KEY NOT NULL,
	"account_id" bigint NOT NULL,
	"operation" varchar(50) NOT NULL,
	"tokens_changed" integer NOT NULL,
	"before_balance" integer NOT NULL,
	"after_balance" integer NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"property_image_id" bigint,
	"property_id" bigint,
	"user_id" varchar(36),
	"purchase_amount" numeric(10, 2),
	"payment_method" varchar(50),
	"payment_reference" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "listing_activity" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"listing_id" bigint NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"action" varchar(50) NOT NULL,
	"details" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_contact_activity" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"listing_contact_id" bigint NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"action" varchar(50) NOT NULL,
	"details" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_contact_comments" (
	"comment_id" bigserial PRIMARY KEY NOT NULL,
	"listing_contact_id" bigint NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100),
	"parent_id" bigint,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listing_contacts" (
	"listing_contact_id" bigserial PRIMARY KEY NOT NULL,
	"listing_id" bigint,
	"contact_id" bigint NOT NULL,
	"contact_type" varchar(20) NOT NULL,
	"prospect_id" bigint,
	"source" varchar(50),
	"status" varchar(50),
	"offer" integer,
	"offer_accepted" boolean,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"listing_id" bigserial PRIMARY KEY NOT NULL,
	"account_id" bigint NOT NULL,
	"property_id" bigint NOT NULL,
	"agent_id" varchar(36) NOT NULL,
	"listing_type" varchar(20) NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"status" varchar(20) NOT NULL,
	"prospect_status" varchar(50),
	"description" text,
	"short_description" varchar(500),
	"is_furnished" boolean,
	"furniture_quality" varchar(50),
	"optional_garage" boolean,
	"optional_garage_price" numeric(12, 2),
	"optional_storage_room" boolean DEFAULT false NOT NULL,
	"optional_storage_room_price" numeric(12, 2),
	"has_keys" boolean DEFAULT false NOT NULL,
	"encargo" boolean DEFAULT false NOT NULL,
	"student_friendly" boolean,
	"pets_allowed" boolean,
	"appliances_included" boolean,
	"internet" boolean DEFAULT false,
	"oven" boolean DEFAULT false,
	"microwave" boolean DEFAULT false,
	"washing_machine" boolean DEFAULT false,
	"secadora" boolean DEFAULT false,
	"fridge" boolean DEFAULT false,
	"tv" boolean DEFAULT false,
	"stoneware" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"is_bank_owned" boolean DEFAULT false,
	"is_opportunity" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"publish_to_website" boolean DEFAULT false,
	"visibility_mode" smallint DEFAULT 1,
	"view_count" integer DEFAULT 0,
	"inquiry_count" integer DEFAULT 0,
	"fotocasa" boolean DEFAULT false,
	"fc_location_visibility" smallint,
	"idealista" boolean DEFAULT false,
	"habitaclia" boolean DEFAULT false,
	"pisoscom" boolean DEFAULT false,
	"yaencontre" boolean DEFAULT false,
	"milanuncios" boolean DEFAULT false,
	"fotocasa_props" jsonb DEFAULT '{}'::jsonb,
	"idealista_props" jsonb DEFAULT '{}'::jsonb,
	"habitaclia_props" jsonb DEFAULT '{}'::jsonb,
	"pisoscom_props" jsonb DEFAULT '{}'::jsonb,
	"yaencontre_props" jsonb DEFAULT '{}'::jsonb,
	"milanuncios_props" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"neighborhood_id" bigserial PRIMARY KEY NOT NULL,
	"city" varchar(100) NOT NULL,
	"province" varchar(100) NOT NULL,
	"municipality" varchar(100) NOT NULL,
	"neighborhood" varchar(100) NOT NULL,
	"neighborhood_clean" varchar(100),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "mappings" (
	"source_id" bigserial PRIMARY KEY NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"mappings" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" bigserial PRIMARY KEY NOT NULL,
	"account_id" bigint NOT NULL,
	"user_id" varchar(36),
	"from_user_id" varchar(36),
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"action_url" varchar(500),
	"priority" varchar(20) DEFAULT 'normal',
	"category" varchar(50) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" bigint,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"is_dismissed" boolean DEFAULT false,
	"dismissed_at" timestamp,
	"delivery_channel" varchar(50) DEFAULT 'in_app',
	"is_delivered" boolean DEFAULT false,
	"delivered_at" timestamp,
	"delivery_error" text,
	"scheduled_for" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "offices" (
	"office_id" bigserial PRIMARY KEY NOT NULL,
	"account_id" bigint NOT NULL,
	"name" varchar(100) NOT NULL,
	"address" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"postal_code" varchar(20) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"org_id" bigserial PRIMARY KEY NOT NULL,
	"org_name" varchar(255) NOT NULL,
	"address" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"reset_code" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"ip_address" text,
	"user_agent" text
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"property_id" bigserial PRIMARY KEY NOT NULL,
	"account_id" bigint NOT NULL,
	"reference_number" varchar(32),
	"title" varchar(255),
	"description" text,
	"property_type" varchar(20) DEFAULT 'piso',
	"property_subtype" varchar(50),
	"form_position" integer DEFAULT 1 NOT NULL,
	"bedrooms" smallint,
	"bathrooms" numeric(3, 1),
	"square_meter" integer,
	"year_built" smallint,
	"cadastral_reference" varchar(255),
	"built_surface_area" numeric(10, 2),
	"conservation_status" smallint DEFAULT 1,
	"street" varchar(255),
	"address_details" varchar(255),
	"postal_code" varchar(20),
	"neighborhood_id" bigint,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"energy_certification" text,
	"energy_certificate_status" varchar(20),
	"energy_consumption_scale" varchar(2),
	"energy_consumption_value" numeric(6, 2),
	"emissions_scale" varchar(2),
	"emissions_value" numeric(6, 2),
	"has_heating" boolean DEFAULT false,
	"heating_type" varchar(50),
	"has_elevator" boolean DEFAULT false,
	"has_garage" boolean DEFAULT false,
	"has_storage_room" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true,
	"garage_type" varchar(50),
	"garage_spaces" smallint,
	"garage_in_building" boolean,
	"elevator_to_garage" boolean,
	"garage_number" varchar(20),
	"gym" boolean DEFAULT false,
	"sports_area" boolean DEFAULT false,
	"children_area" boolean DEFAULT false,
	"suite_bathroom" boolean DEFAULT false,
	"nearby_public_transport" boolean DEFAULT false,
	"community_pool" boolean DEFAULT false,
	"private_pool" boolean DEFAULT false,
	"tennis_court" boolean DEFAULT false,
	"community_area" boolean DEFAULT false,
	"disabled_accessible" boolean,
	"vpo" boolean,
	"video_intercom" boolean,
	"concierge_service" boolean,
	"security_guard" boolean,
	"satellite_dish" boolean,
	"double_glazing" boolean,
	"alarm" boolean,
	"security_door" boolean,
	"brand_new" boolean,
	"new_construction" boolean,
	"under_construction" boolean,
	"needs_renovation" boolean,
	"last_renovation_year" smallint,
	"kitchen_type" varchar(50),
	"hot_water_type" varchar(50),
	"open_kitchen" boolean,
	"french_kitchen" boolean,
	"furnished_kitchen" boolean,
	"pantry" boolean,
	"storage_room_size" integer,
	"storage_room_number" varchar(20),
	"terrace" boolean,
	"terrace_size" integer,
	"wine_cellar" boolean,
	"wine_cellar_size" integer,
	"living_room_size" integer,
	"balcony_count" smallint,
	"gallery_count" smallint,
	"building_floors" smallint,
	"built_in_wardrobes" boolean DEFAULT false,
	"main_floor_type" varchar(50),
	"shutter_type" varchar(50),
	"carpentry_type" varchar(50),
	"orientation" varchar(50),
	"air_conditioning_type" varchar(50),
	"window_type" varchar(50),
	"exterior" boolean,
	"bright" boolean,
	"views" boolean,
	"mountain_views" boolean,
	"sea_views" boolean,
	"beachfront" boolean,
	"jacuzzi" boolean,
	"hydromassage" boolean,
	"garden" boolean,
	"pool" boolean,
	"home_automation" boolean,
	"music_system" boolean,
	"laundry_room" boolean,
	"covered_clothesline" boolean,
	"fireplace" boolean,
	"sauna" boolean,
	"loading_area" boolean,
	"patio" boolean,
	"allowed_use" smallint,
	"electricity_type" varchar(50),
	"electricity_status" varchar(50),
	"plumbing_type" varchar(50),
	"plumbing_status" varchar(50),
	"scraped_text" varchar(1024)
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"property_image_id" bigserial PRIMARY KEY NOT NULL,
	"property_id" bigint NOT NULL,
	"reference_number" varchar(32) NOT NULL,
	"image_url" varchar(255) NOT NULL,
	"thumb_url" varchar(500),
	"med_url" varchar(500),
	"full_url" varchar(500),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"image_key" varchar(2048) NOT NULL,
	"image_tag" varchar(255),
	"s3key" varchar(2048) NOT NULL,
	"image_order" integer DEFAULT 0 NOT NULL,
	"origin_image_id" bigint
);
--> statement-breakpoint
CREATE TABLE "prospect_history" (
	"history_id" bigserial PRIMARY KEY NOT NULL,
	"prospect_id" bigint NOT NULL,
	"previous_status" varchar(50),
	"new_status" varchar(50) NOT NULL,
	"changed_by" varchar(36) NOT NULL,
	"change_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prospects" (
	"prospect_id" bigserial PRIMARY KEY NOT NULL,
	"contact_id" bigint NOT NULL,
	"status" varchar(50) NOT NULL,
	"listing_type" varchar(20),
	"prospect_type" varchar(20) DEFAULT 'search' NOT NULL,
	"property_type" varchar(20),
	"min_price" numeric(12, 2),
	"max_price" numeric(12, 2),
	"preferred_cities" jsonb,
	"preferred_areas" jsonb,
	"min_bedrooms" smallint,
	"min_bathrooms" smallint,
	"min_square_meters" integer,
	"max_square_meters" integer,
	"move_in_by" timestamp,
	"extras" jsonb,
	"urgency_level" smallint,
	"funding_ready" boolean,
	"notes_internal" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"role_id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" varchar(255),
	"permissions" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" varchar(36) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"task_id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"due_date" timestamp,
	"due_time" time,
	"completed" boolean DEFAULT false,
	"created_by" varchar(36),
	"completed_by" varchar(36),
	"edited_by" varchar(36),
	"category" varchar(100),
	"urgency" smallint,
	"status" varchar(20) DEFAULT 'backlog',
	"listing_id" bigint,
	"listing_contact_id" bigint,
	"deal_id" bigint,
	"appointment_id" bigint,
	"prospect_id" bigint,
	"contact_id" bigint,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"testimonial_id" bigserial PRIMARY KEY NOT NULL,
	"account_id" bigint NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"avatar" varchar(1024),
	"rating" smallint DEFAULT 5 NOT NULL,
	"is_verified" boolean DEFAULT true,
	"sort_order" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"account_id" bigint NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"last_code" varchar(255),
	"last_code_sent_at" timestamp,
	"last_code_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "two_factor_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_comments" (
	"comment_id" bigserial PRIMARY KEY NOT NULL,
	"contact_id" bigint NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"content" text NOT NULL,
	"parent_id" bigint,
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_integrations" (
	"integration_id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expiry_date" timestamp,
	"calendar_id" varchar(255) DEFAULT 'primary',
	"sync_token" text,
	"channel_id" varchar(64),
	"resource_id" varchar(255),
	"channel_expiration" timestamp,
	"sync_direction" varchar(20) DEFAULT 'vesta_to_google',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"user_role_id" bigserial PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"role_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false,
	"email_verified_at" timestamp,
	"image" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"password" varchar(255),
	"account_id" bigint,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"phone" varchar(20),
	"timezone" varchar(50) DEFAULT 'UTC',
	"language" varchar(10) DEFAULT 'en',
	"preferences" jsonb DEFAULT '{}'::jsonb,
	"last_login" timestamp,
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_config" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"account_id" bigint NOT NULL,
	"social_links" text NOT NULL,
	"seo_props" text NOT NULL,
	"logo" varchar(1024) NOT NULL,
	"logotype" varchar(1024) NOT NULL,
	"favicon" varchar(1024) NOT NULL,
	"hero_props" text NOT NULL,
	"featured_props" text NOT NULL,
	"about_props" text NOT NULL,
	"properties_props" text NOT NULL,
	"testimonial_props" text NOT NULL,
	"contact_props" text,
	"footer_props" text NOT NULL,
	"head_props" text NOT NULL,
	"watermark_props" text DEFAULT '{}' NOT NULL,
	"metadata" text,
	"links_props" text,
	"color_props" text,
	"font_props" text,
	"city_content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
