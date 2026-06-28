// components/ui/modal/Modal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { ModalOptions, ModalVariant } from "./types";

interface ModalProps extends ModalOptions {
  isOpen: boolean;
  onClose: () => void;
}

const variantConfig: Record<ModalVariant, {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  titleColor: string;
}> = {
  info: {
    icon: <Info className="w-6 h-6" />,
    iconColor: "text-[#4dabf7]",
    iconBg: "bg-[rgba(77,171,247,0.12)]",
    borderColor: "border-[rgba(77,171,247,0.25)]",
    titleColor: "text-[#4dabf7]",
  },
  success: {
    icon: <CheckCircle className="w-6 h-6" />,
    iconColor: "text-[#5BE0A8]",
    iconBg: "bg-[rgba(91,224,168,0.12)]",
    borderColor: "border-[rgba(91,224,168,0.25)]",
    titleColor: "text-[#5BE0A8]",
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6" />,
    iconColor: "text-[#F2B84B]",
    iconBg: "bg-[rgba(242,184,75,0.12)]",
    borderColor: "border-[rgba(242,184,75,0.25)]",
    titleColor: "text-[#F2B84B]",
  },
  error: {
    icon: <AlertCircle className="w-6 h-6" />,
    iconColor: "text-[#FF6B6B]",
    iconBg: "bg-[rgba(255,107,107,0.12)]",
    borderColor: "border-[rgba(255,107,107,0.25)]",
    titleColor: "text-[#FF6B6B]",
  },
  confirm: {
    icon: <AlertCircle className="w-6 h-6" />,
    iconColor: "text-[#59D8C3]",
    iconBg: "bg-[rgba(89,216,195,0.12)]",
    borderColor: "border-[rgba(89,216,195,0.25)]",
    titleColor: "text-[#59D8C3]",
  },
};

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  variant = "info",
  icon: customIcon,
  confirmButton,
  cancelButton,
  onConfirm,
  onCancel,
  closeOnOutsideClick = true,
  showCloseButton = true,
}: ModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const config = variantConfig[variant];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleClose = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const handleConfirm = async () => {
    if (confirmButton?.isLoading) return;
    
    setIsLoading(true);
    try {
      if (onConfirm) {
        await onConfirm();
      }
      if (confirmButton?.onClick) {
        await confirmButton.onClick();
      }
    } catch (error) {
      console.error("Modal confirm error:", error);
    } finally {
      setIsLoading(false);
      if (!confirmButton?.isLoading) {
        onClose();
      }
    }
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const iconElement = customIcon || config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleOutsideClick}
            className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: "spring", damping: 25 }}
              className="relative w-full max-w-md rounded-3xl bg-[rgba(9,22,18,0.98)] border border-[rgba(255,255,255,0.1)] shadow-2xl overflow-hidden"
            >
              {/* دکمه بستن */}
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-2xl mt-1 mr-1 flex items-center justify-center text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200 z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* محتوای مودال */}
              <div className="p-6 sm:p-8">
                {/* آیکون */}
                <div className="flex justify-center mb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${config.iconBg} border ${config.borderColor}`}
                  >
                    <div className={config.iconColor}>{iconElement}</div>
                  </div>
                </div>

                {/* عنوان */}
                {title && (
                  <h3
                    className={`text-xl font-bold text-center mb-2 ${config.titleColor}`}
                  >
                    {title}
                  </h3>
                )}

                {/* پیام */}
                <p className="text-sm text-gray-300 text-center leading-relaxed whitespace-pre-wrap">
                  {message}
                </p>

                {/* دکمه‌ها */}
                <div className="flex items-center justify-center gap-3 mt-6">
                  {/* دکمه انصراف */}
                  {cancelButton && (
                    <button
                      onClick={handleClose}
                      disabled={cancelButton.isLoading}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancelButton.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      ) : (
                        cancelButton.label || "انصراف"
                      )}
                    </button>
                  )}

                  {/* دکمه تایید */}
                  {(confirmButton || onConfirm) && (
                    <button
                      onClick={handleConfirm}
                      disabled={isLoading || confirmButton?.isLoading}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed ${
                        variant === "error" || variant === "warning"
                          ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF8E8E] text-white hover:shadow-lg hover:shadow-[#FF6B6B]/25"
                          : "bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg hover:shadow-[#59D8C3]/25"
                      }`}
                    >
                      {isLoading || confirmButton?.isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        confirmButton?.label || "تایید"
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* خط تزئینی پایین */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#59D8C3] via-[#5BE0A8] to-[#59D8C3] opacity-50" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}