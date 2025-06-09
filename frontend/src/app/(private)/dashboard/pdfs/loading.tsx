import React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  variant?: "spinner" | "dots" | "skeleton" | "pulse";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function Loading({
  variant = "dots",
  size = "md",
  text,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (variant === "spinner") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 min-h-screen",
          className
        )}
      >
        <div
          className={cn(
            "animate-spin rounded-full border-4 border-muted border-t-primary border-r-yellow-primary",
            sizeClasses[size]
          )}
        />
        {text && (
          <p
            className={cn(
              "text-muted-foreground animate-pulse",
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 min-h-screen",
          className
        )}
      >
        <div className="flex space-x-1">
          <div
            className={cn(
              "rounded-full bg-primary animate-bounce",
              size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
            )}
            style={{ animationDelay: "0ms" }}
          />
          <div
            className={cn(
              "rounded-full bg-yellow-primary animate-bounce",
              size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
            )}
            style={{ animationDelay: "150ms" }}
          />
          <div
            className={cn(
              "rounded-full bg-primary animate-bounce",
              size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
            )}
            style={{ animationDelay: "300ms" }}
          />
        </div>
        {text && (
          <p
            className={cn(
              "text-muted-foreground animate-pulse",
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gradient-to-r from-primary/20 to-yellow-primary/20 rounded animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-gradient-to-r from-yellow-primary/20 to-primary/20 rounded animate-pulse" />
            <div className="h-3 bg-gradient-to-r from-primary/20 to-yellow-primary/20 rounded w-5/6 animate-pulse" />
          </div>
          <div className="h-4 bg-gradient-to-r from-yellow-primary/20 to-primary/20 rounded w-4/6 animate-pulse" />
        </div>
        {text && (
          <p
            className={cn(
              "text-muted-foreground text-center",
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 min-h-screen",
          className
        )}
      >
        <div
          className={cn(
            "rounded-full bg-gradient-to-r from-primary to-yellow-primary animate-pulse",
            sizeClasses[size]
          )}
        />
        {text && (
          <p
            className={cn(
              "text-muted-foreground animate-pulse",
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  return null;
}

// Preset loading components for common use cases
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading variant="spinner" size="lg" text="Loading..." />
    </div>
  );
}

export function ButtonLoading() {
  return (
    <Loading variant="spinner" size="sm" className="text-primary-foreground" />
  );
}

export function CardLoading() {
  return (
    <div className="p-6 space-y-4">
      <Loading variant="skeleton" text="Loading content..." />
    </div>
  );
}

export function InlineLoading({ text }: { text?: string }) {
  return <Loading variant="dots" size="sm" text={text} className="py-2" />;
}

// Main export
export default Loading;
