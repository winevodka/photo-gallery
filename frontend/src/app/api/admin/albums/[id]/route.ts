import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const res = await fetch(`${API_BASE_URL}/albums/${params.id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-key': process.env.ADMIN_API_KEY ?? '',
    },
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
