"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface WhatsAppButtonProps {
  phoneNumber?: string | null;
}

export function WhatsAppButton({ phoneNumber }: WhatsAppButtonProps) {
  // Don't render if no phone number
  if (!phoneNumber) return null;

  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-transform hover:scale-110"
    >
      <MessageCircle className="h-6 w-6" />
    </Link>
  );
}
