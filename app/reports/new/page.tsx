"use client";

import { useEffect, useState, useRef } from "react";
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

  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    const { data } = await supabase
      .from("stores")
      .select("id,name")
      .order("name");

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

      // 店舗新規作成
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
          alert("店舗作成エラー");
          setLoading(false);
          return;
        }

        finalStoreId = store.id;
      }

      /* ===== 画像アップロード ===== */
      let imageUrl: string | null = null;

      if (image) {
        const ext = image.name.split(".").pop();
        const path = `reports/${finalStoreId}/${Date.now()}.${ext}`;

        const { error } = await supabase.storage
          .from("chat-images")
          .upload(path, image, { upsert: true });

        if (error) {
          alert(error.message);
          setLoading(false);
          return;
        }

        imageUrl = supabase
          .storage
          .from("chat-images")
          .getPublicUrl(path).data.publicUrl;
      }

      /* ===== reports 保存 ===== */
      const { error: reportError } = await supabase.from("reports").insert({
        store_id: finalStoreId,
        discount_date: date || null,
        discount_time: time || null,
        prefecture: prefecture || null,
        city: city || null,
        comment: comment || "",
        //image_url: imageUrl,

      });

      if (reportError) {
        alert("投稿エラー");
        setLoading(false);
        return;
      }

      /* ===== 掲示板にも保存 ===== */
      const { error: boardError } = await supabase
        .from("store_messages")
        .insert({
          store_id: finalStoreId,
          name: "投稿",
          content: comment || "",
          image_url: imageUrl,
        });

      if (boardError) {
        alert(boardError.message);
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

      {/* 店舗追加 */}
      <div>
        <label className="block text-sm font-medium">
          店舗がない場合
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
        <label className="block text-sm font-medium">
          値引き日（任意）
        </label>
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
          値引き開始時間（わかる場合）
        </label>
        <input
          type="time"
          className="w-full border rounded px-3 py-2"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <p className="text-xs text-gray-500 mt-1">
          例：19:00ごろ半額など
        </p>
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
        <label className="block text-sm font-medium">
          コメント（値引き内容）
        </label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={3}
          value={comment ?? ""}
          onChange={(e) => setComment(e.target.value)}
          placeholder="例：弁当が19時ごろに半額、パンは20時ごろ"
        />
      </div>

      {/* 画像 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          画像（任意）
        </label>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border px-3 py-2 rounded"
          >
            {image ? "画像選択済み" : "画像を選択"}
          </button>

          {image && (
            <span className="text-xs truncate max-w-[150px]">
              {image.name}
            </span>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
          />
        </div>

        <p className="text-xs text-gray-500 mt-1">
          値引きシールや売り場の写真があると分かりやすいです
        </p>
      </div>

      {/* 送信 */}
      <button
        disabled={loading}
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white rounded py-3"
      >
        投稿する
      </button>

    </main>
  );
}