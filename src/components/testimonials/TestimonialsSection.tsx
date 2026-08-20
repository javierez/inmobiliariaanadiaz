import {
  getTestimonialProps,
  getTestimonials,
} from "~/server/queries/testimonial";
import { TestimonialHeader } from "./TestimonialHeader";
import { TestimonialCarousel } from "./TestimonialCarousel";

/**
 * Homepage "Opiniones" section.
 *
 * Opt-in on purpose: every account was seeded with three sample testimonials
 * ("Sara Jiménez", "Miguel Chen", "Emilia Rodríguez" — Acropolis copy), so
 * rendering whenever rows exist would drop placeholder text onto live sites.
 * It only appears once the agency ticks "Mostrar la sección en la web" in the
 * CRM (`testimonial_props.enabled`).
 */
export async function TestimonialsSection() {
  const [props, rows] = await Promise.all([
    getTestimonialProps(),
    getTestimonials(),
  ]);

  if (!props?.enabled) return null;
  if (rows.length === 0) return null;

  const testimonials = rows.map((t) => ({
    id: String(t.testimonialId),
    name: t.name ?? "",
    role: t.role ?? "",
    content: t.content ?? "",
    avatar: t.avatar ?? undefined,
    rating: t.rating ?? undefined,
  }));

  return (
    <section className="py-12 sm:py-16 lg:py-24" id="testimonials">
      <TestimonialHeader
        title={props.title || "Lo que dicen nuestros clientes"}
        subtitle={props.subtitle ?? ""}
      />
      <TestimonialCarousel
        testimonials={testimonials}
        cardStyle={props.cardStyle ?? "avatar"}
      />
    </section>
  );
}
