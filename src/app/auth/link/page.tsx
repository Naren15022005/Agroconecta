import LinkAccountClient from '@/components/LinkAccountClient';

export default async function LinkAccountPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const email = Array.isArray(params?.email) ? params?.email[0] : (params?.email || '');
  const provider = Array.isArray(params?.provider) ? params?.provider[0] : (params?.provider || '');
  const providerAccountId = Array.isArray(params?.providerAccountId) ? params?.providerAccountId[0] : (params?.providerAccountId || '');

  return (
    <LinkAccountClient email={String(email)} provider={String(provider)} providerAccountId={String(providerAccountId)} />
  );
}
