"use client";

import { motion } from "framer-motion";
import { cn } from "~/lib/utils";
import {
  useDescriptionAlign,
  descriptionAlignClass,
} from "~/components/header-style-context";
// import { fadeInUp } from "~/lib/animations";

interface MissionSectionProps {
  title: string;
  content: string;
  content2: string;
}

export function MissionSection({
  title,
  content,
  content2,
}: MissionSectionProps) {
  const alignClass = descriptionAlignClass(useDescriptionAlign());
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h3
        className="text-2xl font-semibold"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {title}
      </motion.h3>
      <motion.div
        className="space-y-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2,
              delayChildren: 0.2,
            },
          },
        }}
      >
        <motion.p
          className={cn("leading-relaxed text-muted-foreground", alignClass)}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {content}
        </motion.p>
        <motion.p
          className={cn("leading-relaxed text-muted-foreground", alignClass)}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          {content2}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
