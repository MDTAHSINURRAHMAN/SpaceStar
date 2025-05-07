"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ReviewsPageContentProps {
  children: ReactNode;
}

export function ReviewsPageContent({ children }: ReviewsPageContentProps) {
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
