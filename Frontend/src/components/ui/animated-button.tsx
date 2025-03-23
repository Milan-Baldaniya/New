import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cva, type VariantProps } from "class-variance-authority";

const animatedButtonVariants = cva(
  "relative overflow-hidden transition-all duration-300",
  {
    variants: {
      variant: {
        default: "",
        glowing: "after:absolute after:content-[''] after:bg-white after:opacity-20 after:top-0 after:left-[-100%] after:w-full after:h-full after:skew-x-[-20deg] after:animate-glow-once",
        pulse: "hover:animate-pulse",
        bounce: "hover:animate-bounce",
        shake: "hover:animate-shake",
        highlight: "bg-harvest-gold-500 hover:bg-harvest-gold-600 text-white border-none shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
      },
      size: {
        default: "",
        sm: "",
        lg: "",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <Button
        className={cn(animatedButtonVariants({ variant, size, className }))}
        ref={ref}
        size={size}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton"; 