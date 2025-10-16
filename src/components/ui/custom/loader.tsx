import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";
import { useState, useEffect } from "react";

interface LoaderProps {
  fullScreen?: boolean;
  overlay?: boolean;
  isLoading?: boolean;
  text?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "white";
  className?: string;
  isCenter?: boolean;
  timeout?: number;
  timeoutMessage?: string;
  showTimeoutMessage?: boolean;
}

const Loader = ({
  fullScreen = false,
  overlay = false,
  text,
  size = "md",
  variant = "primary",
  className,
  isLoading = true,
  isCenter = false,
  timeout = 500,
  timeoutMessage = "No data found",
  showTimeoutMessage = false,
}: LoaderProps) => {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (isLoading && showTimeoutMessage) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, timeout);

      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [isLoading, timeout, showTimeoutMessage]);

  if (!isLoading) return null;

  // Show timeout message if timer has elapsed
  if (showTimeout && showTimeoutMessage) {
    const timeoutContent = (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {timeoutMessage}
        </p>
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          {timeoutContent}
        </div>
      );
    }

    if (overlay) {
      return (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
          {timeoutContent}
        </div>
      );
    }

    if (isCenter) {
      return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          {timeoutContent}
        </div>
      );
    }

    return timeoutContent;
  }

  const content = (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Spinner size={size} variant={variant} />
      {text && (
        <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
        {content}
      </div>
    );
  }

  if (isCenter) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export { Loader };