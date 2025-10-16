import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
  const { showAlertDialog, setShowAlertDialog, options } = useModelStore();
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  useEffect(() => {
    if (!showAlertDialog) {
      setLoadingButton(null);
    }
  }, [showAlertDialog]);

  const handleClose = () => {
    if (!options?.disableOnClick) {
      setShowAlertDialog(false);
    }
  };

  const handleButtonClick = async (button: DialogButton) => {
    if (button.onClickLoading) {
      setLoadingButton(button.title);
    }

    try {
      const result = await button.action();

      if (button.onSuccess) {
        button.onSuccess(result);
      }

      if (button.closeOnSuccess) {
        setShowAlertDialog(false);
      }
    } catch (error) {
      if (button.onFailure) {
        button.onFailure(error);
      }

      if (button.closeOnFailure) {
        setShowAlertDialog(false);
      }
    } finally {
      setLoadingButton(null);
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
        <IconSrc className="w-16 h-16" />
      </div>
    );
  };

  if (!options) return null;

  return (
    <AlertDialog open={showAlertDialog} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {getIcon()}
          {options.title && (
            <AlertDialogTitle className="text-center">
              {options.title}
            </AlertDialogTitle>
          )}
          <AlertDialogDescription className="text-center">
            {options.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-center gap-2">
          {options.buttons?.map((button, index) => {
            if (button.hidden) return null;

            const isLoading = loadingButton === button.title;

            // Determine button class based on color
            const buttonClassName = cn(
              button.color === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
              button.color === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              button.color === "positive" && "bg-success text-white hover:bg-success/90",
              button.color === "negative" && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            );

            // Determine if this is a cancel/no button
            const isCancel =
              button.title.toLowerCase() === "cancel" ||
              button.title.toLowerCase() === "no";

            if (isCancel) {
              return (
                <AlertDialogCancel
                  key={index}
                  onClick={() => {
                    if (button.action) {
                      button.action();
                    }
                  }}
                  disabled={isLoading || !!loadingButton}
                  className="mt-0"
                >
                  {button.title}
                </AlertDialogCancel>
              );
            }

            return (
              <AlertDialogAction
                key={index}
                onClick={() => handleButtonClick(button)}
                disabled={isLoading || !!loadingButton}
                className={buttonClassName}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {button.title}
                  </div>
                ) : (
                  button.title
                )}
              </AlertDialogAction>
            );
          })}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
