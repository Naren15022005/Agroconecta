import { ReactNode } from 'react';
import NavMenu from '../../components/NavMenu';

export default function MercadoLayout({ children }: { children: ReactNode }) {
  return (
    <NavMenu>
      {children}
    </NavMenu>
  );
}
