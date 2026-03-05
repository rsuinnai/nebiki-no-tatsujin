"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

const ADMIN_NAME = "管理人";

type Message = {
  id: number;
  store_id: string;
  name: string | null;
  body: string;
  created_at: string;
};

const isImage = (text: string) =>
  text.startsWith("http") && text.includes("/chat-images/");

const makeUserId = (name: string | null, date: string) => {
  const base = name && name.trim() ? name : "anon";
  const d = new Date(date);
  const day =
    d.getFullYear().toString().slice(2) +
    (d.getMonth() + 1).toString().padStart(2, "0") +
    d.getDate().toString().padStart(2, "0");

  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash * 31 + base.charCodeAt(i)) & 0xffff;
  }
  return `${day}:${hash.toString(16)}`;
};

const renderBody = (text: string) =>
  text.split(/(>>\d+)/g).map((p, i) =>
    p.startsWith(">>") ? (
      <a
        key={i}
        href={`#res-${p.replace(">>", "")}`}
        className="text-blue-700 hover:underline"
      >
        {p}
      </a>
    ) : (
      <span key={i}>{p}</span>
    )
  );

export default function StoreChatPage() {
  const { storeId } = useParams<{ storeId: string }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  /* 初期 + realtime */
  useEffect(() => {
    if (!storeId) return;

    supabase
      .from("chat_messages")
      .select("*")
      .eq("store_id", storeId)
      .order("id")
      .then(({ data }) => data && setMessages(data));

    const ch = supabase
      .channel(`store-chat-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.some((m) => m.id === payload.new.id)
              ? prev
              : [...prev, payload.new as Message]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [storeId]);

  /* プレビュー */
  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedImage]);

  /* 送信 */
  const sendMessage = async () => {
    if (!storeId) return;
    if (!body.trim() && !selectedImage) return;

    let finalBody = body;

    if (selectedImage) {
      const ext = selectedImage.name.split(".").pop();
      const path = `${storeId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("chat-images")
        .upload(path, selectedImage);

      if (error) {
        alert("画像アップロード失敗");
        return;
      }

      const { data } = supabase.storage
        .from("chat-images")
        .getPublicUrl(path);

      finalBody = data.publicUrl;
    }

    await supabase.from("chat_messages").insert({
      store_id: storeId,
      name: name.trim() || null,
      body: finalBody,
    });

    setBody("");
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    requestAnimationFrame(() => {
      boardRef.current?.scrollTo({
        top: boardRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  return (
    <main className="mx-auto flex h-screen max-w-3xl flex-col bg-white font-mono text-sm">
      <header className="border-b px-4 py-2 text-lg font-bold">
        店舗別掲示板（{storeId}）
      </header>

      {/* 掲示板 */}
      <div ref={boardRef} className="relative flex-1 overflow-y-auto px-4 py-2">
        {messages.map((m, i) => {
          const resNo = i + 1;
          const uid = makeUserId(m.name, m.created_at);
          const isAdmin = m.name === ADMIN_NAME;

          return (
            <div key={m.id} id={`res-${resNo}`} className="mb-1">
              <div
                className={`text-xs ${
                  isAdmin
                    ? "font-bold text-red-700"
                    : "text-gray-700"
                }`}
              >
                {resNo} {m.name || "名無し"} ID:{uid}{" "}
                {new Date(m.created_at).toLocaleString()}
              </div>
              <div className="pl-4 leading-snug">
                {isImage(m.body) ? (
                  <img src={m.body} className="mt-1 max-w-xs border" />
                ) : (
                  renderBody(m.body)
                )}
              </div>
            </div>
          );
        })}

        {/* ↓ 掲示板内固定 */}
        <div className="sticky bottom-2 flex justify-end">
          <button
            onClick={() =>
              boardRef.current?.scrollTo({
                top: boardRef.current.scrollHeight,
                behavior: "smooth",
              })
            }
            className="rounded-full border bg-white px-3 py-1 text-lg shadow"
          >
            ↓
          </button>
        </div>
      </div>

      {/* 入力 */}
      <div className="border-t bg-white px-4 py-2">
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="image/*"
          onChange={(e) =>
            setSelectedImage(e.target.files?.[0] || null)
          }
        />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前（省略可）"
          className="mb-1 w-full rounded border px-3 py-1 text-xs"
        />

        {/* 画像プレビュー */}
        {selectedImage && previewUrl && (
          <div className="mb-1 flex items-center gap-2 border px-2 py-1 text-xs">
            <img
              src={previewUrl}
              className="h-10 w-10 border object-cover"
            />
            <span className="flex-1 truncate">
              {selectedImage.name}
            </span>
            <button
              onClick={() => {
                setSelectedImage(null);
                if (fileInputRef.current)
                  fileInputRef.current.value = "";
              }}
              className="text-red-600"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Enterで送信"
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded border px-3"
          >
            画像
          </button>
          <button
            onClick={sendMessage}
            className="rounded border px-4"
          >
            送信
          </button>
        </div>
      </div>
    </main>
  );
}
