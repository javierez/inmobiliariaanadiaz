"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import type { ContactLeadData } from "~/types/property-form";
import { submitVenderLead } from "~/server/actions/property-listing";

const initialData: ContactLeadData = {
  nombre: "",
  email: "",
  telefono: "",
  acceptTerms: false,
  honeypot: "",
};

export function PropertyListingForm() {
  const [data, setData] = useState<ContactLeadData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const update = (patch: Partial<ContactLeadData>) =>
    setData((prev) => ({ ...prev, ...patch }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!data.nombre.trim()) next.nombre = "El nombre es obligatorio";
    if (!data.telefono.trim()) {
      next.telefono = "El teléfono es obligatorio";
    }
    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      next.email = "El email no es válido";
    }
    if (!data.acceptTerms) {
      next.acceptTerms = "Debe aceptar los términos y condiciones";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const result = await submitVenderLead(data);
      if (result.success) {
        setIsSubmitted(true);
      } else {
        setErrors({
          submit:
            result.error ??
            "Ha ocurrido un error al enviar el formulario. Por favor, inténtelo de nuevo.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({
        submit:
          "Ha ocurrido un error al enviar el formulario. Por favor, inténtelo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <Card>
          <CardContent className="px-6 py-10 text-center sm:px-10 sm:py-12">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 sm:h-16 sm:w-16">
              <Check className="h-7 w-7 text-green-600 sm:h-8 sm:w-8" />
            </div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
              ¡Gracias por contactarnos!
            </h2>
            <p className="mx-auto mb-6 max-w-sm text-sm text-muted-foreground sm:text-base">
              Hemos recibido tus datos. Nuestro equipo se pondrá en contacto
              contigo lo antes posible.
            </p>
            <Button asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-8 sm:space-y-10">
      <header className="space-y-3 text-center">
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.75rem]">
          Vende tu propiedad con nosotros
        </h1>
        <p className="mx-auto max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
          Déjanos tus datos y nuestro equipo te llamará para asesorarte.
        </p>
      </header>

      <Card className="shadow-sm">
        <CardContent className="px-5 py-6 sm:px-8 sm:py-8">
          {errors.submit && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Honeypot — hidden from real users, bots auto-fill it */}
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
                value={data.honeypot ?? ""}
                onChange={(e) => update({ honeypot: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={data.nombre}
                onChange={(e) => update({ nombre: e.target.value })}
                placeholder="Tu nombre"
                autoComplete="name"
                className={`h-11 ${errors.nombre ? "border-red-500" : ""}`}
              />
              {errors.nombre && (
                <p className="text-sm text-red-500">{errors.nombre}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email{" "}
                  <span className="text-xs text-muted-foreground">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  value={data.email}
                  onChange={(e) => update({ email: e.target.value })}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className={`h-11 ${errors.email ? "border-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telefono" className="text-sm font-medium">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="telefono"
                  type="tel"
                  inputMode="tel"
                  value={data.telefono}
                  onChange={(e) => update({ telefono: e.target.value })}
                  placeholder="Tu teléfono"
                  autoComplete="tel"
                  className={`h-11 ${errors.telefono ? "border-red-500" : ""}`}
                />
                {errors.telefono && (
                  <p className="text-sm text-red-500">{errors.telefono}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-md bg-muted/40 p-3 sm:p-4">
              <Checkbox
                id="terms"
                checked={data.acceptTerms}
                onCheckedChange={(checked) =>
                  update({ acceptTerms: checked === true })
                }
                className="mt-0.5"
              />
              <div className="grid gap-1 leading-snug">
                <Label
                  htmlFor="terms"
                  className={`text-sm font-medium ${errors.acceptTerms ? "text-red-500" : ""}`}
                >
                  Acepto los términos y condiciones
                </Label>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  Al enviar este formulario, acepto los{" "}
                  <Link
                    href="/terminos-condiciones-venta"
                    className="text-primary underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="/proteccion-de-datos"
                    className="text-primary underline-offset-2 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    política de privacidad
                  </Link>
                  .
                </p>
                {errors.acceptTerms && (
                  <p className="text-sm text-red-500">{errors.acceptTerms}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="h-12 w-full text-base font-semibold"
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground sm:text-sm">
        Te responderemos en menos de 24 horas.
      </p>
    </div>
  );
}
