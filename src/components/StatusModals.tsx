"use client";
import Modal from './Modal';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  subMessage?: string | React.ReactNode;
  actionButton?: React.ReactNode;
  showProgress?: boolean;
  progressText?: string;
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  subMessage,
  actionButton,
  showProgress = false,
  progressText 
}: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <div className="p-8 text-center">
        {/* Animated success icon */}
        <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-4 leading-relaxed">
          {message}
        </p>
        
        {showProgress && progressText && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-800 font-medium text-sm">{progressText}</span>
            </div>
            {subMessage && (
              typeof subMessage === 'string' ? (
                <p className="text-green-600 text-xs">
                  {subMessage}
                </p>
              ) : (
                <div className="text-green-600 text-xs">
                  {subMessage}
                </div>
              )
            )}
          </div>
        )}
        
        {!showProgress && subMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            {typeof subMessage === 'string' ? (
              <p className="text-green-700 text-sm">
                {subMessage}
              </p>
            ) : (
              subMessage
            )}
          </div>
        )}
        
        {actionButton && (
          <div className="mt-6">
            {actionButton}
          </div>
        )}
      </div>
    </Modal>
  );
}

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  suggestions?: string[];
  actionButton?: React.ReactNode;
}

export function ErrorModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  suggestions,
  actionButton 
}: ErrorModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 text-center">
        {/* Animated error icon */}
        <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
          <AlertCircle className="h-12 w-12 text-white" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-4 leading-relaxed">
          {message}
        </p>
        
        {suggestions && suggestions.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm font-medium mb-2">Posibles soluciones:</p>
            <ul className="text-red-700 text-xs space-y-1 text-left">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {actionButton && (
          <div className="mt-6">
            {actionButton}
          </div>
        )}
      </div>
    </Modal>
  );
}
