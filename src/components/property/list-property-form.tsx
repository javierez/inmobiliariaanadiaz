"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface ListPropertyFormProps {
  onSuccess?: () => void;
  className?: string;
  buttonVariant?: "default" | "outline" | "ghost";
  buttonSize?: "default" | "sm" | "lg" | "icon";
  buttonText?: string;
}

export function ListPropertyForm({
  onSuccess,
  className,
  buttonVariant = "default",
  buttonSize = "default",
  buttonText = "Listar Propiedad",
}: ListPropertyFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    features: [] as string[],
    images: [] as File[],
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      features: checked
        ? [...prev.features, feature]
        : prev.features.filter((f) => f !== feature),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...filesArray],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Simulación de envío
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Aquí iría la lógica real de envío
      // const response = await submitProperty(formData)

      setIsLoading(false);
      setIsOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setIsLoading(false);
      setError(
        "Ha ocurrido un error al enviar tu propiedad. Por favor, inténtalo de nuevo.",
      );
    }
  };

  const features = [
    "Piscina",
    "Jardín",
    "Garaje",
    "Balcón",
    "Terraza",
    "Aire acondicionado",
    "Calefacción",
    "Seguridad 24h",
    "Amueblado",
    "Ascensor",
    "Vistas al mar",
    "Vistas a la montaña",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Listar Nueva Propiedad</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título de la Propiedad*</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Ej: Apartamento moderno en el centro"
                  required
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción*</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe tu propiedad..."
                  rows={4}
                  required
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Tipo de Propiedad*</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) =>
                      handleSelectChange("propertyType", value)
                    }
                  >
                    <SelectTrigger id="propertyType">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">Casa</SelectItem>
                      <SelectItem value="apartment">Apartamento</SelectItem>
                      <SelectItem value="condo">Condominio</SelectItem>
                      <SelectItem value="commercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Precio*</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Ej: 250000"
                    required
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Habitaciones</Label>
                  <Input
                    id="bedrooms"
                    name="bedrooms"
                    type="number"
                    placeholder="Ej: 3"
                    value={formData.bedrooms}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Baños</Label>
                  <Input
                    id="bathrooms"
                    name="bathrooms"
                    type="number"
                    placeholder="Ej: 2"
                    value={formData.bathrooms}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squareFeet">Metros Cuadrados</Label>
                  <Input
                    id="squareFeet"
                    name="squareFeet"
                    type="number"
                    placeholder="Ej: 120"
                    value={formData.squareFeet}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Dirección*</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Calle y número"
                  required
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad*</Label>
                  <Input
                    id="city"
                    name="city"
                    placeholder="Ej: Madrid"
                    required
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Provincia*</Label>
                  <Input
                    id="state"
                    name="state"
                    placeholder="Ej: Madrid"
                    required
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">Código Postal*</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    placeholder="Ej: 28001"
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Características</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {features.map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={`feature-${feature}`}
                        checked={formData.features.includes(feature)}
                        onCheckedChange={(checked) =>
                          handleFeatureToggle(feature, checked as boolean)
                        }
                      />
                      <Label htmlFor={`feature-${feature}`} className="text-sm">
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="images">Imágenes de la Propiedad</Label>
                <div className="rounded-md border-2 border-dashed p-6 text-center">
                  <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    Arrastra y suelta imágenes aquí o haz clic para seleccionar
                  </p>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("images")?.click()}
                  >
                    Seleccionar Imágenes
                  </Button>
                </div>
              </div>

              {formData.images.length > 0 && (
                <div className="space-y-2">
                  <Label>
                    Imágenes Seleccionadas ({formData.images.length})
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((file, index) => (
                      <div key={index} className="group relative">
                        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}

                          <img
                            src={
                              URL.createObjectURL(file) || "/placeholder.svg"
                            }
                            alt={`Imagen ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => removeImage(index)}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={prevStep}>
                Anterior
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep}>
                Siguiente
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Publicar Propiedad"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
