"use client";

import { isAdmin } from "@/src/lib/admin"
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

type Message = {
  id: string;
  store_id: string;
  name: string | null;
  content: string | null;
  image_url: string | null;
  created_at: string;
};

export default function StoreBoardPage() {
  const params = useParams();
  const storeId = params?.storeId as string;

  const [storeName, setStoreName] = useState("店舗掲示板");
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ===== 店名取得 ===== */
  useEffect(() => {
    if (!storeId) return;

    supabase
      .from("stores")
      .select("name")
      .eq("id", storeId)
      .single()
      .then(({ data }) => {
        if (data?.name) setStoreName(data.name);
      });
  }, [storeId]);

  /* ===== メッセージ取得 ===== */
  const fetchMessages = async () => {
    if (!storeId) return;

    const { data } = await supabase
      .from("store_messages")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, [storeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  /* ===== 削除 ===== */
  const deleteMessage = async (id: string) => {
    if (!confirm("削除する？")) return;

    await supabase
      .from("store_messages")
      .delete()
      .eq("id", id);

    fetchMessages();
  };

  /* ===== 投稿 ===== */
  const sendMessage = async () => {
    if (!storeId) return;
    if (!text && !image) return;
    if (loading) return;

    setLoading(true);

    let image_url: string | null = null;

    if (image) {
      const ext = image.name.split(".").pop();
      const path = `board/${storeId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(path, image, {
          upsert: true,
          contentType: image.type,
        });

      if (uploadError) {
        alert(uploadError.message);
        setLoading(false);
        return;
      }

      image_url = supabase.storage
        .from("chat-images")
        .getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("store_messages").insert({
      store_id: storeId,
      name: name || null,
      content: text || null,
      image_url,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setText("");
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";

    await fetchMessages();
    setLoading(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      sendMessage();
    }
  };

  return (
    <main className="mx-auto flex h-screen max-w-3xl flex-col bg-white text-sm">
      <header className="border-b px-4 py-3 text-base font-bold">
        {storeName}
      </header>

      {/* ★ 掲示板エリア */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-4 py-2"
        onScroll={(e) => {
          const el = e.currentTarget;
          const isBottom =
            el.scrollHeight - el.scrollTop - el.clientHeight < 50;
          setShowScrollDown(!isBottom);
        }}
      >
        {messages.map((m, i) => (
          <div key={m.id} className="mb-3 relative">
            <div className="text-xs text-gray-600">
              {i + 1} {m.name || "名無し"}
            </div>

            {m.image_url && (
              <img
                src={m.image_url}
                className="mt-1 max-w-full rounded"
              />
            )}

            {m.content && (
              <div className="pl-4 whitespace-pre-wrap">
                {m.content}
              </div>
            )}

            {isAdmin() && (
              <button
                onClick={() => deleteMessage(m.id)}
                className="absolute right-0 top-0 text-xs text-red-500"
              >
                削除
              </button>
            )}
          </div>
        ))}

        <div ref={bottomRef} />

        {/* ★ 掲示板内 ↓ボタン */}
{showScrollDown && (
  <button
    onClick={() =>
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 text-gray-700"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 5v14m0 0l-6-6m6 6l6-6"
      />
    </svg>
  </button>
)}
      </div>

      <div className="border-t px-4 py-2 space-y-1">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="表示名（任意）"
          className="w-full rounded border px-2 py-1 text-xs"
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded border px-3 py-2 text-sm"
          >
            {image ? "画像✓" : "画像"}
          </button>

          {image && (
            <span className="text-xs text-gray-600 truncate max-w-[120px]">
              {image.name}
            </span>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="hidden"
          />

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enterで送信"
            className="flex-1 rounded border px-2 py-2"
            onKeyDown={onKeyDown}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            className="rounded border px-4"
          >
            送信
          </button>
        </div>
      </div>
    </main>
  );
}