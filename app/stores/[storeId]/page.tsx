"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { isAdmin } from "@/src/lib/admin";

type Message = {
  id: string;
  store_id: number;
  name: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
};

export default function StoreBoardPage() {

  const params = useParams();
  const storeId = Number(params?.storeId);

  const [storeName, setStoreName] = useState("店舗掲示板");
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /* 管理者 */

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (isAdmin(userId)) setAdmin(true);
    };
    checkAdmin();
  }, []);

  /* 店名 */

  const fetchStore = async () => {

    const { data } = await supabase
      .from("stores")
      .select("name")
      .eq("id", storeId)
      .single();

    if (data?.name) setStoreName(data.name);

  };

  /* 初期メッセージ */

  const fetchMessages = async () => {

    const { data } = await supabase
      .from("store_messages")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);

  };

  useEffect(() => {

    if (!storeId) return;

    fetchStore();
    fetchMessages();

  }, [storeId]);

  /* realtime（差分更新） */

  useEffect(() => {

    if (!storeId) return;

    const channel = supabase
      .channel("store_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_messages"
        },
        (payload) => {

          const newRow = payload.new as Message | null;
          const oldRow = payload.old as Message | null;

          if (payload.eventType === "INSERT" && newRow?.store_id === storeId) {

            setMessages((prev) => [...prev, newRow]);

          }

          if (payload.eventType === "DELETE" && oldRow?.store_id === storeId) {

            setMessages((prev) =>
              prev.filter((m) => m.id !== oldRow.id)
            );

          }

          if (payload.eventType === "UPDATE" && newRow?.store_id === storeId) {

            setMessages((prev) =>
              prev.map((m) => (m.id === newRow.id ? newRow : m))
            );

          }

        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [storeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* 投稿 */

  const sendMessage = async () => {

    if (!text && !image) return;
    if (loading) return;

    setLoading(true);

    let image_url: string | null = null;

    if (image) {

      const ext = image.name.split(".").pop();
      const path = `board/${storeId}/${Date.now()}.${ext}`;

      const { error } = await supabase.storage
        .from("chat-images")
        .upload(path, image, { upsert: true });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      image_url = supabase
        .storage
        .from("chat-images")
        .getPublicUrl(path).data.publicUrl;

    }

    const { error } = await supabase
      .from("store_messages")
      .insert({
        store_id: storeId,
        name: name || null,
        content: text || "",
        image_url
      });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    setText("");
    setImage(null);

    if (fileRef.current) fileRef.current.value = "";

    setLoading(false);

  };

  const deleteMessage = async (id: string) => {

    if (!confirm("削除しますか？")) return;

    await supabase
      .from("store_messages")
      .delete()
      .eq("id", id);

  };

  const scrollBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (

    <main className="mx-auto flex h-screen max-w-3xl flex-col bg-white text-sm">

      <header className="border-b px-4 py-3 text-base font-bold">
        {storeName}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-2 relative">

        {messages.map((m, i) => (

          <div key={m.id} className="mb-3">

            <div className="text-xs text-gray-600 flex justify-between">
              <span>{i + 1} {m.name || "名無し"}</span>

              {admin && (
                <button
                  onClick={() => deleteMessage(m.id)}
                  className="text-red-500 text-xs"
                >
                  削除
                </button>
              )}
            </div>

            {m.image_url && (
              <img
                src={m.image_url + "?" + m.created_at}
                className="mt-1 max-w-full rounded cursor-pointer"
                onClick={() => setZoomImage(m.image_url!)}
              />
            )}

            {m.content && (
              <div className="pl-4 whitespace-pre-wrap">
                {m.content}
              </div>
            )}

          </div>

        ))}

        <div ref={bottomRef} />

        <button
          onClick={scrollBottom}
          className="sticky bottom-5 ml-auto w-12 h-12 bg-white border-2 border-black rounded-full shadow flex items-center justify-center"
        >
          <span className="text-3xl font-bold text-black">↓</span>
        </button>

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

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            className="hidden"
          />

          <input
            value={text ?? ""}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enterで送信"
            className="flex-1 rounded border px-2 py-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
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

      {zoomImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            className="max-h-[90%] max-w-[90%] rounded"
          />
        </div>
      )}

    </main>

  );

}