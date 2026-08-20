import { ChevronDown } from "lucide-react";

interface CityFaqProps {
  city: string;
  faq: Array<{ q: string; a: string }>;
}

export function CityFaq({ city, faq }: CityFaqProps) {
  if (faq.length === 0) return null;

  return (
    <section
      aria-labelledby={`city-faq-${city}`}
      className="mx-auto mt-12 max-w-3xl"
    >
      <h2
        id={`city-faq-${city}`}
        className="mb-6 text-xl font-semibold text-foreground sm:text-2xl"
      >
        Preguntas frecuentes sobre {city}
      </h2>
      <div className="divide-y divide-border rounded-lg border border-border">
        {faq.map((item, i) => (
          <details
            key={i}
            className="group px-4 py-3 open:bg-muted/30 sm:px-6 sm:py-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium text-foreground marker:hidden">
              {item.q}
              <ChevronDown
                className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
