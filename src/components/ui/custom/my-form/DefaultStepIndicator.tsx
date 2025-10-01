const DefaultStepIndicator = ({
    currentStep,
    totalSteps,
    percentage,
    showPercentage = true,
    showStepNumber = true
}: {
    currentStep: number;
    totalSteps: number;
    percentage: number;
    showPercentage?: boolean;
    showStepNumber?: boolean;
}) => (
    <div className="mb-6 flex items-center justify-between">
        {showStepNumber && (
            <div className="text-sm font-medium">
                Step {currentStep + 1} of {totalSteps}
            </div>
        )}
        {showPercentage && (
            <div className="text-sm text-muted-foreground">
                {percentage}% Complete
            </div>
        )}
    </div>
);

export default DefaultStepIndicator;