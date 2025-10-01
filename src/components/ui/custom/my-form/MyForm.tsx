import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type ControllerRenderProps, type Path, type UseFormReturn, type FieldValues } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { type IconName } from "@/components/ui/custom/icon"
import { cn } from "@/lib/utils"
import MilestoneStepIndicator from "./MilestoneStepIndicator"
import DefaultStepIndicator from "./DefaultStepIndicator"
import ProgressStepIndicator from "./ProgressStepIndicator"
import BreadcrumbStepIndicator from "./BreadcrumbStepIndicator"
import DotsStepIndicator from "./DotStepIndicator"
import ArrayField from "./ArrayField"
import { getGridCols, isFieldRequired } from "./formUtils"

export interface FormFieldItem<TFormData extends FieldValues = FieldValues> {
    label: string;
    name: Path<TFormData>;
    description?: string;
    layout?: {
        row: number;
        width?: "full" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4";
    };
    render: (props: {
        field: ControllerRenderProps<TFormData, Path<TFormData>>;
        form: UseFormReturn<TFormData>;
        index?: number;
    }) => React.ReactNode;
    preview?: (props: {
        field: ControllerRenderProps<TFormData, Path<TFormData>>;
        form: UseFormReturn<TFormData>;
        index?: number;
    }) => React.ReactNode;
    visibleIn?: "edit" | "preview" | "both";
    isArray?: boolean;
    arrayConfig?: {
        fields: ArrayItemField[];
        defaultItem: Record<string, unknown>;
        minItems?: number;
        maxItems?: number;
        addButtonText?: string;
        removeButtonText?: string;
        renderWrapper?: (props: {
            children: React.ReactNode;
            index: number;
            remove: () => void;
            canRemove: boolean;
        }) => React.ReactNode;
        previewWrapper?: (props: {
            children: React.ReactNode;
            index: number;
        }) => React.ReactNode;
    };
}

export interface ArrayItemField {
    label: string;
    name: string;
    description?: string;
    layout?: {
        row: number;
        width?: "full" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4";
    };
    render: (props: {
        field: ControllerRenderProps<FieldValues, string>;
        form: UseFormReturn<FieldValues>;
        index?: number;
    }) => React.ReactNode;
    preview?: (props: {
        field: ControllerRenderProps<FieldValues, string>;
        form: UseFormReturn<FieldValues>;
        index?: number;
    }) => React.ReactNode;
    visibleIn?: "edit" | "preview" | "both";
}

// Step indicator configuration types
export interface StepMetadata {
    title: string;
    description?: string;
    icon?: IconName;
}

export type StepIndicatorVariant =
    | "default"
    | "progress"
    | "breadcrumb"
    | "milestone"
    | "dots"
    | "custom";

export interface StepIndicatorConfig {
    variant: StepIndicatorVariant;
    steps?: StepMetadata[];
    showPercentage?: boolean;
    showStepNumber?: boolean;
    customRender?: (props: {
        currentStep: number;
        totalSteps: number;
        steps?: StepMetadata[];
        percentage: number;
    }) => React.ReactNode;
}

export type FormMode = "edit" | "preview";

interface MyFormProps<TFormData extends FieldValues = FieldValues> {
    formSchema: z.ZodType<TFormData, any, any>;
    defaultValues: TFormData;
    formItemData: FormFieldItem<TFormData>[] | FormFieldItem<TFormData>[][];
    onSubmit: (values: TFormData) => void | Promise<void>;
    buttonActions?: React.ReactNode;
    submitButtonText?: string;
    maxHeight?: string | null;
    stepIndicator?: StepIndicatorConfig;
    mode?: FormMode;
}


const MyForm = <TFormData extends FieldValues = FieldValues>({
    formSchema,
    defaultValues,
    formItemData,
    onSubmit,
    submitButtonText = "Submit",
    buttonActions = <Button type="submit" className="w-full">{submitButtonText}</Button>,
    maxHeight = "400px",
    stepIndicator,
    mode = "edit"
}: MyFormProps<TFormData>) => {
    const [currentStep, setCurrentStep] = React.useState(0);
    const form = useForm<TFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues as any
    });

    const isMultiStep = Array.isArray(formItemData[0]);
    const currentStepItems = isMultiStep
        ? (formItemData as FormFieldItem<TFormData>[][])[currentStep]
        : (formItemData as FormFieldItem<TFormData>[]);
    const totalSteps = isMultiStep ? formItemData.length : 1;
    const isLastStep = currentStep === totalSteps - 1;
    const percentage = Math.round(((currentStep + 1) / totalSteps) * 100);

    const handleNext = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const fields = currentStepItems.map(item => item.name);
        const isValid = await form.trigger(fields);
        if (isValid) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
        }
    };

    const handlePrevious = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const renderStepIndicator = () => {
        if (!isMultiStep) return null;

        const config = stepIndicator || { variant: "default" };
        const props = {
            currentStep,
            totalSteps,
            percentage,
            steps: config.steps
        };

        switch (config.variant) {
            case "progress":
                return <ProgressStepIndicator {...props} />;
            case "breadcrumb":
                return <BreadcrumbStepIndicator {...props} />;
            case "milestone":
                return <MilestoneStepIndicator {...props} />;
            case "dots":
                return <DotsStepIndicator {...props} />;
            case "custom":
                return config.customRender?.(props) || null;
            case "default":
            default:
                return (
                    <DefaultStepIndicator
                        {...props}
                        showPercentage={config.showPercentage}
                        showStepNumber={config.showStepNumber}
                    />
                );
        }
    };

    const renderFieldItem = (item: FormFieldItem<TFormData>, prefix?: string) => {
        const fieldName = prefix ? `${prefix}.${item.name}` : item.name;
        const required = isFieldRequired(formSchema, item.name as string);

        // Default preview renderer if no custom preview is provided
        const defaultPreview = (field: ControllerRenderProps<TFormData, Path<TFormData>>) => (
            <p className="text-sm p-2 bg-muted rounded-md min-h-[40px] flex items-center">
                {field.value || "-"}
            </p>
        );

        return (
            <div
                key={fieldName}
                className={cn(
                    "col-span-1",
                    getGridCols(item.layout?.width)
                )}
            >
                <FormField
                    control={form.control as any}
                    name={fieldName as Path<TFormData>}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                {item.label}
                                {mode === "edit" && required && <span style={{ color: "red", marginLeft: '-4px' }}>*</span>}
                            </FormLabel>
                            <FormControl>
                                {(() => {
                                    if (mode === "preview") {
                                        return item.preview
                                            ? item.preview({ field: field as any, form: form as any })
                                            : defaultPreview(field as any);
                                    }
                                    return item.render({ field: field as any, form: form as any });
                                })()}
                            </FormControl>
                            {item.description && (
                                <FormDescription>
                                    {item.description}
                                </FormDescription>
                            )}
                            {mode === "edit" && <FormMessage />}
                        </FormItem>
                    )}
                />
            </div>
        );
    };

    const renderArrayField = (item: FormFieldItem<TFormData>) => {
        if (!item.arrayConfig) return null;

        return (
            <ArrayField
                key={item.name}
                item={item as any}
                form={form as UseFormReturn<FieldValues>}
                mode={mode}
                schema={formSchema}
            />
        );
    };

    // Filter fields based on visibility and current mode
    const isFieldVisible = (item: FormFieldItem<TFormData>) => {
        const visibleIn = item.visibleIn || "both";
        return visibleIn === "both" || visibleIn === mode;
    };

    const visibleItems = currentStepItems.filter(isFieldVisible);
    const regularFields = visibleItems.filter(item => !item.isArray);
    const arrayFields = visibleItems.filter(item => item.isArray);

    const groupedItems = regularFields.reduce<Record<number, FormFieldItem<TFormData>[]>>((acc, item) => {
        const row = item.layout?.row ?? 0;
        if (!acc[row]) {
            acc[row] = [];
        }
        acc[row].push(item);
        return acc;
    }, {});

    const rows = Object.entries(groupedItems)
        .map(([row, items]) => ({ row: parseInt(row), items }))
        .sort((a, b) => a.row - b.row);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit(onSubmit as any)(e);
    };

    return (
        <Form {...form}>
            <form onSubmit={handleFormSubmit}>
                {renderStepIndicator()}

                <div
                    className={cn(
                        "space-y-6",
                        maxHeight && "overflow-y-auto p-3"
                    )}
                    style={maxHeight ? { maxHeight } : undefined}
                >
                    {rows.map(({ row, items }) => (
                        <div key={`row-${row}`} className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                            {items.map((item) => renderFieldItem(item))}
                        </div>
                    ))}

                    {arrayFields.map(renderArrayField)}
                </div>

                <div className="pt-6 flex justify-between gap-4">
                    {isMultiStep && currentStep > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevious}
                        // className="flex-1"
                        >
                            Previous
                        </Button>
                    )}
                    {isMultiStep && !isLastStep ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="ml-auto"
                        >
                            Next
                        </Button>
                    ) : (
                        <div className={cn("flex-1", { "ml-auto": isMultiStep && currentStep > 0 })}>
                            {buttonActions}
                        </div>
                    )}
                </div>
            </form>
        </Form>
    )
}

export default MyForm
