"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "~/lib/animations";
import { useMinimalHeaders } from "~/components/header-style-context";

interface AboutHeaderProps {
  title: string;
  subtitle: string;
}

export function AboutHeader({ title, subtitle }: AboutHeaderProps) {
  const minimal = useMinimalHeaders();
  return (
    <motion.div
      className="mb-12 flex flex-col items-center text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeInUp}
    >
      <motion.h2
        className="mb-4 text-4xl font-bold tracking-tight"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {title}
      </motion.h2>
      {!minimal && (
        <motion.p
          className="max-w-2xl text-muted-foreground"
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
