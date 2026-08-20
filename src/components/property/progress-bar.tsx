import { cn } from "~/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const steps = [
    { name: "Contacto y ubicación", description: "Tus datos y la dirección" },
    { name: "Datos y precio", description: "Tipo, superficie y precio" },
    { name: "Revisión", description: "Confirmar y enviar" },
  ];

  const percentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="flex h-2 overflow-hidden rounded-full bg-muted text-xs">
          <div
            style={{ width: `${percentage}%` }}
            className="flex flex-col justify-center whitespace-nowrap bg-brand text-center text-brand-foreground shadow-none transition-all duration-500 ease-in-out"
          ></div>
        </div>
      </div>

      <div className="hidden justify-between md:flex">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              "flex flex-col items-center text-center",
              index <= currentStep ? "text-primary" : "text-muted-foreground",
            )}
          >
            <div
              className={cn(
                "mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                index < currentStep
                  ? "bg-brand text-brand-foreground shadow-md"
                  : index === currentStep
                    ? "border-2 border-brand text-primary"
                    : "border border-muted-foreground/30 text-muted-foreground",
              )}
            >
              {index + 1}
            </div>
            <div className="text-sm font-medium">{step.name}</div>
            <div className="hidden text-xs lg:block">{step.description}</div>
          </div>
        ))}
      </div>

      <div className="md:hidden">
        <div className="flex items-center">
          <div
            className={cn(
              "mr-3 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
              "bg-brand text-brand-foreground shadow-sm",
            )}
          >
            {currentStep + 1}
          </div>
          <div>
            <div className="text-sm font-medium">
              {steps[currentStep]!.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {steps[currentStep]!.description}
            </div>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            Paso {currentStep + 1} de {totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}
