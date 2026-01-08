"use client";
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  variant?: 'light' | 'dark';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  variant = 'light',
  showCloseButton = true,
  closeOnOverlayClick = true 
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  const backdropClassName =
    variant === 'dark'
      ? 'bg-black/60 backdrop-blur-sm'
      : 'bg-gray-300 bg-opacity-40';

  const containerClassName =
    variant === 'dark'
      ? 'bg-neutral-900 text-neutral-100 border border-neutral-700'
      : 'bg-white';

  const closeButtonClassName =
    variant === 'dark'
      ? 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100'
      : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600';

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 transition-opacity ${backdropClassName}`}
        onClick={handleOverlayClick}
      />
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl shadow-2xl transition-all max-h-[90vh] ${containerClassName}`}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className={`absolute right-4 top-4 z-10 rounded-full p-2 transition-colors ${closeButtonClassName}`}
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
}
