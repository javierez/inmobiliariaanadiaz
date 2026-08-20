"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { fadeInUp } from "~/lib/animations";

interface PropertyButtonProps {
  text: string;
  onClick?: () => void;
}

export function PropertyButton({ text, onClick }: PropertyButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push("/venta-propiedades/todas-ubicaciones");
    }
  };

  return (
    <motion.div
      className="mt-12 text-center"
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
        <Button size="lg" onClick={handleClick}>
          {text}
        </Button>
      </motion.div>
    </motion.div>
  );
}
