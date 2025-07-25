import { ReactNode } from 'react';
import NavMenu from '../../components/NavMenu';

export default function AgricultorLayout({ children }: { children: ReactNode }) {
  return (
    <NavMenu>
      {children}
    </NavMenu>
  );
}
