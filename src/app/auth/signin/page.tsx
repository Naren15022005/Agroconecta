import SignInClient from '@/components/SignInClient';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const activatedRaw = Array.isArray(params?.activated) ? params?.activated[0] : params?.activated;
  const activated = activatedRaw === 'true';
  return <SignInClient activated={activated} />;
}
