"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface PropertyGridWrapperProps {
  children: ReactNode;
}

export function PropertyGridWrapper({ children }: PropertyGridWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
