"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { submitContactForm } from "~/server/actions/contact-form";
import type { ContactFormData } from "~/server/actions/contact-form";

export function ContactForm() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    honeypot: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData: ContactFormData = {
        name: formState.name,
        email: formState.email || undefined,
        phone: formState.phone,
        message: formState.message,
        honeypot: formState.honeypot || undefined,
      };

      const result = await submitContactForm(formData);

      if (result.success) {
        setIsSubmitted(true);
        setFormState({
          name: "",
          email: "",
          phone: "",
          message: "",
          honeypot: "",
        });
      } else {
        setError(result.error || "Error al enviar el mensaje");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Error al enviar el mensaje. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envíanos un Mensaje</CardTitle>
        <CardDescription>
          Completa el formulario a continuación y nos pondremos en contacto
          contigo lo antes posible.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex max-w-lg flex-col items-center space-y-6 text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-green-100 bg-green-50"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-2"
              >
                <h3 className="text-2xl font-semibold text-gray-900">
                  Mensaje Enviado
                </h3>
                <div className="mx-auto h-0.5 w-12 bg-green-600" />
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="space-y-4"
              >
                <p className="leading-relaxed text-gray-600">
                  Gracias por contactarnos. Hemos recibido tu mensaje
                  correctamente y nuestro equipo se pondrá en contacto contigo a
                  la brevedad.
                </p>

                <div className="border-t border-gray-100 pt-2">
                  <p className="text-sm text-gray-500">
                    Tiempo de respuesta estimado:{" "}
                    <span className="font-medium text-gray-700">
                      menos de 24 horas
                    </span>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot field — hidden from real users, bots auto-fill it */}
            <div
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", opacity: 0 }}
            >
              <label htmlFor="website">Website</label>
              <input
                id="website"
                name="honeypot"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formState.honeypot}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Juan Pérez"
                required
                value={formState.name}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Número de Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+34 987 123 456"
                required
                value={formState.phone}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Correo Electrónico{" "}
                <span className="text-xs text-muted-foreground">
                  (opcional)
                </span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="juan@ejemplo.com"
                value={formState.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="¿En qué podemos ayudarte?"
                rows={4}
                required
                value={formState.message}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
