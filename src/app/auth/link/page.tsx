import LinkAccountClient from '@/components/LinkAccountClient';

export default function LinkAccountPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const email = Array.isArray(searchParams?.email) ? searchParams?.email[0] : (searchParams?.email || '');
  const provider = Array.isArray(searchParams?.provider) ? searchParams?.provider[0] : (searchParams?.provider || '');
  const providerAccountId = Array.isArray(searchParams?.providerAccountId) ? searchParams?.providerAccountId[0] : (searchParams?.providerAccountId || '');

  return (
    <LinkAccountClient email={String(email)} provider={String(provider)} providerAccountId={String(providerAccountId)} />
  );
}
