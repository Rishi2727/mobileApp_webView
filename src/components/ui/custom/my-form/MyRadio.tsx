import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export interface MyRadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface MyRadioProps {
  field: {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    name: string;
    ref?: React.Ref<unknown>;
  };
  options: MyRadioOption[];
  className?: string;
  itemClassName?: string;
  groupProps?: React.ComponentProps<typeof RadioGroup>;
  direction?: "vertical" | "horizontal";
}

const MyRadio: React.FC<MyRadioProps> = ({
  field,
  options,
  className,
  itemClassName,
  groupProps,
  direction = "vertical",
}) => {
  const layoutClass =
    direction === "horizontal"
      ? "flex flex-row flex-wrap gap-x-6 gap-y-2 mt-1"
      : "flex flex-col gap-2 mt-1";

  return (
    <RadioGroup
      value={field.value}
      onValueChange={field.onChange}
      name={field.name}
      className={className}
      {...groupProps}
    >
      <div className={layoutClass}>
        {options.map((opt) => (
          <label
            key={opt.value}
            htmlFor={`${field.name}-${opt.value}`}
            className="flex items-center gap-2 cursor-pointer"
            style={direction === "horizontal" ? { minWidth: 0 } : undefined}
          >
            <RadioGroupItem
              value={opt.value}
              id={`${field.name}-${opt.value}`}
              className={itemClassName}
              disabled={opt.disabled}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </RadioGroup>
  );
};

export default MyRadio;
