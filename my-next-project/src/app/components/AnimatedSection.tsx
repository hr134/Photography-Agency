"use client";

import { motion, Variants } from "framer-motion";
import React, { ReactNode } from "react";

// Reusable wrapper for section animations
// Usage: <AnimatedSection>{children}</AnimatedSection>
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export const AnimatedSection = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeIn}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
