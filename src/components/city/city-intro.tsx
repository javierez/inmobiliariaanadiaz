interface CityIntroProps {
  city: string;
  intro: string;
}

export function CityIntro({ city, intro }: CityIntroProps) {
  const paragraphs = intro
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  if (paragraphs.length === 0) return null;

  return (
    <section
      aria-labelledby={`city-intro-${city}`}
      className="mx-auto mb-8 max-w-3xl space-y-4 text-base leading-relaxed text-muted-foreground"
    >
      <h2
        id={`city-intro-${city}`}
        className="text-xl font-semibold text-foreground sm:text-2xl"
      >
        Inmobiliaria en {city}
      </h2>
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </section>
  );
}
