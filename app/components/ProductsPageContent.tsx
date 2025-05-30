"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ProductsPageContentProps {
  children: ReactNode;
}

export function ProductsPageContent({ children }: ProductsPageContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}
