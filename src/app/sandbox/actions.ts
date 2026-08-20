"use server";

import { db } from "~/server/db";
import { env } from "~/env";
import {
  properties,
  type Property,
  accounts,
  type Account,
  websiteConfigs,
  type WebsiteConfig,
  testimonials,
} from "~/lib/data";
import {
  properties as dbProperties,
  websiteProperties,
  accounts as dbAccounts,
  testimonials as dbTestimonials,
} from "~/server/db/schema";

// Helper function to convert property to DB format
function toDbProperty(property: Property) {
  return {
    accountId: BigInt(env.NEXT_PUBLIC_ACCOUNT_ID),
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    status: property.status,
    price: property.price.toString(),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms?.toString(),
    squareFeet: property.squareFeet,
    yearBuilt: property.age ? new Date().getFullYear() - property.age : null,
    address: property.address,
    city: property.city,
    state: property.state,
    postalCode: property.zipCode,
    latitude: property.coordinates?.lat.toString() ?? null,
    longitude: property.coordinates?.lng.toString() ?? null,
    isFeatured: property.isFeatured,
    isBankOwned: property.isBankOwned ?? false,
    energyCertification: property.energyCertification ?? null,
    hasHeating: property.hasHeating ?? false,
    heatingType: property.heatingType ?? null,
    hasElevator: property.hasElevator ?? false,
    hasGarage: property.hasGarage ?? false,
    hasStorageRoom: property.hasStorageRoom ?? false,
    features: JSON.stringify(property.features),
    referenceNumber: property.listingId ?? property.reference,
  };
}

// Helper function to convert website config to DB format
function toDbWebsiteConfig(config: WebsiteConfig) {
  return {
    accountId: BigInt(config.accountId),
    socialLinks: JSON.stringify(config.socialLinks),
    logo: config.logo ?? "",
    logotype: config.logo ?? "", // Using logo as logotype default
    favicon: config.favicon ?? "",
    seoProps: JSON.stringify(config.seoProps ?? {}),
    heroProps: JSON.stringify(config.heroProps ?? {}),
    featuredProps: JSON.stringify(config.featuredProps ?? {}),
    aboutProps: JSON.stringify(config.aboutProps ?? {}),
    propertiesProps: JSON.stringify(config.propertiesProps ?? {}),
    testimonialProps: JSON.stringify(config.testimonialProps ?? {}),
    contactProps: JSON.stringify(config.contactProps ?? {}),
    footerProps: JSON.stringify(config.footerProps ?? {}),
    headProps: JSON.stringify(config.headProps ?? {}),
    watermarkProps: JSON.stringify({}), // Default empty watermark props
  };
}

// Helper function to convert account to DB format
function toDbAccount(account: Account) {
  return {
    name: account.name,
    shortName: account.shortName,
    status: account.status,
    subscriptionType: account.subscriptionType,
    subscriptionStartDate: account.subscriptionStartDate,
    subscriptionEndDate: account.subscriptionEndDate ?? null,
    maxOffices: account.maxOffices ?? 1,
    maxUsers: account.maxUsers ?? 5,
  };
}

// Helper function to convert testimonial to DB format
function toDbTestimonial(testimonial: (typeof testimonials)[0]) {
  return {
    accountId: BigInt(env.NEXT_PUBLIC_ACCOUNT_ID),
    name: testimonial.name,
    role: testimonial.role,
    content: testimonial.content,
    avatar: testimonial.avatar,
    rating: Math.round(testimonial.rating ?? 5), // Round to nearest integer and default to 5 if null
    isVerified: testimonial.isVerified,
    sortOrder: testimonial.sortOrder,
    isActive: testimonial.isActive,
    createdAt: testimonial.createdAt,
    updatedAt: testimonial.updatedAt,
  };
}

export async function seedDatabase() {
  // First seed accounts as they are referenced by other tables
  await db.insert(dbAccounts).values(accounts.map(toDbAccount));

  // Then seed website properties
  await db
    .insert(websiteProperties)
    .values(websiteConfigs.map(toDbWebsiteConfig));

  // Seed testimonials
  await db.insert(dbTestimonials).values(testimonials.map(toDbTestimonial));

  // Finally seed properties
  await db.insert(dbProperties).values(properties.map(toDbProperty));
}
