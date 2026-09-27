'use client';

import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /**
   * Extra warning shown above the buttons. Used when the delete cascades to
   * other records, so the consequence is stated before confirming.
   */
  warning?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  warning,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card text-card-foreground border border-border rounded-3xl w-full max-w-sm shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 text-center">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto text-xl font-black">
          🗑️
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-base text-foreground">تأكيد عملية الحذف النهائية</h3>
          <p className="text-xs text-muted-foreground">
            هل أنت تأكد من رغبتك في حذف "<span className="font-bold text-foreground">{title}</span>"؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
        </div>
        {warning && (
          <p className="text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
            {warning}
          </p>
        )}
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-input text-xs font-bold hover:bg-muted"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold shadow-md shadow-destructive/20 hover:opacity-90"
          >
            نعم، قم بالحذف
          </button>
        </div>
      </div>
    </div>
  );
};
