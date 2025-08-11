'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function Toast({ type, message, isVisible, onClose, autoClose = true, duration = 3000 }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      if (autoClose && type !== 'loading') {
        const timer = setTimeout(() => {
          setShow(false);
          setTimeout(() => onClose?.(), 300);
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setShow(false);
    }
  }, [isVisible, autoClose, duration, onClose, type]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'loading':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'loading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'loading':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div 
        className={`
          ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
          transition-all duration-300 ease-out
          ${getBgColor()}
          ${getTextColor()}
          pointer-events-auto
          px-6 py-4 rounded-xl shadow-lg border-2
          flex items-center gap-3
          max-w-md mx-4
          backdrop-blur-sm
        `}
      >
        {getIcon()}
        <span className="font-medium text-sm">{message}</span>
        {type !== 'loading' && onClose && (
          <button
            onClick={() => {
              setShow(false);
              setTimeout(() => onClose(), 300);
            }}
            className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
