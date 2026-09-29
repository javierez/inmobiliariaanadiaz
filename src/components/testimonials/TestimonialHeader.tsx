"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "~/lib/animations";
import { useMinimalHeaders } from "~/components/header-style-context";

interface TestimonialHeaderProps {
  title: string;
  subtitle: string;
}

export function TestimonialHeader({ title, subtitle }: TestimonialHeaderProps) {
  const minimal = useMinimalHeaders();
  return (
    <motion.div
      className="mb-12 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
    >
      <motion.h2
        className="mb-2 text-3xl font-bold"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {title}
      </motion.h2>
      {!minimal && (
        <motion.p
          className="mx-auto max-w-2xl text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
