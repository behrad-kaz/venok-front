// components/ui/modal/types.ts

export type ModalVariant = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface ModalButton {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  isLoading?: boolean;
}

export interface ModalOptions {
  title?: string;
  message: string;
  variant?: ModalVariant;
  icon?: React.ReactNode;
  confirmButton?: ModalButton;
  cancelButton?: ModalButton;
  onClose?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
}

export interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  showInfo: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showConfirm: (message: string, title?: string, onConfirm?: () => void, onCancel?: () => void) => void;
  hideModal: () => void;
}