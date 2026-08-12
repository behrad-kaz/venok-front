'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Users, CheckCircle, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: any[]) => twMerge(clsx(inputs));

interface AssignableEmployee {
  id: number;
  name: string;
  department: string;
  tickets: number;
  role?: string;
}

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (staffId: number) => void;
  employees: AssignableEmployee[];
  currentAssignee?: string;
  isAdmin: boolean;
  departmentName?: string;
  isLoading?: boolean;
}

export function AssignModal({
  isOpen,
  onClose,
  onAssign,
  employees,
  currentAssignee,
  isAdmin,
  departmentName,
  isLoading = false,
}: AssignModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const filteredEmployees = (employees || []).filter(emp => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(query) ||
      emp.department?.toLowerCase().includes(query)
    );
  });

  const handleAssign = () => {
    if (selectedId) {
      onAssign(selectedId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[1001] flex items-center justify-center p-4"
          >
            <div
              ref={modalRef}
              className="w-full max-w-md bg-[rgba(13,27,23,0.98)] border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-[rgba(255,255,255,0.1)]">
                <div>
                  <h3 className="text-base font-bold text-white">
                    تخصیص گفتگو
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {isAdmin 
                      ? 'انتخاب مسئول جدید برای این گفتگو'
                      : `انتخاب کارمند دپارتمان ${departmentName || ''}`
                    }
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 border-b border-[rgba(255,255,255,0.1)]">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="جستجو بر اساس نام یا دپارتمان..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white placeholder:text-gray-500 focus:outline-none focus:border-[#59D8C3] transition-colors"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto p-4 space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-[rgba(255,255,255,0.05)] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.3)] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[rgba(89,216,195,0.5)]">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#59D8C3] animate-spin" />
                    <span className="mr-3 text-gray-400 text-sm">در حال بارگذاری...</span>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      {searchQuery ? 'هیچ کارمندی با این جستجو یافت نشد' : 'هیچ کارمندی برای تخصیص وجود ندارد'}
                    </p>
                    {!searchQuery && (
                      <p className="text-gray-500 text-xs mt-1">
                        ابتدا یک کارمند ایجاد کنید یا مطمئن شوید که API به درستی کار می‌کند.
                      </p>
                    )}
                  </div>
                ) : (
                  filteredEmployees.map((emp) => {
                    const isSelected = selectedId === emp.id;
                    const isCurrent = currentAssignee === emp.name;
                    
                    return (
                      <button
                        key={emp.id}
                        onClick={() => setSelectedId(emp.id)}
                        className={cn(
                          'w-full text-right p-4 rounded-xl transition-all border flex items-center justify-between',
                          isSelected
                            ? 'bg-[rgba(89,216,195,0.12)] border-[rgba(89,216,195,0.25)]'
                            : 'bg-[rgba(255,255,255,0.02)] border-transparent hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.1)]'
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-[rgba(89,216,195,0.1)] border border-[rgba(89,216,195,0.2)] flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-[#59D8C3]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate">
                                {emp.name || 'بدون نام'}
                              </p>
                              {isCurrent && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(89,216,195,0.12)] text-[#59D8C3] border border-[rgba(89,216,195,0.2)]">
                                  جاری
                                </span>
                              )}
                              {emp.role === 'department_manager' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(242,184,75,0.12)] text-[#F2B84B] border border-[rgba(242,184,75,0.2)]">
                                  مدیر
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {emp.department || 'بدون دپارتمان'} · {emp.tickets || 0} گفتگوی باز
                            </p>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-[#59D8C3] flex-shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-[rgba(255,255,255,0.1)] flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-[rgba(255,255,255,0.03)] text-gray-500 border border-[rgba(255,255,255,0.1)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-all"
                >
                  انصراف
                </button>
                <button
                  onClick={handleAssign}
                  disabled={!selectedId || isLoading}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
                    selectedId && !isLoading
                      ? 'bg-gradient-to-r from-[#59D8C3] to-[#5BE0A8] text-[#06110F] hover:shadow-lg'
                      : 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      در حال تخصیص...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      تخصیص
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}