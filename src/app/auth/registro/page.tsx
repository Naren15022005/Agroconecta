import RegisterClient from '@/components/RegisterClient';

export default async function RegistroPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const roleRaw = Array.isArray(params?.role) ? params?.role[0] : params?.role;
  const role = roleRaw ? String(roleRaw) : '';
  return <RegisterClient initialRole={role} />;
}
