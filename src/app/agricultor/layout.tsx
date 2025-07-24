import { ReactNode } from 'react';
import NavMenu from '../../components/NavMenu';

export default function AgricultorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavMenu />
      {children}
    </div>
  );
}
