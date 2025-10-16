import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useModelStore, type DialogOptions } from "@/store/ModelStore";
import { commonIcons } from "@/assets";
import { cn } from "@/lib/utils";

type DialogButton = NonNullable<DialogOptions["buttons"]>[number];

export function GlobalAlertDialog() {
  const { showAlertDialog, setShowAlertDialog, options, newAlert } = useModelStore();
  const [buttonsClicked, setButtonsClicked] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (options) {
      newAlert(options);
      setButtonsClicked({});
    }
  }, [options, newAlert, showAlertDialog]);

  const handleClose = () => {
    setShowAlertDialog(false);
  };

  const handleButtonClick = async (button: DialogButton, index: number) => {
    try {
      // Prevent multiple clicks on the same button
      setButtonsClicked((prev) => ({ ...prev, [index]: true }));
      const result = await button.action();
      setButtonsClicked((prev) => ({ ...prev, [index]: false }));
      if (button.closeOnSuccess !== false) {
        handleClose();
      }
      setTimeout(() => {
        button?.onSuccess?.(result);
      }, 100); // Delay to allow UI updates
    } catch (error) {
      if (button.closeOnFailure !== false) {
        handleClose();
      }
      setButtonsClicked((prev) => ({ ...prev, [index]: false }));
      setTimeout(() => {
        button?.onFailure?.(error);
      }, 100); // Delay to allow UI updates
    }
  };

  const getIcon = () => {
    if (!options?.icon) return null;

    const iconMap = {
      success: commonIcons.StatusSuccessIcon,
      error: commonIcons.StatusErrorIcon,
      warning: commonIcons.StatusWarningIcon,
      info: commonIcons.StatusInfoIcon,
      question: commonIcons.QuestionMark,
      download: null,
    };

    const IconSrc = iconMap[options.icon];
    if (!IconSrc) return null;

    return (
      <div className="flex justify-center mb-4">
        <IconSrc className="w-12 h-12" />
      </div>
    );
  };

  const btnColor = (color: "primary" | "secondary" | "positive" | "negative" | "default" | undefined) => {
    switch (color) {
      case "primary":
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
      case "secondary":
        return "bg-secondary hover:bg-secondary/80 text-secondary-foreground";
      case "positive":
        return "bg-green-600 hover:bg-green-700 text-white";
      case "negative":
        return "bg-destructive hover:bg-destructive/90 text-destructive-foreground";
      default:
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
    }
  };

  if (!options || !showAlertDialog) return null;

  return (
    <AlertDialog
      open={showAlertDialog}
      onOpenChange={options.allowOutsideClick ? handleClose : undefined}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          {getIcon()}
          {options.title && (
            <AlertDialogTitle className="text-center text-sm font-semibold">
              {options.title}
            </AlertDialogTitle>
          )}
          {options.message && (
            <AlertDialogDescription className="text-center text-xs py-2">
              {options.message}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-center gap-2 sm:justify-center">
          {options.buttons?.map((button, index) => {
            if (button.hidden) return null;

            const isLoading = buttonsClicked[index] && button.onClickLoading;
            const isAnyButtonLoading = options.disableOnClick && Object.values(buttonsClicked).some((clicked) => clicked);

            return (
              <button
                key={index}
                onClick={() => handleButtonClick(button, index)}
                disabled={isAnyButtonLoading}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  "disabled:pointer-events-none disabled:opacity-50",
                  "h-9 px-4 py-2 w-[40%]",
                  btnColor(button.color)
                )}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{button.title}</span>
                  </div>
                ) : (
                  button.title
                )}
              </button>
            );
          })}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
