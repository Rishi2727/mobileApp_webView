import { create } from 'zustand';

type DialogButton = {
  title: string;
  hidden?: boolean;
  color: "primary" | "secondary" | "positive" | "negative" | "default" | undefined;
  action: () => Promise<any> | void;
  onSuccess?: (result?: any) => void;
  onFailure?: (error: any) => void;
  onClickLoading?: boolean;
  closeOnSuccess?: boolean;
  closeOnFailure?: boolean;
};

export type iconsType = "success" | "error" | "info" | "warning" | "question" | "download";

export type DialogOptions = {
  title?: string;
  message: string;
  allowOutsideClick?: boolean;
  disableOnClick?: boolean;
  icon?: iconsType;
  buttons: DialogButton[];
  name?: string;
};

type ModelStore = {
    showAlertDialog: boolean;
    setShowAlertDialog: (show: boolean) => void;
    options: DialogOptions | null;
    newAlert: (opts: DialogOptions) => void;
    closeAlert: (name?: string) => void;
};

export const useModelStore = create<ModelStore>((set, get) => ({
    showAlertDialog: false,
    setShowAlertDialog: (show: boolean) => {
        set({ showAlertDialog: show });
        set({ options: null }); // Reset options when dialog is closed
    },
    options: null,
    newAlert: (opts: DialogOptions) => {
        set({ options: opts });
        set({ showAlertDialog: true });
    },
    closeAlert: (name?: string) => {
      if (get().options?.name === name && !!name) {
          set({ showAlertDialog: false });
          set({ options: null }); // Reset options for the specific alert
      }
    }
}));