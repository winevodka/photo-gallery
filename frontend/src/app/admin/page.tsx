import { getAlbums } from '@/lib/api';
import AdminDashboard from '@/components/AdminDashboard';

export default async function AdminPage() {
  let albums;
  try {
    ({ items: albums } = await getAlbums(1, 100));
  } catch (error) {
    console.error('Failed to load albums:', error);
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-bold">Admin — Albums</h1>
        <p className="text-red-500">
          Không thể kết nối tới backend API. Kiểm tra biến môi trường
          NEXT_PUBLIC_API_BASE_URL và đảm bảo backend đang chạy.
        </p>
      </main>
    );
  }

  return <AdminDashboard initialAlbums={albums} />;
}
