"use server";

import { z } from "zod";
import { db } from "../db";
import { contacts, notifications, listingContacts } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { env } from "~/env";
import { isHoneypotFilled } from "~/lib/honeypot";
import { rateLimit, getClientIp } from "~/lib/rate-limit";

// Validation schema for property inquiry form
const propertyInquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone: z.string().min(1, "Phone is required"),
  message: z.string().min(1, "Message is required").max(5000),
  propertyId: z.string(),
  propertyTitle: z.string(),
  propertyPrice: z.string().optional(),
  honeypot: z.string().optional(),
});

export type PropertyInquiryData = z.infer<typeof propertyInquirySchema>;

export async function submitPropertyInquiry(formData: PropertyInquiryData) {
  console.log("[Property Inquiry] Received form data", {
    propertyId: formData.propertyId,
    propertyTitle: formData.propertyTitle,
    hasName: !!formData.name,
    hasEmail: !!formData.email,
    hasPhone: !!formData.phone,
    messageLength: formData.message?.length || 0,
  });

  try {
    // Bot detection — reject if honeypot field is filled
    if (isHoneypotFilled(formData.honeypot)) {
      return {
        success: true,
        contactId: "0",
        message: "Consulta enviada correctamente",
      };
    }

    // Rate limiting — 5 requests per 60s per IP
    const ip = await getClientIp();
    const limit = rateLimit(`inquiry:${ip}`, {
      maxRequests: 5,
      windowMs: 60_000,
    });
    if (!limit.success) {
      return {
        success: false,
        error:
          "Demasiadas solicitudes. Por favor, inténtalo de nuevo en unos minutos.",
      };
    }

    // Validate input
    console.log("[Property Inquiry] Validating input...");
    const validatedData = propertyInquirySchema.parse(formData);
    console.log("[Property Inquiry] Validation passed");

    // Validate that propertyId is a valid number
    const listingIdNum = parseInt(validatedData.propertyId, 10);
    console.log("[Property Inquiry] Parsed listing ID", {
      original: validatedData.propertyId,
      parsed: listingIdNum,
      isValid: !isNaN(listingIdNum) && listingIdNum > 0,
    });

    if (isNaN(listingIdNum) || listingIdNum <= 0) {
      console.error("[Property Inquiry] Invalid property ID", {
        propertyId: validatedData.propertyId,
        parsed: listingIdNum,
      });
      return {
        success: false,
        error: "ID de propiedad inválido",
      };
    }

    // Get account ID from environment
    const accountId = BigInt(env.NEXT_PUBLIC_ACCOUNT_ID);
    console.log("[Property Inquiry] Using account ID", {
      accountId: accountId.toString(),
    });

    // Split name into first and last name
    const nameParts = validatedData.name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    console.log("[Property Inquiry] Split name", { firstName, lastName });

    // Check if contact already exists
    console.log("[Property Inquiry] Checking for existing contact...");
    const [existingContact] = await db
      .select()
      .from(contacts)
      .where(
        and(
          eq(contacts.accountId, accountId),
          validatedData.email
            ? eq(contacts.email, validatedData.email)
            : eq(contacts.phone, validatedData.phone),
        ),
      )
      .limit(1);

    console.log("[Property Inquiry] Contact lookup result", {
      exists: !!existingContact,
      contactId: existingContact?.contactId?.toString(),
    });

    let contactId: bigint;

    if (existingContact) {
      console.log("[Property Inquiry] Updating existing contact");
      // Update existing contact with phone and append new message to notes
      contactId = existingContact.contactId;

      const updates: any = { updatedAt: new Date() };

      // Backfill phone if missing on the existing contact
      if (!existingContact.phone) {
        updates.phone = validatedData.phone;
      }
      // Backfill email if newly provided
      if (validatedData.email && !existingContact.email) {
        updates.email = validatedData.email;
      }

      // Update source if not already set
      if (!existingContact.source) {
        updates.source = "Website";
      }

      // Append new message to existing notes
      const currentInfo = existingContact.additionalInfo || {};
      const existingNotes = (currentInfo as any).notes || "";
      const newMessage = `[${new Date().toLocaleDateString("es-ES")}] Consulta sobre propiedad "${validatedData.propertyTitle}": "${validatedData.message}"`;

      updates.additionalInfo = {
        ...currentInfo,
        notes: existingNotes ? `${existingNotes}\n${newMessage}` : newMessage,
        lastPropertyInquiry: new Date().toISOString(),
        lastInquiredProperty: {
          propertyId: validatedData.propertyId,
          title: validatedData.propertyTitle,
          price: validatedData.propertyPrice,
        },
      };

      await db
        .update(contacts)
        .set(updates)
        .where(eq(contacts.contactId, contactId));
      console.log("[Property Inquiry] Contact updated successfully");
    } else {
      // Create new contact
      console.log("[Property Inquiry] Creating new contact...");
      const now = new Date();
      const [newContact] = await db
        .insert(contacts)
        .values({
          accountId,
          firstName,
          lastName,
          email: validatedData.email ?? null,
          phone: validatedData.phone,
          source: "Website",
          additionalInfo: {
            source: "website_property_inquiry",
            firstContactDate: now.toISOString(),
            notes: `Consulta sobre propiedad "${validatedData.propertyTitle}": "${validatedData.message}"`,
            lastPropertyInquiry: now.toISOString(),
            lastInquiredProperty: {
              propertyId: validatedData.propertyId,
              title: validatedData.propertyTitle,
              price: validatedData.propertyPrice,
            },
          },
          isActive: true,
          newLead: true,
          gdprConsentStatus: "accepted",
          gdprConsentDate: now,
          gdprConsentMethod: "portal",
          gdprConsentCategories: {
            property_notifications: true,
            commercial_communications: true,
            appointment_reminders: true,
            document_notifications: true,
          },
        })
        .returning({ contactId: contacts.contactId });

      if (!newContact) {
        console.error(
          "[Property Inquiry] Failed to create contact - no contact returned",
        );
        throw new Error("Failed to create contact");
      }

      contactId = newContact.contactId;
      console.log("[Property Inquiry] Contact created successfully", {
        contactId: contactId.toString(),
      });
    }

    // Create listing-contact relationship (using propertyId as listingId since that's what we receive)
    // Note: listingId can be null in the schema, so we handle potential duplicates gracefully
    console.log("[Property Inquiry] Creating listing-contact relationship...", {
      listingId: listingIdNum,
      contactId: contactId.toString(),
    });
    try {
      await db.insert(listingContacts).values({
        listingId: BigInt(listingIdNum),
        contactId: contactId,
        contactType: "buyer",
        source: "Website",
        status: "nuevo",
        inboundMessage: validatedData.message,
        isActive: true,
      });
      console.log(
        "[Property Inquiry] Listing-contact relationship created successfully",
      );
    } catch (dbError: any) {
      // If duplicate key error, that's okay - relationship already exists
      if (
        dbError?.code !== "23505" &&
        !dbError?.message?.includes("duplicate")
      ) {
        console.error(
          "[Property Inquiry] Error creating listing-contact relationship:",
          {
            error: dbError,
            code: dbError?.code,
            message: dbError?.message,
            stack: dbError?.stack,
          },
        );
        throw dbError;
      }
      console.log(
        "[Property Inquiry] Listing-contact relationship already exists (duplicate), continuing...",
      );
    }

    // Create notification for the team
    console.log("[Property Inquiry] Creating notification...");
    await db.insert(notifications).values({
      accountId,
      userId: null, // Broadcast to all users in account
      fromUserId: null, // System/anonymous sender
      type: "property_inquiry",
      title: `Consulta sobre propiedad: ${validatedData.propertyTitle}`,
      message: validatedData.message,
      category: "properties",
      priority: "high",
      entityType: "listing",
      entityId: BigInt(listingIdNum),
      metadata: {
        formData: {
          name: validatedData.name,
          email: validatedData.email ?? null,
          phone: validatedData.phone,
          submittedAt: new Date().toISOString(),
        },
        property: {
          id: validatedData.propertyId,
          title: validatedData.propertyTitle,
          price: validatedData.propertyPrice,
        },
        source: "website_property_inquiry",
      },
      actionUrl: `/propiedades/${validatedData.propertyId}`,
      deliveryChannel: "in_app",
      isDelivered: true,
      deliveredAt: new Date(),
      isActive: true,
    });
    console.log("[Property Inquiry] Notification created successfully");

    console.log("[Property Inquiry] Submission completed successfully", {
      contactId: contactId.toString(),
      listingId: listingIdNum,
    });

    return {
      success: true,
      contactId: contactId.toString(),
      message: "Consulta enviada correctamente",
    };
  } catch (error) {
    console.error(
      "[Property Inquiry] Error submitting property inquiry:",
      error,
    );
    if (error instanceof Error) {
      console.error("[Property Inquiry] Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    if (error && typeof error === "object" && "code" in error) {
      console.error("[Property Inquiry] Database error code:", error.code);
    }

    if (error instanceof z.ZodError) {
      console.error("[Property Inquiry] Validation error:", error.errors);
      return {
        success: false,
        error: "Datos del formulario inválidos",
        details: error.errors,
      };
    }

    // Provide more specific error messages
    if (error instanceof Error) {
      console.error("[Property Inquiry] Error type: Error instance", {
        message: error.message,
        includesForeign: error.message.includes(
          "violates foreign key constraint",
        ),
        includesInvalidSyntax: error.message.includes("invalid input syntax"),
      });

      // Check for common database errors
      if (error.message.includes("violates foreign key constraint")) {
        return {
          success: false,
          error: "La propiedad especificada no existe",
        };
      }
      if (error.message.includes("invalid input syntax")) {
        return {
          success: false,
          error: "ID de propiedad inválido",
        };
      }
    }

    console.error("[Property Inquiry] Returning generic error message");
    return {
      success: false,
      error: "Error al enviar la consulta. Por favor, inténtalo de nuevo.",
    };
  }
}
