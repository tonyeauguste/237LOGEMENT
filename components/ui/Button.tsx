"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import clsx from "clsx";

export type ButtonVariant = "gold" | "outline" | "ghost" | "danger" | "green" | "orange" | "blue";
export type ButtonSize = "md" | "sm" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  gold: "btn-gold-anim bg-gradient-to-br from-[#C89B3C] via-[#E8C97A] to-[#C89B3C] bg-[length:200%_200%] text-[#07111E] hover:shadow-[0_12px_36px_rgba(200,155,60,.45)]",
  outline: "bg-transparent border-[1.5px] border-gold text-gold hover:bg-gold hover:text-[#07111E]",
  ghost: "bg-transparent border border-border2 text-muted hover:border-gold hover:text-gold",
  danger: "bg-[rgba(224,85,85,.1)] border border-[rgba(224,85,85,.3)] text-red hover:bg-[rgba(224,85,85,.22)]",
  green: "bg-[rgba(61,153,112,.12)] border border-[rgba(61,153,112,.3)] text-green2 hover:bg-[rgba(61,153,112,.25)]",
  orange: "bg-[rgba(249,115,22,.12)] border border-[rgba(249,115,22,.3)] text-orange hover:bg-[rgba(249,115,22,.25)]",
  blue: "bg-[rgba(99,179,237,.12)] border border-[rgba(99,179,237,.3)] text-blue hover:bg-[rgba(99,179,237,.25)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-[7px] text-[13px] rounded-lg",
  md: "px-[22px] py-[11px] text-sm rounded-[10px]",
  lg: "px-8 py-[14px] text-base rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "gold", size = "md", full, loading, className, children, disabled, ...props },
  ref
) {
  return (
    <motion.button
      ref={ref}
      whileHover={{ y: -2, scale: 1.015 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold tracking-[.2px] transition-colors transition-shadow duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        full && "w-full",
        loading && "btn-loading",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {children}
    </motion.button>
  );
});

export default Button;
