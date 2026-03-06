import RegisterClient from '@/components/RegisterClient';

export default function RegistroPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const roleRaw = Array.isArray(searchParams?.role) ? searchParams?.role[0] : searchParams?.role;
  const role = roleRaw ? String(roleRaw) : '';
  return <RegisterClient initialRole={role} />;
}
