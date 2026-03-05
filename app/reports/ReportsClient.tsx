"use client";

import Link from "next/link";

type Report = {
  id: number;
  discount_time: string;
  comment?: string | null;
  is_holiday?: boolean | null;
  created_at?: string;
  stores?: {
    id: number;
    name: string;
  } | null;
};

export default function ReportsClient({
  reports,
}: {
  reports: Report[];
}) {
  if (reports.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        レポートがありません
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reports.map((r) => (
        <li
          key={r.id}
          className="rounded-xl border bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {/* ★ 店舗 → 店舗ページ */}
{r.stores ? (
  <Link
    href={`/stores/${r.stores.id}`}
    className="font-medium hover:underline"
  >
    {r.stores.name}
  </Link>
) : (
  <span className="text-gray-400 text-sm">
    店舗不明
  </span>
)}

              {r.comment && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {r.comment}
                </p>
              )}
            </div>

            <div className="text-lg font-bold text-blue-600">
              {r.discount_time.slice(0, 5)}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <div>
              {r.created_at?.slice(0, 10)}
              {r.is_holiday && " / 祝日"}
            </div>

            {/* ★ レポート詳細 */}
            <Link
              href={`/reports/${r.id}`}
              className="text-blue-600 hover:underline"
            >
              詳細を見る
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
