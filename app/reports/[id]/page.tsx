import { supabase } from "../../../src/lib/supabase";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportDetailPage({ params }: Props) {
  // params は Promise なので await
  const { id } = await params;
  const reportId = Number(id);

  const { data: report, error } = await supabase
    .from("reports")
    .select(`
      id,
      discount_time,
      comment,
      created_at,
      is_holiday,
      stores (
        id,
        name
      )
    `)
    .eq("id", reportId)
    .single();

  if (error || !report) {
    return (
      <main className="mx-auto max-w-xl px-4 py-10">
        <p className="text-gray-500">レポートが見つかりません</p>
      </main>
    );
  }

  const storeId = report.stores?.id;

  return (
    <main className="mx-auto max-w-xl space-y-6 px-4 py-10">
      {/* 店舗名 */}
      <h1 className="text-xl font-bold">
        {report.stores?.name ?? "店舗不明"}
      </h1>
      <Link
  href={`/stores/${report.stores.id}`}
  className="inline-block text-sm text-blue-600 hover:underline"
>
  この店舗の掲示板を見る
</Link>


      {/* 値引き時間 */}
      <div className="text-3xl font-bold text-blue-600">
        {report.discount_time.slice(0, 5)}
      </div>

      {/* コメント */}
      {report.comment && (
        <p className="whitespace-pre-wrap text-gray-800">
          {report.comment}
        </p>
      )}

      {/* 日付 */}
      <div className="text-sm text-gray-400">
        {report.created_at?.slice(0, 10)}
        {report.is_holiday && " / 祝日"}
      </div>

      {/* ===== 掲示板導線 ===== */}
      {storeId && (
        <div className="flex gap-3 pt-4">
          <Link
            href={`/stores/${storeId}`}
            className="flex-1 rounded-lg border px-4 py-2 text-center text-sm hover:bg-gray-100"
          >
            この店舗の掲示板を見る
          </Link>

        </div>
      )}
    </main>
  );
}
