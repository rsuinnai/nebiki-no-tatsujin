import Link from "next/link";
import { supabase } from "../../src/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BoardPage() {
  const { data } = await supabase
    .from("store_messages")
    .select(`
      id,
      content,
      created_at,
      store_id,
      stores (
        id,
        name
      )
    `)
    .not("store_id", "is", null)
    .order("created_at", { ascending: false });

  // 🔥 店舗ごとに最新1件だけ残す
  const latestByStore = new Map();

  data?.forEach((row) => {
    if (!latestByStore.has(row.store_id) && row.stores?.id) {
      latestByStore.set(row.store_id, row);
    }
  });

  const stores = Array.from(latestByStore.values());

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        <h1 className="text-2xl font-bold text-gray-800">
          店舗掲示板一覧
        </h1>

        {stores.length === 0 && (
          <p className="text-gray-500">まだ掲示板はありません</p>
        )}

        {stores.map((post) => (
          <Link
            key={post.store_id}
            href={`/stores/${post.store_id}`}
            className="block"
          >
            <div className="rounded-xl bg-white p-6 shadow-sm border hover:shadow-md transition cursor-pointer">

              <h2 className="text-lg font-semibold text-gray-800">
                {post.stores.name}
              </h2>

              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {post.content}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {new Date(post.created_at).toLocaleString()}
              </p>

            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}