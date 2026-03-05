import { createClient } from "@supabase/supabase-js";
import { isHolidayToday } from "../src/lib/date";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const holiday = isHolidayToday();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 今日の値引き
  const { data: reports } = await supabase
    .from("reports")
    .select(`
      id,
      discount_time,
      created_at,
      store_id,
      stores (
        id,
        name
      )
    `)
    .eq("is_holiday", holiday)
    .order("created_at", { ascending: false })
    .limit(5);

  // 🔥 掲示板（全件取得 → 店舗ごとに最新1件にする）
  const { data: boardPosts } = await supabase
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

  // 🔥 店舗ごとに1件だけ残す
  const latestByStore = new Map<number, any>();

  boardPosts?.forEach((post) => {
    if (!latestByStore.has(post.store_id) && post.stores?.id) {
      latestByStore.set(post.store_id, post);
    }
  });

  // 上位5店舗だけ表示
  const latestBoard = Array.from(latestByStore.values()).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-10">

        {/* ヒーロー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            値引きの達人
          </h1>
          <p className="mt-2 text-gray-500">
            スーパーの値引き開始時間をみんなで共有
          </p>
        </div>

        {/* 今日の値引き */}
        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            今日（{holiday ? "休日" : "平日"}）の値引き情報
          </h2>

          {(!reports || reports.length === 0) && (
            <p className="text-gray-500">まだ投稿がありません</p>
          )}

          <div className="space-y-3">
            {reports?.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between border-b pb-2 last:border-none"
              >
                <Link
                  href={`/stores/${report.stores?.id}`}
                  className="font-medium text-gray-800 hover:underline"
                >
                  {report.stores?.name ?? "店舗不明"}
                </Link>

                <Link
                  href={`/reports/${report.id}`}
                  className="text-xl font-bold text-blue-600 hover:underline"
                >
                  {report.discount_time?.slice(0, 5)}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* 🔥 掲示板（店舗ごと最新1件） */}
        <section className="rounded-xl bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">掲示板（最新）</h2>
            <Link
              href="/board"
              className="text-sm text-blue-600 hover:underline"
            >
              すべて見る
            </Link>
          </div>

          {latestBoard.length === 0 && (
            <p className="text-gray-500">まだ投稿がありません</p>
          )}

          <ul className="space-y-4">
            {latestBoard.map((post) => (
              <li key={post.store_id}>
                <Link
                  href={`/stores/${post.store_id}`}
                  className="block rounded-lg border p-4 hover:bg-gray-50 transition"
                >
                  <p className="font-semibold text-gray-800">
                    {post.stores?.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-700 line-clamp-2">
                    {post.content}
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {post.created_at
                      ? post.created_at.slice(0, 16).replace("T", " ")
                      : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ボタン */}
        <div className="flex gap-4">
          <Link
            href="/reports"
            className="flex-1 rounded-lg border py-3 text-center hover:bg-gray-100"
          >
            値引き店舗一覧
          </Link>

          <Link
            href="/reports/new"
            className="flex-1 rounded-lg bg-blue-600 py-3 text-center text-white hover:bg-blue-700"
          >
            値引きを投稿
          </Link>

          <Link
            href="/chat"
            className="flex-1 rounded-lg bg-green-600 py-3 text-center text-white hover:bg-green-700"
          >
            雑談チャット
          </Link>
        </div>

      </div>
    </div>
  );
}