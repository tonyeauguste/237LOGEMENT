"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";

export default function Toggle({
  defaultOn = false,
  disabled = false,
  onChange,
}: {
  defaultOn?: boolean;
  disabled?: boolean;
  onChange?: (on: boolean) => void;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => {
        setOn((v) => {
          onChange?.(!v);
          return !v;
        });
      }}
      className={clsx(
        "w-11 h-6 rounded-full relative shrink-0 transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        on ? "bg-gold" : "bg-border2"
      )}
    >
      <motion.span
        className="absolute top-[3px] left-[3px] w-[18px] h-[18px] rounded-full bg-white block"
        animate={{ x: on ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}
