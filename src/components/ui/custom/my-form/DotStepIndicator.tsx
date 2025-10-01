import { cn } from "@/lib/utils";

const DotsStepIndicator = ({
    currentStep,
    totalSteps
}: {
    currentStep: number;
    totalSteps: number;
}) => (
    <div className="mb-6 flex items-center justify-center space-x-2">
        {Array.from({ length: totalSteps }, (_, index) => (
            <div
                key={index}
                className={cn(
                    "w-3 h-3 rounded-full transition-colors",
                    index === currentStep
                        ? "bg-primary"
                        : index < currentStep
                            ? "bg-primary/60"
                            : "bg-muted"
                )}
            />
        ))}
    </div>
);

export default DotsStepIndicator;