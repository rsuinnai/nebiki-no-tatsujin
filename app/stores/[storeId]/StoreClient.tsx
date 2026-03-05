"use client";

import Link from "next/link";

type Report = {
  id: number;
  discount_time: string;
  comment: string | null;
  created_at: string;
};

type Post = {
  id: number;
  name: string | null;
  body: string;
  created_at: string;
};

export default function StoreClient({
  store,
  reports,
  posts,
}: {
  store: { id: number; name: string };
  reports: Report[];
  posts: Post[];
}) {
  return (
    <main className="mx-auto max-w-2xl space-y-10 px-4 py-6">
      {/* 店舗名 */}
      <h1 className="text-2xl font-bold">{store.name}</h1>

      {/* 値引きレポート */}
      <section className="space-y-3">
        <h2 className="font-semibold">値引きレポート</h2>

        {reports.length === 0 && (
          <p className="text-sm text-gray-500">
            まだレポートがありません
          </p>
        )}

        {reports.map((r) => (
          <div
            key={r.id}
            className="rounded-xl border bg-white p-4 text-sm shadow-sm"
          >
            <div className="text-xl font-bold text-blue-600">
              {r.discount_time.slice(0, 5)}
            </div>
            {r.comment && (
              <div className="mt-2 text-gray-700">
                {r.comment}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* 掲示板 */}
<section className="space-y-3">
  <div className="flex justify-between items-center">
    <h2 className="font-semibold">掲示板</h2>
    <Link
      href={`/stores/${store.id}/board/new`}
      className="text-sm text-blue-600 hover:underline"
    >
      書き込む
    </Link>
  </div>

  {posts.length === 0 && (
    <p className="text-sm text-gray-500">
      まだ投稿がありません
    </p>
  )}

  {posts.map((p) => (
    <div
      key={p.id}
      className="rounded border bg-white p-3 text-sm"
    >
      <div className="text-xs text-gray-500">
        {p.name || "匿名"} /{" "}
        {p.created_at.slice(0, 16).replace("T", " ")}
      </div>
      <div className="mt-1 whitespace-pre-wrap">
        {p.body}
      </div>
    </div>
  ))}
</section>
    </main>
  );
}
