// components/ui/modal/ModalProvider.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import Modal from "./Modal";
import { ModalOptions, ModalContextType, ModalVariant } from "./types";

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions>({
    message: "",
    variant: "info",
  });

  const showModal = (newOptions: ModalOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
  };

  const showInfo = (message: string, title?: string) => {
    showModal({ message, title, variant: "info" });
  };

  const showSuccess = (message: string, title?: string) => {
    showModal({ message, title, variant: "success" });
  };

  const showWarning = (message: string, title?: string) => {
    showModal({ message, title, variant: "warning" });
  };

  const showError = (message: string, title?: string) => {
    showModal({ message, title, variant: "error" });
  };

  const showConfirm = (
    message: string,
    title?: string,
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    showModal({
      message,
      title,
      variant: "confirm",
      onConfirm,
      onCancel,
      confirmButton: {
        label: "بله، مطمئنم",
        onClick: onConfirm,
      },
      cancelButton: {
        label: "انصراف",
        onClick: onCancel,
      },
    });
  };

  return (
    <ModalContext.Provider
      value={{
        showModal,
        showInfo,
        showSuccess,
        showWarning,
        showError,
        showConfirm,
        hideModal,
      }}
    >
      {children}
      <Modal
        isOpen={isOpen}
        onClose={hideModal}
        {...options}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}