"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "~/lib/animations";

interface KpiData {
  name: string;
  data: string;
}

interface KpiSectionProps {
  kpis: KpiData[];
}

export function KpiSection({ kpis }: KpiSectionProps) {
  if (!kpis.length) return null;

  return (
    <motion.div
      className="mt-24 grid grid-cols-2 gap-8 text-center md:grid-cols-4"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {kpis.map((kpi, index) => (
        <motion.div
          key={index}
          className="space-y-2"
          variants={staggerItem}
          whileHover={{
            scale: 1.05,
            transition: { duration: 0.2 },
          }}
        >
          <motion.h3
            className="text-4xl font-bold text-primary"
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              type: "spring",
              stiffness: 300,
              delay: index * 0.1,
            }}
          >
            {kpi.data.endsWith("+") ? `+${kpi.data.slice(0, -1)}` : kpi.data}
          </motion.h3>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            {kpi.name}
          </motion.p>
        </motion.div>
      ))}
    </motion.div>
  );
}
