import {
  Shield,
  Handshake,
  Heart,
  Sparkles,
  Award,
  Users,
  Target,
  Zap,
  Eye,
  Compass,
  HelpCircle,
} from "lucide-react";
import { getFeaturesProps } from "~/server/queries/website-config";

const iconComponents = {
  shield: Shield,
  handshake: Handshake,
  heart: Heart,
  sparkles: Sparkles,
  award: Award,
  users: Users,
  target: Target,
  zap: Zap,
  eye: Eye,
  compass: Compass,
} as const;

function getIcon(name?: string) {
  if (!name) return HelpCircle;
  const key = name.trim().toLowerCase() as keyof typeof iconComponents;
  return iconComponents[key] ?? HelpCircle;
}

interface ValuesGridProps {
  title?: string;
  values: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
}

export async function ValuesGrid({
  title = "Valores Fundamentales",
  values,
}: ValuesGridProps) {
  if (!values?.length) return null;
  const minimal = (await getFeaturesProps()).headerStyle === "minimal";

  return (
    <section className="bg-muted/30 py-20 sm:py-24" id="valores">
      <div className="container mx-auto">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {!minimal && (
            <span className="mb-3 block text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
              Lo que nos define
            </span>
          )}
          <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, i) => {
            const Icon = getIcon(value.icon);
            return (
              <div
                key={i}
                className="rounded-2xl border border-border/60 bg-background p-8 transition-colors hover:border-foreground/30"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-border/60">
                  <Icon className="h-5 w-5 text-foreground/70" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
