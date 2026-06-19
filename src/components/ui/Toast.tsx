'use client';

import { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  type,
  message,
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const colors = {
    success: { bg: 'bg-success/10', border: 'border-success', text: 'text-success' },
    error: { bg: 'bg-error/10', border: 'border-error', text: 'text-error' },
    info: { bg: 'bg-secondary/10', border: 'border-secondary', text: 'text-secondary' },
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  const color = colors[type];

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center gap-3 px-4 py-3 rounded-card border backdrop-blur-sm transition-all duration-300 animate-slideInUp ${
        color.bg
      } ${color.border} border`}
      role="alert"
    >
      <div className={color.text}>{icons[type]}</div>
      <p className="text-sm text-text-primary flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-text-muted hover:text-text-primary transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
