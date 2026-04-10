import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import ListingDetailView, { type ListingDetailData } from '@/components/listings/ListingDetailView';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

function decodeAuthCookie(token: string): { userId: number } | null {
  try {
    const [, payloadBase64] = token.split('.');
    const json = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload = JSON.parse(json) as { userId?: unknown };
    if (typeof payload.userId === 'number') return { userId: payload.userId };
    return null;
  } catch {
    return null;
  }
}

async function getListing(id: string): Promise<ListingDetailData | null> {
  const cookieStore = await cookies();
  const res = await fetch(`${API_URL}/listings/${id}`, {
    headers: {
      Cookie: cookieStore.toString(),
    },
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return res.json() as Promise<ListingDetailData>;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token')?.value;
  const authUser = authToken ? decodeAuthCookie(authToken) : null;

  return (
    <ListingDetailView
      listing={listing}
      user={authUser ? { id: authUser.userId } : null}
      apiBase={API_URL}
    />
  );
}
