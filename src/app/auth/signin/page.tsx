import SignInClient from '@/components/SignInClient';

export default function SignInPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const activatedRaw = Array.isArray(searchParams?.activated) ? searchParams?.activated[0] : searchParams?.activated;
  const activated = activatedRaw === 'true';
  return <SignInClient activated={activated} />;
}
