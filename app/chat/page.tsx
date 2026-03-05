"use client";

import { isAdmin } from "@/src/lib/admin";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Message = {
  id: string;
  name: string | null;
  body: string | null;
  image_url: string | null;
  created_at: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .is("store_id", null)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!text && !image) return;

    let image_url: string | null = null;

    if (image) {
      const ext = image.name.split(".").pop();
      const path = `chat/${Date.now()}.${ext}`;

      await supabase.storage
        .from("chat-images")
        .upload(path, image, { upsert: true });

      image_url = supabase.storage
        .from("chat-images")
        .getPublicUrl(path).data.publicUrl;
    }

    await supabase.from("chat_messages").insert({
      name: name || null,
      body: text || null,
      image_url,
      store_id: null,
    });

    setText("");
    setImage(null);
    if (fileRef.current) fileRef.current.value = "";

    fetchMessages();

    setTimeout(scrollToBottom, 100);
  };

  return (
    <main className="mx-auto flex h-screen max-w-3xl flex-col bg-white">
      <header className="border-b px-4 py-3 font-bold">
        雑談掲示板
      </header>

      {/* ===== 掲示板エリア ===== */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-2 relative"
      >
        {messages.map((m, i) => (
          <div key={m.id} className="mb-3 relative">
            <div className="text-xs text-gray-600">
              {i + 1} ：{m.name || "名無し"}
            </div>

            {m.image_url && (
              <img
                src={m.image_url}
                className="mt-1 max-w-full rounded"
              />
            )}

            {m.body && (
              <div className="pl-4 whitespace-pre-wrap">
                {m.body}
              </div>
            )}

            {isAdmin() && (
              <button
                onClick={() =>
                  supabase
                    .from("chat_messages")
                    .delete()
                    .eq("id", m.id)
                    .then(fetchMessages)
                }
                className="absolute right-0 top-0 text-xs text-red-500"
              >
                削除
              </button>
            )}
          </div>
        ))}

        {/* ▼ stickyボタン（掲示板内右下固定） */}
        <div className="sticky bottom-4 flex justify-end pointer-events-none">
          <button
            onClick={scrollToBottom}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg border"
          >
            ↓
          </button>
        </div>
      </div>

      {/* 投稿エリア */}
      <div className="border-t p-3 space-y-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="表示名（任意）"
          className="w-full border rounded px-2 py-1"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="border rounded px-3"
          >
            {image ? "画像✓" : "画像"}
          </button>

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
            placeholder="Enterキーで送信"
            className="flex-1 border rounded px-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                sendMessage();
              }
            }}
          />

          <button
            onClick={sendMessage}
            className="border rounded px-4"
          >
            送信
          </button>
        </div>
      </div>
    </main>
  );
}