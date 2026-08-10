"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

export default function AmenityChip({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={clsx(
        "px-[14px] py-[7px] rounded-full border-[1.5px] text-[13px] transition-colors duration-200 cursor-pointer",
        selected
          ? "border-gold bg-gold3 text-gold"
          : "border-border text-muted hover:border-gold hover:text-text"
      )}
    >
      {icon} {label}
    </motion.button>
  );
}
