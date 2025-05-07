"use client";

import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <motion.div
        className="w-8 h-8 rounded-full border-4"
        style={{
          borderTop: "4px solid #000000", // Indigo-500
          borderRight: "4px solid transparent",
          borderBottom: "4px solid #000000", // Fuchsia-700
          borderLeft: "4px solid transparent",
          boxShadow: "0 4px 24px 0 rgba(99,102,241,0.2)",
          background:
            "conic-gradient(from 90deg at 50% 50%, #000000 0deg, #000000 180deg, #000000 360deg)",
        }}
        animate={{
          rotate: 360,
          scale: [1, 1.15, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: "linear",
          scale: {
            duration: 0.8,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          },
        }}
      />
    </div>
  );
}
