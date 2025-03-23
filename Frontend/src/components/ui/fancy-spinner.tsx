import React from "react";
import { cn } from "@/lib/utils";

interface FancySpinnerProps {
  variant?: "morph" | "pulse" | "ripple" | "gradient" | "dots";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
};

export const FancySpinner: React.FC<FancySpinnerProps> = ({
  variant = "morph",
  size = "md",
  className,
  primaryColor = "farm-green-500",
  secondaryColor = "harvest-gold-500",
}) => {
  if (variant === "morph") {
    return (
      <div className="flex items-center justify-center">
        <div
          className={cn(
            `bg-${primaryColor} animate-morph`,
            sizeClasses[size],
            className
          )}
        />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className="flex items-center justify-center">
        <div className={cn("relative", sizeClasses[size], className)}>
          <div className={`absolute inset-0 bg-${primaryColor} rounded-full animate-pulse opacity-75`}></div>
          <div className={`absolute inset-0 bg-${primaryColor} rounded-full animate-pulse opacity-75`} style={{ animationDelay: "0.5s" }}></div>
          <div className={`absolute inset-0 bg-${primaryColor} rounded-full animate-pulse opacity-75`} style={{ animationDelay: "1s" }}></div>
          <div className={`absolute inset-2 bg-white rounded-full flex items-center justify-center`}>
            <div className={`h-1/2 w-1/2 bg-${primaryColor} rounded-full animate-scale-in-center`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "ripple") {
    return (
      <div className="flex items-center justify-center">
        <div className={cn("relative", sizeClasses[size], className)}>
          <div className={`absolute inset-0 border-4 border-${primaryColor} rounded-full animate-ping`} style={{ animationDuration: "1.5s" }}></div>
          <div className={`absolute inset-0 border-4 border-${primaryColor} rounded-full animate-ping`} style={{ animationDuration: "1.5s", animationDelay: "0.5s" }}></div>
          <div className={`absolute inset-0 border-4 border-${primaryColor} rounded-full animate-ping`} style={{ animationDuration: "1.5s", animationDelay: "1s" }}></div>
        </div>
      </div>
    );
  }

  if (variant === "gradient") {
    return (
      <div className="flex items-center justify-center">
        <div 
          className={cn(
            "rounded-full animate-rotate-360", 
            sizeClasses[size], 
            className
          )}
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, bg-${primaryColor} 30%, bg-${secondaryColor} 60%, transparent 80%)`,
            maskImage: 'radial-gradient(transparent 60%, black 60%)'
          }}
        />
      </div>
    );
  }

  // Dots variant (default)
  return (
    <div className="flex space-x-2 items-center justify-center">
      {[0, 1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className={cn(
            `bg-${primaryColor} rounded-full animate-bounce-subtle`,
            size === "sm" ? "h-2 w-2" : 
            size === "md" ? "h-3 w-3" : 
            size === "lg" ? "h-4 w-4" : "h-5 w-5",
            className
          )}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </div>
  );
}; 