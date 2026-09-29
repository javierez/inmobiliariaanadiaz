interface EnergyCertificateSectionProps {
  energyConsumptionScale?: string | null;
  energyConsumptionValue?: string | null;
  emissionsScale?: string | null;
  emissionsValue?: string | null;
  propertyType?: string | null;
}

function getEnergyCertificationColor(cert: string | null | undefined) {
  if (!cert) return "bg-gray-300";

  switch (cert) {
    case "A":
      return "bg-green-500";
    case "B":
      return "bg-green-400";
    case "C":
      return "bg-yellow-400";
    case "D":
      return "bg-yellow-500";
    case "E":
      return "bg-orange-400";
    case "F":
      return "bg-orange-500";
    case "G":
      return "bg-red-500";
    default:
      return "bg-gray-300";
  }
}

const ARROW_WIDTHS: Record<string, string> = {
  A: "w-32",
  B: "w-36",
  C: "w-40",
  D: "w-44",
  E: "w-48",
  F: "w-52",
  G: "w-56",
};

const RATINGS = ["A", "B", "C", "D", "E", "F", "G"] as const;

export function EnergyCertificateSection({
  energyConsumptionScale,
  energyConsumptionValue,
  emissionsScale,
  emissionsValue,
  propertyType,
}: EnergyCertificateSectionProps) {
  if (propertyType === "solar" || propertyType === "garaje") {
    return null;
  }

  const hasScale = energyConsumptionScale || emissionsScale;

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold">Certificación Energética</h2>
      {hasScale ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Energy Consumption Scale */}
          <div className="space-y-4">
            <h3 className="text-center text-lg font-semibold">
              Eficiencia de Consumo
            </h3>
            <div className="rounded-lg border bg-white p-4">
              <div className="space-y-1">
                {RATINGS.map((rating) => {
                  const isCurrentRating =
                    energyConsumptionScale?.toUpperCase() === rating;
                  const backgroundColor = getEnergyCertificationColor(rating);
                  const arrowWidth = ARROW_WIDTHS[rating] || "w-40";

                  return (
                    <div key={rating} className="relative flex">
                      <div
                        className={`flex h-8 items-center justify-start px-3 text-sm font-bold ${
                          isCurrentRating
                            ? `${backgroundColor} text-white ring-2 ring-blue-500 ring-offset-2`
                            : "bg-gray-200 text-gray-600"
                        } ${rating === "A" ? "rounded-tl-lg" : ""} ${rating === "G" ? "rounded-bl-lg" : ""} ${arrowWidth}`}
                        style={{
                          clipPath:
                            "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)",
                        }}
                      >
                        <span>{rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {!!energyConsumptionValue && (
              <div className="text-center">
                <p className="text-sm font-medium">
                  Consumo: {energyConsumptionValue} kWh/m² año
                </p>
              </div>
            )}
          </div>

          {/* Energy Emissions Scale */}
          <div className="space-y-4">
            <h3 className="text-center text-lg font-semibold">
              Eficiencia de Emisiones
            </h3>
            <div className="rounded-lg border bg-white p-4">
              <div className="space-y-1">
                {RATINGS.map((rating) => {
                  const isCurrentRating =
                    emissionsScale?.toUpperCase() === rating;
                  const backgroundColor = getEnergyCertificationColor(rating);
                  const arrowWidth = ARROW_WIDTHS[rating] || "w-40";

                  return (
                    <div key={rating} className="relative flex">
                      <div
                        className={`flex h-8 items-center justify-start px-3 text-sm font-bold ${
                          isCurrentRating
                            ? `${backgroundColor} text-white ring-2 ring-blue-500 ring-offset-2`
                            : "bg-gray-200 text-gray-600"
                        } ${rating === "A" ? "rounded-tl-lg" : ""} ${rating === "G" ? "rounded-bl-lg" : ""} ${arrowWidth}`}
                        style={{
                          clipPath:
                            "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)",
                        }}
                      >
                        <span>{rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {!!emissionsValue && (
              <div className="text-center">
                <p className="text-sm font-medium">
                  Emisiones: {emissionsValue} kg CO₂/m² año
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Energy Consumption Scale - No color */}
          <div className="space-y-4">
            <h3 className="text-center text-lg font-semibold">
              Eficiencia de Consumo
            </h3>
            <div className="rounded-lg border bg-white p-4">
              <div className="space-y-1">
                {RATINGS.map((rating) => {
                  const arrowWidth = ARROW_WIDTHS[rating] || "w-40";

                  return (
                    <div key={rating} className="relative flex">
                      <div
                        className={`flex h-8 items-center justify-start bg-gray-300 px-3 text-sm font-bold ${rating === "A" ? "rounded-tl-lg" : ""} ${rating === "G" ? "rounded-bl-lg" : ""} ${arrowWidth}`}
                        style={{
                          clipPath:
                            "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)",
                        }}
                      >
                        <span className="text-gray-700">{rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">En trámite</p>
            </div>
          </div>

          {/* Energy Emissions Scale - No color */}
          <div className="space-y-4">
            <h3 className="text-center text-lg font-semibold">
              Eficiencia de Emisiones
            </h3>
            <div className="rounded-lg border bg-white p-4">
              <div className="space-y-1">
                {RATINGS.map((rating) => {
                  const arrowWidth = ARROW_WIDTHS[rating] || "w-40";

                  return (
                    <div key={rating} className="relative flex">
                      <div
                        className={`flex h-8 items-center justify-start bg-gray-300 px-3 text-sm font-bold ${rating === "A" ? "rounded-tl-lg" : ""} ${rating === "G" ? "rounded-bl-lg" : ""} ${arrowWidth}`}
                        style={{
                          clipPath:
                            "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)",
                        }}
                      >
                        <span className="text-gray-700">{rating}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">En trámite</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
