import * as React from "react"
import { useFieldArray, type FieldArrayPath, type UseFormReturn, type FieldValues } from "react-hook-form"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Icon } from "../icon"
import { cn } from "@/lib/utils"
import type { FormFieldItem } from "./MyForm"
import { getGridCols, isFieldRequired } from "./formUtils"

function ArrayField<TFormData extends FieldValues = FieldValues>({
    item,
    form,
    mode = "edit",
    schema
}: Readonly<{
    item: FormFieldItem<TFormData>;
    form: UseFormReturn<FieldValues>;
    mode?: "edit" | "preview";
    schema?: any;
}>) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: item.name as FieldArrayPath<FieldValues>
    });

    if (!item.arrayConfig) return null;

    const { arrayConfig } = item;
    const canRemove = fields.length > (arrayConfig.minItems || 1);
    const canAdd = !arrayConfig.maxItems || fields.length < arrayConfig.maxItems;

    const defaultWrapper = (props: {
        children: React.ReactNode;
        index: number;
        remove: () => void;
        canRemove: boolean;
    }) => (
        <Card className="mb-3">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {props.children}
                    {mode === "edit" && props.canRemove && (
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={props.remove}
                            >
                                <Icon name="Trash2" className="h-4 w-4 mr-1" />
                                {arrayConfig.removeButtonText ?? "Remove"}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    const defaultPreviewWrapper = (props: {
        children: React.ReactNode;
        index: number;
    }) => (
        <Card className="mb-3">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {props.children}
                </div>
            </CardContent>
        </Card>
    );

    const WrapperComponent = mode === "preview"
        ? (arrayConfig.previewWrapper || defaultPreviewWrapper)
        : (arrayConfig.renderWrapper || defaultWrapper);

    return (
        <div className="col-span-12 mb-6">
            <div className="mb-3">
                <h3 className="text-lg font-semibold">{item.label}</h3>
                {item.description && (
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                )}
            </div>

            {fields.map((field, index) => (
                <WrapperComponent
                    key={field.id}
                    index={index}
                    remove={() => remove(index)}
                    canRemove={canRemove}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        {arrayConfig.fields.map((fieldItem) => {
                            const fieldName = `${item.name}.${index}.${fieldItem.name}`;

                            return (
                                <div
                                    key={fieldName}
                                    className={cn(
                                        "col-span-1",
                                        getGridCols(fieldItem.layout?.width)
                                    )}
                                >
                                    <FormField
                                        control={form.control}
                                        name={fieldName}
                                        render={({ field }) => {
                                            let content;
                                            if (mode === "preview") {
                                                content = fieldItem.preview
                                                    ? fieldItem.preview({ field, form, index })
                                                    : <p className="text-sm p-2 bg-muted rounded-md min-h-[40px] flex items-center">{field.value || "-"}</p>;
                                            } else {
                                                content = fieldItem.render({ field, form, index });
                                            }

                                            const isRequired = schema ? isFieldRequired(schema, fieldName) : false;

                                            return (
                                                <FormItem>
                                                    <FormLabel>
                                                        {fieldItem.label}
                                                        {mode === "edit" && isRequired && <span style={{ color: "red", marginLeft: '-4px' }}>*</span>}
                                                    </FormLabel>
                                                    <FormControl>{content}</FormControl>
                                                    {fieldItem.description && (
                                                        <FormDescription>
                                                            {fieldItem.description}
                                                        </FormDescription>
                                                    )}
                                                    {mode === "edit" && <FormMessage />}
                                                </FormItem>
                                            );
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </WrapperComponent>
            ))}

            {mode === "edit" && canAdd && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append(arrayConfig.defaultItem as never)}
                    className="w-full"
                >
                    <Icon name="Plus" className="h-4 w-4 mr-2" />
                    {arrayConfig.addButtonText || `Add ${item.label}`}
                </Button>
            )}
        </div>
    );
}

export default ArrayField;
