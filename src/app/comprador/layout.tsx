import { ReactNode } from 'react';

export default function CompradorLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* Aquí irá el menú y layout para compradores */}
      {children}
    </div>
  );
}
