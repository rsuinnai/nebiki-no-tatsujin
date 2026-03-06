import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ✅ ここが重要（await する）
  const params = await searchParams;
  const query = params?.q ?? "";

  let request = supabase
    .from("reports")
    .select(`
      id,
      discount_time,
      created_at,
      stores (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (query) {
    request = request.ilike("stores.name", `%${query}%`);
  }

  const { data: reports } = await request;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">

        <h1 className="text-2xl font-bold">値引き店舗一覧</h1>

        {/* 🔎 検索フォーム */}
        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="店舗名で検索"
            className="flex-1 rounded-lg border px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            検索
          </button>
        </form>

        {(!reports || reports.length === 0) && (
          <p className="text-gray-500">該当する店舗がありません</p>
        )}

        <div className="space-y-4">
          {reports?.map((report) => (
            <Link
              key={report.id}
              href={`/stores/${report.stores?.[0]?.id}`}
              className="block rounded-lg bg-white p-4 shadow hover:bg-gray-50 transition"
            >
              <p className="font-semibold text-gray-800">
                {report.stores?.name}
              </p>

              <p className="text-sm text-gray-600 mt-1">
                値引き開始：{report.discount_time?.slice(0, 5)}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {report.created_at?.slice(0, 16).replace("T", " ")}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}