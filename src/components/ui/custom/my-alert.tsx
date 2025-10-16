import React from "react";
import { createRoot } from "react-dom/client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type MyAlertProps = {
    children?: React.ReactNode;
    title: React.ReactNode;
    description: React.ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    isDangerous?: boolean;
};

const MyAlert = ({
    children,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "Continue",
    cancelText = "Cancel",
    open,
    onOpenChange,
    isDangerous = false,
}: MyAlertProps) => {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader className="gap-2">
                    <div className="w-full flex justify-center sm:justify-start">
                        <AlertDialogTitle className="flex items-center">
                            {title}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-center sm:text-left">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel
                        onClick={onCancel}
                        className="mt-0 cursor-pointer"
                    >
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={
                            isDangerous
                                ? "bg-destructive hover:bg-destructive/90 cursor-pointer"
                                : "cursor-pointer"
                        }
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

type AlertOptions = {
    title: React.ReactNode;
    description: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    isDangerous?: boolean;
};

export const ShowAlert = (options: AlertOptions): Promise<boolean> => {
    return new Promise((resolve) => {
        const container = document.createElement("div");
        document.body.appendChild(container);

        const root = createRoot(container);

        const cleanup = () => {
            root.unmount();
            if (container.parentNode === document.body) {
                document.body.removeChild(container);
            }
        };

        const handleConfirm = () => {
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            cleanup();
            resolve(false);
        };

        const handleOpenChange = (open: boolean) => {
            if (!open) handleCancel();
        };

        root.render(
            <MyAlert
                title={options.title}
                description={options.description}
                confirmText={options.confirmText}
                cancelText={options.cancelText}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                isDangerous={options.isDangerous}
                open={true}
                onOpenChange={handleOpenChange}
            />
        );
    });
};

export default MyAlert;
