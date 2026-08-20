"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { fadeInUp } from "~/lib/animations";

interface AboutButtonProps {
  text: string;
  href: string;
}

export function AboutButton({ text, href }: AboutButtonProps) {
  return (
    <motion.div
      className="mt-12 flex flex-col justify-center gap-4 sm:flex-row"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay: 0.3 }}
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block"
      >
        <Button size="lg" asChild>
          <Link href={href}>{text}</Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
