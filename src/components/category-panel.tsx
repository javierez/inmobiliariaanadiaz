"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { staggerContainer, staggerItem } from "~/lib/animations";

interface Category {
  title: string;
  subtitle: string;
  href: string;
  image: string;
  fallbackGradient: string;
}

const FALLBACK_CATEGORIES: Category[] = [
  {
    title: "Origen bancario",
    subtitle: "Inmuebles procedentes de entidades financieras",
    href: "/venta-propiedades/origen-bancario",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    fallbackGradient: "from-primary-700 via-primary-800 to-primary-950",
  },
  {
    title: "Destacados",
    subtitle: "Una selección curada de los mejores inmuebles",
    href: "/venta-propiedades/destacados",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    fallbackGradient: "from-secondary-700 via-secondary-800 to-secondary-950",
  },
  {
    title: "Oportunidad",
    subtitle: "Precios y condiciones por debajo de mercado",
    href: "/venta-propiedades/oportunidad",
    image:
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80",
    fallbackGradient: "from-primary-600 via-secondary-700 to-secondary-900",
  },
];

const ROTATING_GRADIENTS = [
  "from-primary-700 via-primary-800 to-primary-950",
  "from-secondary-700 via-secondary-800 to-secondary-950",
  "from-primary-600 via-secondary-700 to-secondary-900",
];

export interface CategoryPanelCardInput {
  title: string;
  subtitle: string;
  href: string;
  imageUrl: string;
}

export function CategoryPanel({
  cards,
}: { cards?: CategoryPanelCardInput[] } = {}) {
  const categories: Category[] =
    cards && cards.length > 0
      ? cards.map((c, i) => ({
          title: c.title,
          subtitle: c.subtitle,
          href: c.href,
          image: c.imageUrl,
          fallbackGradient: ROTATING_GRADIENTS[i % ROTATING_GRADIENTS.length]!,
        }))
      : FALLBACK_CATEGORIES;

  return <CategoryPanelInner categories={categories} />;
}

function CategoryPanelInner({ categories }: { categories: Category[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [imageFailed, setImageFailed] = useState<Record<number, boolean>>({});

  return (
    <section className="pt-10 sm:pt-12 lg:pt-14">
      <motion.div
        className="flex flex-col gap-6 md:flex-row md:gap-8"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {categories.map((category, index) => (
          <motion.a
            key={category.title}
            href={category.href}
            className="group relative block aspect-[4/5] overflow-hidden rounded-2xl md:aspect-auto md:h-[28rem] md:flex-1 md:basis-0"
            variants={staggerItem}
            animate={{
              flexGrow: hovered === null ? 1 : hovered === index ? 2 : 1,
            }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(null)}
          >
            {imageFailed[index] ? (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.fallbackGradient}`}
                aria-hidden
              />
            ) : (
              <Image
                src={category.image}
                alt={category.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() =>
                  setImageFailed((prev) => ({ ...prev, [index]: true }))
                }
              />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/15 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-6 pb-6 pt-16 sm:px-8 sm:pb-8">
              <h3 className="text-2xl font-medium tracking-tight text-white sm:text-3xl">
                {category.title}
              </h3>
              <p className="mt-2 text-sm text-white/85">{category.subtitle}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white">
                Explorar
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </section>
  );
}
