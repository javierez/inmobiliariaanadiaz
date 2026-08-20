import Image from "next/image";
import { Mail, Phone, MessageCircle, User } from "lucide-react";

interface TeamGridProps {
  title?: string;
  subtitle?: string;
  team: Array<{
    name: string;
    role: string;
    photo?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
  }>;
}

export function TeamGrid({
  title = "Nuestro Equipo",
  subtitle = "Profesionales a tu disposición",
  team,
}: TeamGridProps) {
  if (!team?.length) return null;

  return (
    <section className="py-20 sm:py-24" id="equipo">
      <div className="container mx-auto">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="mb-3 block text-xs font-medium uppercase tracking-eyebrow text-muted-foreground">
            {subtitle}
          </span>
          <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, i) => (
            <article
              key={i}
              className="overflow-hidden rounded-2xl border border-border/60 bg-background transition-shadow hover:shadow-lg"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-16 w-16 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>

                {(member.email || member.phone || member.whatsapp) && (
                  <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        aria-label={`Email a ${member.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    {member.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        aria-label={`Llamar a ${member.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                    {member.whatsapp && (
                      <a
                        href={`https://wa.me/${member.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`WhatsApp a ${member.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
