import React, { useEffect, useState } from 'react';

interface NotificacionFlotanteProps {
  mensaje: string;
  visible: boolean;
  onClose?: () => void;
  tiempo?: number; // ms
}

const NotificacionFlotante: React.FC<NotificacionFlotanteProps> = ({ mensaje, visible, onClose, tiempo = 4000 }) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (visible) {
      const timer = setTimeout(() => {
        setShow(false);
        if (onClose) onClose();
      }, tiempo);
      return () => clearTimeout(timer);
    }
  }, [visible, tiempo, onClose]);

  if (!show) return null;

  return (
    <div className="fixed left-6 bottom-8 z-50 animate-fade-in-out">
      <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-[260px] max-w-xs border-l-8 border-green-800">
        <span className="text-2xl">📦</span>
        <span className="font-semibold text-base">{mensaje}</span>
      </div>
    </div>
  );
};

export default NotificacionFlotante;
