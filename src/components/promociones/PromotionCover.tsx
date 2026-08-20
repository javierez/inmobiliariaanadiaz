import Image from "next/image";
import { cn } from "~/lib/utils";

interface Props {
  src: string;
  alt: string;
  /** Igual que en `next/image`: qué ancho ocupa la imagen en cada breakpoint. */
  sizes: string;
  priority?: boolean;
  /** Clases extra para la imagen de delante (el hover de la tarjeta). */
  className?: string;
}

/**
 * La portada de una promoción, entera.
 *
 * `object-cover` la recortaba, y en obra nueva eso duele: las imágenes que
 * sube la agencia no son fotos de un salón sino alzados y páginas del proyecto
 * en A4 apaisado (1,41). Metidas en una tarjeta vertical (4/5 = 0,8) se comían
 * el 44% del ancho, así que el edificio salía partido y el rótulo cortado.
 *
 * `object-contain` la enseña completa, y la propia imagen ampliada y
 * desenfocada rellena el hueco: sin ella la tarjeta quedaría con dos franjas
 * grises. Son la misma URL optimizada, así que el navegador descarga una sola.
 */
export function PromotionCover({
  src,
  alt,
  sizes,
  priority = false,
  className,
}: Props) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        priority={priority}
        className="scale-110 object-cover blur-xl brightness-90"
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-contain", className)}
      />
    </>
  );
}
