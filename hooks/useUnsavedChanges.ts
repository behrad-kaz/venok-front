// hooks/useUnsavedChanges.ts

import { useEffect, useRef, useState } from "react";

export function useUnsavedChanges<T>(initialData: T, currentData: T) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialDataRef = useRef(initialData);

  useEffect(() => {
    // بررسی عمیق برای تشخیص تغییرات
    const hasChanges = JSON.stringify(initialDataRef.current) !== JSON.stringify(currentData);
    setHasUnsavedChanges(hasChanges);
  }, [currentData]);

  const resetChanges = () => {
    initialDataRef.current = currentData;
    setHasUnsavedChanges(false);
  };

  return { hasUnsavedChanges, resetChanges };
}