import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* Aquí irá el menú y layout para administradores */}
      {children}
    </div>
  );
}
