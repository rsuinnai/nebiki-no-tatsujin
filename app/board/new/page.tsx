import Link from "next/link";
import { supabase } from "../../../src/lib/supabase";

export default async function BoardNewPage() {
  const { data: stores, error } = await supabase
    .from("stores")
    .select("id, name")
    .order("name");

  if (error) {
    return (
      <main className="mx-auto max-w-3xl p-4">
        <p className="text-red-600">読み込みエラー</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-lg font-bold">掲示板を作成</h1>

      <ul className="space-y-2">
        {stores?.map((s) => (
          <li key={s.id}>
            <Link
              href={`/stores/${s.id}/board/new`}
              className="block rounded border px-3 py-2 hover:bg-gray-50"
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}