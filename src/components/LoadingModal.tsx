"use client";
import Modal from './Modal';

interface LoadingModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  showSpinner?: boolean;
}

export function LoadingModal({ 
  isOpen, 
  title, 
  message,
  showSpinner = true 
}: LoadingModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => {}} closeOnOverlayClick={false} showCloseButton={false}>
      <div className="p-8 text-center">
        {/* Animated loading icon */}
        {showSpinner && (
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-blue-700 text-sm mt-2 font-medium">
            Procesando solicitud...
          </p>
        </div>
      </div>
    </Modal>
  );
}
