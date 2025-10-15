import { cn } from "@/lib/utils";
import { Spinner } from "./spinner";

interface LoaderProps {
  fullScreen?: boolean;
  overlay?: boolean;
  isLoading?: boolean;
  text?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "white";
  className?: string;
  isCenter?: boolean;
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
}: LoaderProps) => {
  if (!isLoading) return null;

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