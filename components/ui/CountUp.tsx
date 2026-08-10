"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

/**
 * Animates a numeric count-up when scrolled into view.
 * Accepts a display string like "45+", "100%", "7j/7" — the numeric
 * portion is extracted and animated, prefix/suffix text is preserved.
 */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const match = value.match(/[\d.,]+/);
  const numeric = match ? parseFloat(match[0].replace(",", ".")) : null;
  const prefix = match ? value.slice(0, match.index) : "";
  const suffix = match ? value.slice((match.index ?? 0) + match[0].length) : value;

  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: 1400, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (inView && numeric !== null) motionVal.set(numeric);
  }, [inView, numeric, motionVal]);

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(v));
    return unsub;
  }, [spring]);

  if (numeric === null) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  const isInt = Number.isInteger(numeric);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {isInt ? Math.round(display) : display.toFixed(1)}
      {suffix}
    </span>
  );
}
