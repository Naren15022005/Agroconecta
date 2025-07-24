import { redirect } from 'next/navigation';

export default function AgricultorHome() {
  redirect('/agricultor/mercado');
  return null;
}
