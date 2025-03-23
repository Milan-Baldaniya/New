import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "default" | "pulse" | "gradient";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  variant = "default",
}) => {
  if (variant === "pulse") {
    return (
      <div className="flex items-center justify-center gap-1">
        <div className={cn(
          "bg-primary/80 rounded-full animate-bounce-subtle",
          sizeClasses[size].split(" ")[0].replace("h-", "h-"),
          sizeClasses[size].split(" ")[1].replace("w-", "w-"),
          className
        )} style={{ animationDelay: "0ms" }}></div>
        <div className={cn(
          "bg-primary/80 rounded-full animate-bounce-subtle",
          sizeClasses[size].split(" ")[0].replace("h-", "h-"),
          sizeClasses[size].split(" ")[1].replace("w-", "w-"),
          className
        )} style={{ animationDelay: "150ms" }}></div>
        <div className={cn(
          "bg-primary/80 rounded-full animate-bounce-subtle",
          sizeClasses[size].split(" ")[0].replace("h-", "h-"),
          sizeClasses[size].split(" ")[1].replace("w-", "w-"),
          className
        )} style={{ animationDelay: "300ms" }}></div>
      </div>
    );
  }
  
  if (variant === "gradient") {
    return (
      <div className="flex items-center justify-center">
        <div className={cn(
          "rounded-full animate-rotate-360 border-2 border-t-primary border-r-primary/40 border-b-primary/10 border-l-primary/70",
          sizeClasses[size],
          className
        )}></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <Loader2
        className={cn(
          "animate-rotate-360 text-gray-700",
          sizeClasses[size],
          className
        )}
      />
    </div>
  );
}; 