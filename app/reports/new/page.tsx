"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../src/lib/supabase";

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
    supabase
      .from("stores")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        setStores(data ?? []);
      });
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    let finalStoreId = storeId || null;

    // 店舗が未選択で、新規店舗名がある場合
    if (!finalStoreId && newStoreName) {
      const { data: store, error } = await supabase
        .from("stores")
        .insert({ name: newStoreName })
        .select()
        .single();

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      finalStoreId = store.id;
    }

    const { error } = await supabase.from("reports").insert({
      store_id: finalStoreId,
      discount_date: date,
      discount_time: time,
      prefecture,
      city,
      comment,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("投稿しました");
      location.href = "/reports";
    }

    setLoading(false);
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-bold">値引き情報を投稿</h1>

      {/* 店舗選択 */}
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

      {/* 新規店舗 */}
      <div>
        <label className="block text-sm font-medium">
          店舗がない場合（新規）
        </label>
        <input
          className="w-full border rounded px-3 py-2"
          value={newStoreName}
          onChange={(e) => setNewStoreName(e.target.value)}
          placeholder="例：イオン〇〇店"
        />
      </div>

      {/* 日付 */}
      <div>
        <label className="block text-sm font-medium">値引き日</label>
        <input
          type="date"
          className="w-full border rounded px-3 py-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* 時間 */}
      <div>
        <label className="block text-sm font-medium">
          開始時間（目安）
        </label>
        <input
          type="time"
          className="w-full border rounded px-3 py-2"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
      </div>

      {/* 地域 */}
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

      {/* コメント */}
      <div>
        <label className="block text-sm font-medium">投稿者コメント</label>
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