"use client";

import { useState } from "react";
import { supabase } from "../src/lib/supabase";
import { useRouter } from "next/navigation";

type Store = {
  id: number;
  name: string;
};

export default function BoardNewClient({ stores }: { stores: Store[] }) {
  const router = useRouter();
  const [storeId, setStoreId] = useState<number | "">("");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!storeId || body.trim() === "") {
      alert("店舗と本文は必須です");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("board_posts").insert({
      store_id: storeId,
      name: name || null,
      body,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/board");
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {/* 店舗 */}
      <div>
        <label className="mb-1 block text-sm font-medium">店舗</label>
        <select
          className="w-full rounded border px-3 py-2"
          value={storeId}
          onChange={(e) => setStoreId(Number(e.target.value))}
        >
          <option value="">選択してください</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* 名前 */}
      <div>
        <label className="mb-1 block text-sm font-medium">名前（任意）</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* 本文 */}
      <div>
        <label className="mb-1 block text-sm font-medium">内容</label>
        <textarea
          className="w-full rounded border px-3 py-2"
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <button
        onClick={submit}
        disabled={loading}
        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        投稿する
      </button>
    </div>
  );
}
