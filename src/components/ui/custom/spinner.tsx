import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "white";
}

const Spinner = ({
  size = "md",
  variant = "primary",
  className,
  ...props
}: SpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const variantClasses = {
    primary: "border-t-primary",
    secondary: "border-t-secondary",
    white: "border-t-white",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-transparent",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
      aria-label="Loading"
    >
      <output className="sr-only">Loading...</output>
    </div>
  );
};

export { Spinner };
