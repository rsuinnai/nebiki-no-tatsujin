"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Store = {
  id: number;
  name: string;
};

export default function NewReportPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | "">("");
  const [newStoreName, setNewStoreName] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    const { data, error } = await supabase
      .from("stores")
      .select("id,name")
      .order("name");

    if (error) {
      console.error(error);
      return;
    }

    setStores(data ?? []);
  }

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let finalStoreId = storeId;
      const name = newStoreName.trim();

      if (!finalStoreId && !name) {
        alert("店舗を選択するか新しい店舗名を入力してください");
        setLoading(false);
        return;
      }

      // 新規店舗作成
      if (!finalStoreId && name) {
        const { data: store, error } = await supabase
          .from("stores")
          .insert({
            name: name,
            chain: null,
          })
          .select()
          .single();

        if (error) {
          console.error("store insert error", error);
          alert("店舗作成エラー");
          setLoading(false);
          return;
        }

        finalStoreId = store.id;
      }

      // レポート投稿
      const { error } = await supabase.from("reports").insert({
        store_id: finalStoreId,
        discount_date: date || null,
        discount_time: time || null,
        prefecture: prefecture || null,
        city: city || null,
        comment: comment || null,
      });

      if (error) {
        console.error("report insert error", error);
        alert("投稿エラー");
        setLoading(false);
        return;
      }

      alert("投稿しました！");
      window.location.href = "/reports";

    } catch (err) {
      console.error(err);
      alert("エラーが発生しました");
    }

    setLoading(false);
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">値引き情報を投稿</h1>

      <div>
        <label className="block text-sm font-medium">店舗</label>
        <select
          className="w-full border rounded px-3 py-2"
          value={storeId}
          onChange={(e) =>
            setStoreId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">選択してください</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">店舗がない場合</label>
        <input
          className="w-full border rounded px-3 py-2"
          value={newStoreName}
          onChange={(e) => setNewStoreName(e.target.value)}
          placeholder="例：イオン〇〇店"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">値引き日</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">開始時間</label>
        <input
          type="time"
          className="w-full border rounded px-3 py-2"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="都道府県"
          value={prefecture}
          onChange={(e) => setPrefecture(e.target.value)}
        />
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="市区町村"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">コメント</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white rounded py-3 disabled:opacity-50"
      >
        投稿する
      </button>
    </main>
  );
}