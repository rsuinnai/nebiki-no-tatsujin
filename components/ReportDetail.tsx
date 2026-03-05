type Report = {
  created_at?: string;
  comment?: string | null;
  prefecture?: string | null;
  city?: string | null;
};

export default function ReportDetail({ report }: { report: Report }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h1 className="text-lg font-bold">
        値引きレポート
      </h1>

      {report.prefecture && (
        <p className="mt-1 text-sm text-gray-600">
          地域：{report.prefecture} {report.city}
        </p>
      )}

      {report.created_at && (
        <p className="mt-1 text-xs text-gray-500">
          投稿日：{report.created_at.slice(0, 10)}
        </p>
      )}

      {report.comment && (
        <p className="mt-3 text-sm text-gray-700">
          {report.comment}
        </p>
      )}
    </div>
  );
}
