import { z } from "zod";

export function getGridCols(width?: "full" | "1/2" | "1/3" | "2/3" | "1/4" | "3/4") {
    switch (width) {
        case "full":
            return "sm:col-span-12";
        case "1/2":
            return "sm:col-span-6";
        case "1/3":
            return "sm:col-span-4";
        case "2/3":
            return "sm:col-span-8";
        case "1/4":
            return "sm:col-span-3";
        case "3/4":
            return "sm:col-span-9";
        default:
            return "sm:col-span-12";
    }
}

/**
 * Check if a schema type is optional
 */
function isSchemaOptional(schema: z.ZodType<any, any, any> | null): boolean {
    if (!schema) return true;
    
    return schema instanceof z.ZodOptional ||
           schema instanceof z.ZodNullable ||
           schema instanceof z.ZodDefault;
}

/**
 * Get the next schema in the path traversal
 */
function getNextSchema(
    currentSchema: z.ZodType<any, any, any>,
    part: string
): z.ZodType<any, any, any> | null {
    if (currentSchema instanceof z.ZodArray) {
        const elementSchema = currentSchema.element as z.ZodType<any, any, any>;
        if (!(elementSchema instanceof z.ZodObject)) return null;
        
        const shape = elementSchema.shape;
        return shape && part in shape ? shape[part] : null;
    }
    
    if (currentSchema instanceof z.ZodObject) {
        const shape = currentSchema.shape;
        return shape && part in shape ? shape[part] : null;
    }
    
    return null;
}

/**
 * Check if a field is required in a Zod schema, supporting nested paths
 */
export function isFieldRequired(schema: z.ZodType<any, any, any>, fieldPath: string): boolean {
    const pathParts = fieldPath.split('.');
    let currentSchema = schema;

    for (const part of pathParts) {
        if (!isNaN(Number(part))) {
            if (currentSchema instanceof z.ZodArray) {
                currentSchema = currentSchema.element as z.ZodType<any, any, any>;
            }
            continue;
        }

        const nextSchema = getNextSchema(currentSchema, part);
        if (!nextSchema) return false;
        
        currentSchema = nextSchema;
    }

    return !isSchemaOptional(currentSchema);
}

/**
 * Get the schema for a nested field path
 */
export function getNestedSchema(schema: z.ZodType<any, any, any>, fieldPath: string): z.ZodType<any, any, any> | null {
    const pathParts = fieldPath.split('.');
    let currentSchema = schema;

    for (const part of pathParts) {
        if (!isNaN(Number(part))) {
            if (currentSchema instanceof z.ZodArray) {
                currentSchema = currentSchema.element as z.ZodType<any, any, any>;
            }
            continue;
        }

        const nextSchema = getNextSchema(currentSchema, part);
        if (!nextSchema) return null;
        
        currentSchema = nextSchema;
    }

    return currentSchema;
}
