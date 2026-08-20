"use server";

import { z } from "zod";
import { db } from "../db";
import { contacts, notifications } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";
import { env } from "~/env";
import { isHoneypotFilled } from "~/lib/honeypot";
import { rateLimit, getClientIp } from "~/lib/rate-limit";

// Validation schema for contact form
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone: z.string().min(1, "Phone is required"),
  message: z.string().min(1, "Message is required").max(5000),
  honeypot: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export async function submitContactForm(formData: ContactFormData) {
  try {
    // Bot detection — reject if honeypot field is filled
    if (isHoneypotFilled(formData.honeypot)) {
      // Return success to not tip off bots
      return {
        success: true,
        contactId: "0",
        message: "Mensaje enviado correctamente",
      };
    }

    // Rate limiting — 5 requests per 60s per IP
    const ip = await getClientIp();
    const limit = rateLimit(`contact:${ip}`, {
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
    const validatedData = contactFormSchema.parse(formData);

    // Get account ID from environment
    const accountId = BigInt(env.NEXT_PUBLIC_ACCOUNT_ID);

    // Split name into first and last name
    const nameParts = validatedData.name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Check if contact already exists — match by email when present, otherwise by phone
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

    let contactId: bigint;

    if (existingContact) {
      // Update existing contact with phone and append new message to notes
      contactId = existingContact.contactId;

      const updates: any = { updatedAt: new Date() };

      // Keep the phone we have, but record the latest one if missing
      if (!existingContact.phone) {
        updates.phone = validatedData.phone;
      }
      // Backfill email if newly provided
      if (validatedData.email && !existingContact.email) {
        updates.email = validatedData.email;
      }

      // Append new message to existing notes
      const currentInfo = existingContact.additionalInfo || {};
      const existingNotes = (currentInfo as any).notes || "";
      const newMessage = `[${new Date().toLocaleDateString("es-ES")}] Nuevo mensaje vía web: "${validatedData.message}"`;

      updates.additionalInfo = {
        ...currentInfo,
        notes: existingNotes ? `${existingNotes}\n${newMessage}` : newMessage,
        lastWebContact: new Date().toISOString(),
      };

      await db
        .update(contacts)
        .set(updates)
        .where(eq(contacts.contactId, contactId));
    } else {
      // Create new contact
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
            source: "website_contact_form",
            firstContactDate: now.toISOString(),
            notes: `Contacto generado vía web: "${validatedData.message}"`,
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

      contactId = newContact!.contactId;
    }

    // Create notification for the team
    await db.insert(notifications).values({
      accountId,
      userId: null, // Broadcast to all users in account
      fromUserId: null, // System/anonymous sender
      type: "website_inquiry",
      title: `Nuevo mensaje de ${validatedData.name}`,
      message: validatedData.message,
      category: "contacts",
      priority: "high",
      entityType: "contact",
      entityId: contactId,
      metadata: {
        formData: {
          name: validatedData.name,
          email: validatedData.email ?? null,
          phone: validatedData.phone,
          submittedAt: new Date().toISOString(),
        },
        source: "website_contact_form",
      },
      actionUrl: `/contactos/${contactId}`,
      deliveryChannel: "in_app",
      isDelivered: true,
      deliveredAt: new Date(),
      isActive: true,
    });

    return {
      success: true,
      contactId: contactId.toString(),
      message: "Mensaje enviado correctamente",
    };
  } catch (error) {
    console.error("Error submitting contact form:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Datos del formulario inválidos",
        details: error.errors,
      };
    }

    return {
      success: false,
      error: "Error al enviar el mensaje. Por favor, inténtalo de nuevo.",
    };
  }
}
