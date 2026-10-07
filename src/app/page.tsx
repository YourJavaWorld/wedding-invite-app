import { WeddingInvite } from '@/components/wedding-invite';

type HomePageProps = {
  searchParams: Promise<{ nume?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const queryName = (await searchParams).nume;
  const inviteeName = (Array.isArray(queryName) ? queryName[0] : queryName)?.trim().slice(0, 100);

  return <WeddingInvite inviteeName={inviteeName || undefined} />;
}
