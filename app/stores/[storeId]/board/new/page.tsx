"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "../../../../../src/lib/supabase";

export default function NewBoardPostPage() {
  const params = useParams();
  const storeId = Number(params.storeId); // ← ★ここ修正

  const router = useRouter();

  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!storeId || Number.isNaN(storeId)) {
      alert("店舗IDが不正です");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("board_posts").insert({
      store_id: storeId,
      name: name.trim() || null,
      body,
    });

    setLoading(false);

    if (error) {
      alert("投稿に失敗しました");
      console.error(error);
      return;
    }

    // 成功
    router.push(`/stores/${storeId}`);
  }

  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-6">
      <h1 className="text-xl font-bold">掲示板に書き込む</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="名前（任意）"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          className="w-full rounded border px-3 py-2 text-sm"
          rows={5}
          placeholder="内容"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
        >
          投稿する
        </button>
      </form>
    </main>
  );
}