import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ResponsiveWrapperProps {
  children: ReactNode
  className?: string
  /** 
   * Padding variant - controls the amount of padding
   * - sm: Small padding (mobile: 4, tablet: 6, desktop: 8)
   * - md: Medium padding (mobile: 6, tablet: 8, desktop: 12) 
   * - lg: Large padding (mobile: 8, tablet: 12, desktop: 16)
   * - xl: Extra large padding (mobile: 10, tablet: 16, desktop: 20)
   */
  variant?: "sm" | "md" | "lg" | "xl"
  /**
   * Controls horizontal padding only
   */
  paddingX?: boolean
  /**
   * Controls vertical padding only  
   */
  paddingY?: boolean
  /**
   * Custom breakpoint overrides
   */
  customPadding?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

const paddingVariants = {
  sm: {
    mobile: "p-4",
    tablet: "md:p-6", 
    desktop: "lg:p-8"
  },
  md: {
    mobile: "p-6",
    tablet: "md:p-8",
    desktop: "lg:p-12"
  },
  lg: {
    mobile: "p-8", 
    tablet: "md:p-12",
    desktop: "lg:p-16"
  },
  xl: {
    mobile: "p-10",
    tablet: "md:p-16", 
    desktop: "lg:p-20"
  }
}

const paddingXVariants = {
  sm: {
    mobile: "px-4",
    tablet: "md:px-6",
    desktop: "lg:px-8"
  },
  md: {
    mobile: "px-6",
    tablet: "md:px-8", 
    desktop: "lg:px-96"
  },
  lg: {
    mobile: "px-8",
    tablet: "md:px-12",
    desktop: "lg:px-16"
  },
  xl: {
    mobile: "px-10",
    tablet: "md:px-16",
    desktop: "lg:px-20"
  }
}

const paddingYVariants = {
  sm: {
    mobile: "py-4",
    tablet: "md:py-6",
    desktop: "lg:py-8"
  },
  md: {
    mobile: "py-6", 
    tablet: "md:py-8",
    desktop: "lg:py-12"
  },
  lg: {
    mobile: "py-8",
    tablet: "md:py-12", 
    desktop: "lg:py-16"
  },
  xl: {
    mobile: "py-10",
    tablet: "md:py-16",
    desktop: "lg:py-20"
  }
}

export default function ResponsiveWrapper({
  children,
  className,
  variant = "md",
  paddingX = false,
  paddingY = false,
  customPadding
}: Readonly<ResponsiveWrapperProps>) {
  
  const getPaddingClasses = () => {
    // If custom padding is provided, use it
    if (customPadding) {
      return cn(
        customPadding.mobile || "",
        customPadding.tablet || "",
        customPadding.desktop || ""
      )
    }

    // If paddingX only
    if (paddingX && !paddingY) {
      const paddingClasses = paddingXVariants[variant]
      return cn(
        paddingClasses.mobile,
        paddingClasses.tablet,
        paddingClasses.desktop
      )
    }

    // If paddingY only
    if (paddingY && !paddingX) {
      const paddingClasses = paddingYVariants[variant]
      return cn(
        paddingClasses.mobile,
        paddingClasses.tablet,
        paddingClasses.desktop
      )
    }

    // Default: all padding
    const paddingClasses = paddingVariants[variant]
    return cn(
      paddingClasses.mobile,
      paddingClasses.tablet,
      paddingClasses.desktop
    )
  }

  return (
    <div className={cn(getPaddingClasses(), className)}>
      {children}
    </div>
  )
}

// Export named variants for common use cases
export const ResponsiveContainer = ({ children, className }: { children: ReactNode; className?: string }) => (
  <ResponsiveWrapper variant="md" className={cn("w-full max-w-7xl mx-auto", className)}>
    {children}
  </ResponsiveWrapper>
)

export const ResponsiveSection = ({ children, className }: { children: ReactNode; className?: string }) => (
  <ResponsiveWrapper variant="lg" paddingY className={cn("w-full", className)}>
    {children}
  </ResponsiveWrapper>
)

export const ResponsiveCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <ResponsiveWrapper variant="sm" className={cn("bg-card rounded-lg border", className)}>
    {children}
  </ResponsiveWrapper>
)