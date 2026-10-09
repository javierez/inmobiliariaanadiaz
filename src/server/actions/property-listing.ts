"use server";

import { db } from "~/server/db";
import {
  contacts,
  properties,
  listings,
  listingContacts,
  propertyImages,
  notifications,
  users,
  websiteProperties,
} from "~/server/db/schema";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { env } from "~/env";
import type { ContactLeadData, PropertyFormData } from "~/types/property-form";
import { eq, desc } from "drizzle-orm";
import { isHoneypotFilled } from "~/lib/honeypot";
import { rateLimit, getClientIp } from "~/lib/rate-limit";
import { generateAgentLeadNotificationEmail } from "~/templates/emails/agent-lead-notification";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
import { getAdminAgent } from "~/server/queries/agents";
import { generatePropertyTitle } from "~/lib/property-title";
import { retrieveGeocodingData } from "~/server/googlemaps/retrieve_geo";
import { sendEmail } from "~/lib/email";
import { generateListingConfirmationEmail } from "~/templates/emails/listing-confirmation";
import { generateAgentListingNotificationEmail } from "~/templates/emails/agent-listing-notification";
import { getImagesForListings as getImagesForListingsBatch } from "~/server/queries/listings";

// Initialize S3 Client (only if AWS credentials are available)
const s3Client =
  process.env.AWS_REGION &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
    ? new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

// Upload Image to S3 (following the pattern from your example)
async function uploadImageToS3(
  file: File,
  referenceNumber: string,
  imageOrder: number,
): Promise<{ imageUrl: string; s3key: string; imageKey: string }> {
  if (!s3Client || !process.env.AWS_S3_BUCKET) {
    throw new Error("S3 configuration not available");
  }

  // Validate file type and size before uploading
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      `Tipo de imagen no permitido: ${file.type}. Solo se permiten JPEG, PNG y WebP.`,
    );
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      `La imagen es demasiado grande (${Math.round(file.size / 1024 / 1024)}MB). Máximo 10MB.`,
    );
  }

  const fileExtension = file.name?.split(".").pop() || "jpg";
  const imageKey = `${referenceNumber}/images/image_${imageOrder}_${nanoid(6)}.${fileExtension}`;

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to S3
  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: imageKey,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    }),
  );

  // Return full URL and keys
  const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
  const s3key = `s3://${process.env.AWS_S3_BUCKET}/${imageKey}`;

  return {
    imageUrl,
    s3key,
    imageKey,
  };
}

export async function submitPropertyListing(formData: PropertyFormData) {
  try {
    // Bot detection — reject if honeypot field is filled
    if (isHoneypotFilled(formData.honeypot)) {
      return {
        success: true,
        referenceNumber: "FAKE",
        propertyId: "0",
        listingId: "0",
      };
    }

    // Rate limiting — 3 requests per 60s per IP (heavier action)
    const ip = await getClientIp();
    const limit = rateLimit(`listing:${ip}`, {
      maxRequests: 3,
      windowMs: 60_000,
    });
    if (!limit.success) {
      return {
        success: false,
        error:
          "Demasiadas solicitudes. Por favor, inténtalo de nuevo en unos minutos.",
      };
    }

    // Generate reference number
    const referenceNumber = `VESTA${nanoid(8).toUpperCase()}`;
    const accountId = BigInt(env.NEXT_PUBLIC_ACCOUNT_ID);

    // 1. Insert contact information (following the pattern with BigInt)
    const nowVender = new Date();
    await db.insert(contacts).values({
      accountId,
      firstName: formData.contactInfo.nombre,
      lastName: formData.contactInfo.apellidos,
      email: formData.contactInfo.email || null,
      phone: formData.contactInfo.telefono || null,
      source: "Website",
      isActive: true,
      additionalInfo: JSON.stringify({
        notes: "Contacto generado vía web",
      }),
      captacionStatus: "pendiente",
      gdprConsentStatus: "accepted",
      gdprConsentDate: nowVender,
      gdprConsentMethod: "portal",
      gdprConsentCategories: {
        property_notifications: true,
        commercial_communications: true,
        appointment_reminders: true,
        document_notifications: true,
      },
    });

    // Get the inserted contact ID
    const [insertedContact] = await db
      .select({ contactId: contacts.contactId })
      .from(contacts)
      .where(eq(contacts.accountId, accountId))
      .orderBy(desc(contacts.createdAt))
      .limit(1);

    if (!insertedContact) {
      throw new Error("Failed to insert contact");
    }

    const contactId = insertedContact.contactId;

    // 2. Geocode the address and get location data
    const fullAddress =
      `${formData.locationInfo.direccion} ${formData.locationInfo.numero || ""}, ${formData.locationInfo.localidad}, ${formData.locationInfo.provincia || ""}, Spain`.trim();

    console.log(`Attempting to geocode address: ${fullAddress}`);
    const geocodingResult = await retrieveGeocodingData(fullAddress);

    // Generate proper property title using street and neighborhood
    const propertyTitle = generatePropertyTitle(
      formData.propertyInfo.tipo,
      formData.locationInfo.direccion,
      geocodingResult?.neighborhood,
    );

    console.log(`Generated property title: ${propertyTitle}`);

    // 3. Insert property information
    await db.insert(properties).values({
      accountId,
      referenceNumber,
      title: propertyTitle,
      propertyType: formData.propertyInfo.tipo,
      bedrooms: formData.propertyInfo.habitaciones
        ? parseInt(formData.propertyInfo.habitaciones)
        : null,
      bathrooms: formData.propertyInfo.banos
        ? formData.propertyInfo.banos
        : null, // Keep as string
      squareMeter: formData.propertyInfo.superficie
        ? parseInt(formData.propertyInfo.superficie)
        : null,
      street: formData.locationInfo.direccion,
      addressDetails:
        `${formData.locationInfo.numero || ""} ${formData.locationInfo.planta || ""} ${formData.locationInfo.puerta || ""}`.trim() ||
        null,
      postalCode: formData.locationInfo.codigoPostal,
      // Add geocoding data
      neighborhoodId: geocodingResult?.neighborhoodId
        ? BigInt(geocodingResult.neighborhoodId)
        : null,
      latitude: geocodingResult?.latitude ? geocodingResult.latitude : null,
      longitude: geocodingResult?.longitude ? geocodingResult.longitude : null,
      // Map caracteristicas to boolean fields
      hasElevator: formData.propertyInfo.caracteristicas.includes("Ascensor"),
      hasGarage: formData.propertyInfo.caracteristicas.includes("Garaje"),
      hasStorageRoom:
        formData.propertyInfo.caracteristicas.includes("Trastero"),
      pool: formData.propertyInfo.caracteristicas.includes("Piscina"),
      garden: formData.propertyInfo.caracteristicas.includes("Jardín"),
      balconyCount: formData.propertyInfo.caracteristicas.includes("Balcón")
        ? 1
        : 0,
      terrace: formData.propertyInfo.caracteristicas.includes("Terraza"),
      airConditioningType: formData.propertyInfo.caracteristicas.includes(
        "Aire acondicionado",
      )
        ? "central"
        : null,
      hasHeating: formData.propertyInfo.caracteristicas.includes("Calefacción"),
      securityGuard:
        formData.propertyInfo.caracteristicas.includes("Seguridad 24h"),
      builtInWardrobes:
        formData.propertyInfo.caracteristicas.includes("Armarios empotrados") ||
        false,
      seaViews: formData.propertyInfo.caracteristicas.includes("Vistas al mar"),
      mountainViews: formData.propertyInfo.caracteristicas.includes(
        "Vistas a la montaña",
      ),
    });

    // Get the inserted property
    const [insertedProperty] = await db
      .select()
      .from(properties)
      .where(eq(properties.referenceNumber, referenceNumber))
      .limit(1);

    if (!insertedProperty) {
      throw new Error("Failed to insert property");
    }

    const propertyId = insertedProperty.propertyId;

    // 4. Determine listing type and price
    let listingType: "Sale" | "Rent" = "Sale";
    let price = "0";

    if (formData.economicInfo.precioVenta) {
      listingType = "Sale";
      price = formData.economicInfo.precioVenta;
    } else if (formData.economicInfo.precioAlquiler) {
      listingType = "Rent";
      price = formData.economicInfo.precioAlquiler;
    }

    // 5. Get admin agent and insert listing information
    const agentId = await getAdminAgent();

    await db.insert(listings).values({
      accountId,
      propertyId,
      agentId,
      listingType,
      price, // Already a string
      status: "Draft", // As requested
      isFurnished:
        formData.propertyInfo.caracteristicas.includes("Amueblado") || null,
      // Map additional economic info
      optionalGarage: false,
      optionalStorageRoom: false,
      hasKeys: false,
      studentFriendly: null,
      petsAllowed: null,
      appliancesIncluded: null,
    });

    // Get the inserted listing ID
    const [insertedListing] = await db
      .select({ listingId: listings.listingId })
      .from(listings)
      .where(eq(listings.propertyId, propertyId))
      .orderBy(desc(listings.createdAt))
      .limit(1);

    if (!insertedListing) {
      throw new Error("Failed to insert listing");
    }

    const listingId = insertedListing.listingId;

    // 6. Insert listing contact (owner)
    await db.insert(listingContacts).values({
      listingId,
      contactId,
      contactType: "owner",
    });

    // 7. Upload images to S3 and save to database (following the pattern)
    if (formData.images && formData.images.length > 0 && s3Client) {
      const imageUploadPromises = formData.images.map(
        async (imageFile, index) => {
          try {
            // Upload to S3
            const { imageUrl, s3key, imageKey } = await uploadImageToS3(
              imageFile,
              referenceNumber,
              index + 1,
            );

            // Save to database
            await db.insert(propertyImages).values({
              propertyId,
              referenceNumber,
              imageUrl,
              imageKey,
              s3key,
              imageOrder: index + 1,
              imageTag: index === 0 ? "main" : "additional",
            });

            return { success: true, imageUrl };
          } catch (error) {
            console.error(`Failed to upload image ${index + 1}:`, error);
            return { success: false, error };
          }
        },
      );

      await Promise.all(imageUploadPromises);
    } else if (formData.images && formData.images.length > 0 && !s3Client) {
      console.warn(
        "Images provided but S3 configuration not available. Property saved without images.",
      );
    }

    // 8. Send confirmation email to the seller (fire-and-forget)
    if (formData.contactInfo.email) {
      sendSellerConfirmationEmail(accountId, {
        ownerName: `${formData.contactInfo.nombre} ${formData.contactInfo.apellidos}`,
        ownerEmail: formData.contactInfo.email,
        referenceNumber,
        propertyType: formData.propertyInfo.tipo,
        address: fullAddress,
        listingType,
        price,
      }).catch((err) => {
        console.error("Failed to send seller confirmation email:", err);
      });
    }

    // 9. Send agent notification email + create in-app notification (fire-and-forget)
    const ownerName = `${formData.contactInfo.nombre} ${formData.contactInfo.apellidos}`;
    sendAgentNotificationEmail(accountId, {
      agentId,
      ownerName,
      ownerEmail: formData.contactInfo.email || null,
      ownerPhone: formData.contactInfo.telefono || null,
      referenceNumber,
      propertyType: formData.propertyInfo.tipo,
      propertyAddress: fullAddress,
      listingType,
      price,
    }).catch((err) => {
      console.error("Failed to send agent notification email:", err);
    });

    // 10. Create in-app notification for the team
    db.insert(notifications)
      .values({
        accountId,
        userId: null,
        fromUserId: null,
        type: "new_website_listing",
        title: `Nueva captacion web: ${ownerName}`,
        message: `${ownerName} ha enviado una propiedad desde la web: ${propertyTitle}`,
        category: "inbox",
        priority: "high",
        entityType: "listing",
        entityId: listingId,
        metadata: {
          ownerName,
          ownerEmail: formData.contactInfo.email || null,
          ownerPhone: formData.contactInfo.telefono || null,
          referenceNumber,
          propertyType: formData.propertyInfo.tipo,
          propertyAddress: fullAddress,
          listingType,
          price,
          source: "website_vender_form",
        },
        actionUrl: `/propiedades/${listingId}`,
        deliveryChannel: "in_app",
        isDelivered: true,
        deliveredAt: new Date(),
        isActive: true,
      })
      .catch((err) => {
        console.error("Failed to create in-app notification:", err);
      });

    return {
      success: true,
      referenceNumber,
      propertyId: propertyId.toString(),
      listingId: listingId.toString(),
    };
  } catch (error) {
    console.error("Error submitting property listing:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Fetch account branding directly from DB (survives code-transformer static transforms)
 */
async function getAccountBranding(accountId: bigint) {
  const [config] = await db
    .select({
      logo: websiteProperties.logo,
      contactProps: websiteProperties.contactProps,
      seoProps: websiteProperties.seoProps,
    })
    .from(websiteProperties)
    .where(eq(websiteProperties.accountId, accountId))
    .limit(1);

  let agencyName = "Nuestra agencia";
  let agencyPhone: string | null = null;
  let agencyEmail: string | null = null;

  if (config?.seoProps) {
    try {
      const seo = JSON.parse(config.seoProps) as {
        name?: string;
        ogSiteName?: string;
      };
      agencyName = seo.name ?? seo.ogSiteName ?? agencyName;
    } catch {
      /* ignore */
    }
  }

  if (config?.contactProps) {
    try {
      const cp = JSON.parse(config.contactProps) as {
        offices?: Array<{
          isDefault?: boolean;
          phoneNumbers?: { main?: string };
          emailAddresses?: { info?: string };
        }>;
      };
      const office = cp.offices?.find((o) => o.isDefault) ?? cp.offices?.[0];
      agencyPhone = office?.phoneNumbers?.main ?? null;
      agencyEmail = office?.emailAddresses?.info ?? null;
    } catch {
      /* ignore */
    }
  }

  return {
    logoUrl: config?.logo ? String(config.logo) : null,
    agencyName,
    agencyPhone,
    agencyEmail,
  };
}

/**
 * Send confirmation email to the property seller
 */
async function sendSellerConfirmationEmail(
  accountId: bigint,
  params: {
    ownerName: string;
    ownerEmail: string;
    referenceNumber: string;
    propertyType: string;
    address: string;
    listingType: "Sale" | "Rent";
    price: string;
  },
): Promise<void> {
  const branding = await getAccountBranding(accountId);

  const emailContent = generateListingConfirmationEmail({
    ownerName: params.ownerName,
    referenceNumber: params.referenceNumber,
    propertyType: params.propertyType,
    address: params.address,
    listingType: params.listingType,
    price: params.price,
    agencyName: branding.agencyName,
    agencyPhone: branding.agencyPhone,
    agencyEmail: branding.agencyEmail,
    logoUrl: branding.logoUrl,
  });

  await sendEmail({
    to: params.ownerEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    fromName: branding.agencyName,
    replyTo: branding.agencyEmail ?? undefined,
  });
}

/**
 * Send notification email to the assigned agent about the new listing
 */
async function sendAgentNotificationEmail(
  accountId: bigint,
  params: {
    agentId: string;
    ownerName: string;
    ownerEmail: string | null;
    ownerPhone: string | null;
    referenceNumber: string;
    propertyType: string;
    propertyAddress: string;
    listingType: string;
    price: string;
  },
): Promise<void> {
  // Look up agent's email
  const [agent] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, params.agentId))
    .limit(1);

  if (!agent?.email) {
    console.warn("⚠️ Agent has no email, skipping notification");
    return;
  }

  const branding = await getAccountBranding(accountId);

  const emailContent = generateAgentListingNotificationEmail({
    ownerName: params.ownerName,
    ownerEmail: params.ownerEmail,
    ownerPhone: params.ownerPhone,
    referenceNumber: params.referenceNumber,
    propertyType: params.propertyType,
    propertyAddress: params.propertyAddress,
    listingType: params.listingType,
    price: params.price,
    logoUrl: branding.logoUrl,
    agencyName: branding.agencyName,
  });

  await sendEmail({
    to: agent.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  console.log(`✅ Agent notification sent to ${agent.email}`);
}

/**
 * Simplified vender-form submission: capture only contact info as a lead.
 * Inserts a contact, creates an in-app notification, and emails the agent.
 * Does NOT create a property or listing — the agent reaches out for details.
 */
export async function submitVenderLead(data: ContactLeadData) {
  try {
    if (isHoneypotFilled(data.honeypot)) {
      return { success: true };
    }

    const ip = await getClientIp();
    const limit = rateLimit(`lead:${ip}`, { maxRequests: 5, windowMs: 60_000 });
    if (!limit.success) {
      return {
        success: false,
        error:
          "Demasiadas solicitudes. Por favor, inténtalo de nuevo en unos minutos.",
      };
    }

    const trimmedName = data.nombre.trim();
    if (!trimmedName) {
      return { success: false, error: "El nombre es obligatorio." };
    }
    if (!data.email && !data.telefono) {
      return {
        success: false,
        error:
          "Indica al menos un email o teléfono para que podamos contactarte.",
      };
    }

    const [firstName, ...rest] = trimmedName.split(/\s+/);
    const lastName = rest.join(" ");
    const accountId = BigInt(env.NEXT_PUBLIC_ACCOUNT_ID);

    const nowVenderLead = new Date();
    await db.insert(contacts).values({
      accountId,
      firstName: firstName ?? trimmedName,
      lastName,
      email: data.email || null,
      phone: data.telefono || null,
      source: "Website",
      isActive: true,
      additionalInfo: JSON.stringify({
        notes: "Lead generado vía formulario web (vender)",
        source: "website_vender_form",
      }),
      captacionStatus: "pendiente",
      gdprConsentStatus: "accepted",
      gdprConsentDate: nowVenderLead,
      gdprConsentMethod: "portal",
      gdprConsentCategories: {
        property_notifications: true,
        commercial_communications: true,
        appointment_reminders: true,
        document_notifications: true,
      },
    });

    const [insertedContact] = await db
      .select({ contactId: contacts.contactId })
      .from(contacts)
      .where(eq(contacts.accountId, accountId))
      .orderBy(desc(contacts.createdAt))
      .limit(1);

    const ownerName = lastName ? `${firstName} ${lastName}` : trimmedName;
    const agentId = await getAdminAgent();

    sendAgentLeadEmail(accountId, {
      agentId,
      ownerName,
      ownerEmail: data.email || null,
      ownerPhone: data.telefono || null,
    }).catch((err) => {
      console.error("Failed to send agent lead email:", err);
    });

    db.insert(notifications)
      .values({
        accountId,
        userId: null,
        fromUserId: null,
        type: "new_website_listing",
        title: `Nueva captacion web: ${ownerName}`,
        message: `${ownerName} ha enviado sus datos desde la web para vender una propiedad.`,
        category: "inbox",
        priority: "high",
        entityType: "contact",
        entityId: insertedContact?.contactId ?? null,
        metadata: {
          ownerName,
          ownerEmail: data.email || null,
          ownerPhone: data.telefono || null,
          source: "website_vender_form",
        },
        actionUrl: insertedContact
          ? `/contactos/${insertedContact.contactId}`
          : null,
        deliveryChannel: "in_app",
        isDelivered: true,
        deliveredAt: new Date(),
        isActive: true,
      })
      .catch((err) => {
        console.error("Failed to create in-app notification:", err);
      });

    return { success: true };
  } catch (error) {
    console.error("Error submitting vender lead:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

async function sendAgentLeadEmail(
  accountId: bigint,
  params: {
    agentId: string;
    ownerName: string;
    ownerEmail: string | null;
    ownerPhone: string | null;
  },
): Promise<void> {
  const [agent] = await db
    .select({ email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, params.agentId))
    .limit(1);

  if (!agent?.email) {
    console.warn("⚠️ Agent has no email, skipping lead notification");
    return;
  }

  const branding = await getAccountBranding(accountId);

  const emailContent = generateAgentLeadNotificationEmail({
    ownerName: params.ownerName,
    ownerEmail: params.ownerEmail,
    ownerPhone: params.ownerPhone,
    logoUrl: branding.logoUrl,
    agencyName: branding.agencyName,
  });

  await sendEmail({
    to: agent.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });
}

// Fetch all images for a batch of properties (used by feed view)
export async function fetchFeedImages(propertyIds: string[]) {
  const bigintIds = propertyIds.map((id) => BigInt(id));
  const imageMap = await getImagesForListingsBatch(bigintIds);
  const result: Record<
    string,
    {
      propertyImageId: string;
      imageUrl: string;
      imageOrder: number;
      imageTag: string | null;
    }[]
  > = {};
  for (const [key, value] of imageMap) {
    result[key] = value;
  }
  return result;
}
