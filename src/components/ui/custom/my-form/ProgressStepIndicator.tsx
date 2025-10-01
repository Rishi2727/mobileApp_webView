import { Progress } from "@/components/ui/progress";
import type { StepMetadata } from "./MyForm";

const ProgressStepIndicator = ({
    currentStep,
    percentage,
    steps
}: {
    currentStep: number;
    percentage: number;
    steps?: StepMetadata[];
}) => (
    <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
                {steps?.[currentStep]?.title || `Step ${currentStep + 1}`}
            </h3>
            <span className="text-sm text-muted-foreground">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
        {steps?.[currentStep]?.description && (
            <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
        )}
    </div>
);

export default ProgressStepIndicator;