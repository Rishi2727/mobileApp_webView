import { cn } from "@/lib/utils";
import { Icon } from "../icon";
import type { StepMetadata } from "./MyForm";

const MilestoneStepIndicator = ({
    currentStep,
    totalSteps,
    steps
}: {
    currentStep: number;
    totalSteps: number;
    steps?: StepMetadata[];
}) => (
    <div className="mb-6">
        <div className="flex items-center justify-between">
            {Array.from({ length: totalSteps }, (_, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 gap-2">
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                        index === currentStep
                            ? "border-primary bg-primary text-primary-foreground"
                            : index < currentStep
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted bg-background text-muted-foreground"
                    )}>
                        {index < currentStep ? (
                            <Icon name="Check" className="h-5 w-5" />
                        ) : steps?.[index]?.icon ? (
                            <Icon name={steps[index].icon!} className="h-5 w-5" />
                        ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                        )}
                    </div>
                    <div className="text-center">
                        <div className={cn(
                            "text-sm font-medium",
                            index === currentStep ? "text-primary" : "text-muted-foreground"
                        )}>
                            {steps?.[index]?.title || `Step ${index + 1}`}
                        </div>
                        {steps?.[index]?.description && (
                            <div className="text-xs text-muted-foreground max-w-20 leading-tight">
                                {steps[index].description}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
        {/* Connection line */}
        <div className="relative mt-4">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-muted -translate-y-12 z-0" />
            <div
                className="absolute top-0 left-0 h-0.5 bg-primary -translate-y-12 z-10 transition-all duration-300"
                style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
            />
        </div>
    </div>
);

export default MilestoneStepIndicator