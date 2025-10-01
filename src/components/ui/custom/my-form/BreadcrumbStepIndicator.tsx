import React from "react";
import type { StepMetadata } from "./MyForm";
import { Icon } from "../icon";
import { cn } from "@/lib/utils";

const BreadcrumbStepIndicator = ({
    currentStep,
    totalSteps,
    steps
}: {
    currentStep: number;
    totalSteps: number;
    steps?: StepMetadata[];
}) => {
    // For mobile/small screens - show compact version
    const CompactView = () => (
        <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                    {steps?.[currentStep]?.title || `Step ${currentStep + 1}`}
                </span>
                <span className="text-xs text-muted-foreground">
                    {currentStep + 1} / {totalSteps}
                </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
                <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
            </div>
        </div>
    );

    // For medium screens - show condensed breadcrumb
    const CondensedView = () => {
        const showSteps = [];
        
        // Always show first step if not current
        if (currentStep > 0) {
            showSteps.push(0);
        }
        
        // Show previous step if not first
        if (currentStep > 1) {
            showSteps.push(currentStep - 1);
        }
        
        // Always show current step
        showSteps.push(currentStep);
        
        // Show next step if not last
        if (currentStep < totalSteps - 1) {
            showSteps.push(currentStep + 1);
        }
        
        // Always show last step if not current
        if (currentStep < totalSteps - 1) {
            showSteps.push(totalSteps - 1);
        }
        
        // Remove duplicates and sort
        const uniqueSteps = [...new Set(showSteps)].sort((a, b) => a - b);
        
        return (
            <nav className="flex items-center space-x-1 overflow-hidden">
                {uniqueSteps.map((stepIndex, arrayIndex) => (
                    <React.Fragment key={stepIndex}>
                        {/* Show ellipsis if there's a gap */}
                        {arrayIndex > 0 && uniqueSteps[arrayIndex - 1] < stepIndex - 1 && (
                            <span className="text-muted-foreground px-1">...</span>
                        )}
                        
                        <div className={cn(
                            "flex items-center space-x-1 px-2 py-1 rounded-md text-xs whitespace-nowrap",
                            stepIndex === currentStep
                                ? "bg-primary text-primary-foreground font-medium"
                                : stepIndex < currentStep
                                    ? "bg-muted text-muted-foreground"
                                    : "text-muted-foreground"
                        )}>
                            {steps?.[stepIndex]?.icon && (
                                <Icon name={steps[stepIndex].icon!} className="h-3 w-3 flex-shrink-0" />
                            )}
                            <span className="hidden sm:inline truncate max-w-[60px]">
                                {steps?.[stepIndex]?.title || `Step ${stepIndex + 1}`}
                            </span>
                            <span className="sm:hidden">
                                {stepIndex + 1}
                            </span>
                        </div>
                        
                        {arrayIndex < uniqueSteps.length - 1 && (
                            <Icon name="ChevronRight" className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                    </React.Fragment>
                ))}
            </nav>
        );
    };

    // For large screens - show full breadcrumb with wrapping
    const FullView = () => (
        <nav className="flex flex-wrap items-center gap-1">
            {Array.from({ length: totalSteps }, (_, index) => (
                <React.Fragment key={index}>
                    <div className={cn(
                        "flex items-center space-x-2 px-3 py-1 rounded-md text-sm whitespace-nowrap",
                        index === currentStep
                            ? "bg-primary text-primary-foreground font-medium"
                            : index < currentStep
                                ? "bg-muted text-muted-foreground"
                                : "text-muted-foreground"
                    )}>
                        {steps?.[index]?.icon && (
                            <Icon name={steps[index].icon!} className="h-4 w-4 flex-shrink-0" />
                        )}
                        <span>{steps?.[index]?.title || `Step ${index + 1}`}</span>
                    </div>
                    {index < totalSteps - 1 && (
                        <Icon name="ChevronRight" className="h-4 w-4 text-muted-foreground" />
                    )}
                </React.Fragment>
            ))}
        </nav>
    );

    return (
        <div className="mb-6">
            {/* Mobile view (< 640px) */}
            <div className="sm:hidden">
                <CompactView />
            </div>
            
            {/* Tablet view (640px - 1024px) */}
            <div className="hidden sm:block lg:hidden">
                <CondensedView />
            </div>
            
            {/* Desktop view (>= 1024px) */}
            <div className="hidden lg:block">
                <FullView />
            </div>
        </div>
    );
};

export default BreadcrumbStepIndicator;