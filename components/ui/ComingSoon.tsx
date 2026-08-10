"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function ComingSoon({
  icon = "🏗️",
  title,
  text,
  badge = "🚀 Lancement imminent",
  action,
  className = "",
}: {
  icon?: string;
  title: string;
  text: ReactNode;
  badge?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`text-center py-[70px] px-6 bg-card border-[1.5px] border-dashed border-border2 rounded-[20px] mx-auto max-w-[600px] w-full ${className}`}
    >
      <motion.span
        className="text-[52px] mb-4 block"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {icon}
      </motion.span>
      <h3 className="font-display text-[22px] font-bold text-text mb-3">{title}</h3>
      <p className="text-[15px] text-muted leading-[1.7] mb-5 max-w-[440px] mx-auto">
        {text}
      </p>
      <span className="inline-flex items-center gap-[7px] bg-gold3 border border-[rgba(200,155,60,.3)] text-gold text-[13px] font-semibold px-[18px] py-2 rounded-full tracking-[.3px]">
        {badge}
      </span>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
