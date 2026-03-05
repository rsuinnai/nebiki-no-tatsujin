"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

const ADMIN_NAME = "管理人";

type Store = {
  id: number;
  name: string;
};

type Message = {
  id: number;
  store_id: number;
  name: string | null;
  body: string;
  created_at: string;
};

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

export default function StoreBoardPage() {
  const params = useParams();
  const storeId = Number(params.storeId);

  const [store, setStore] = useState<Store | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  const boardRef = useRef<HTMLDivElement>(null);

  /* 店舗情報 + 初期投稿 */
  useEffect(() => {
    if (!storeId) return;

    supabase
      .from("stores")
      .select("id, name")
      .eq("id", storeId)
      .single()
      .then(({ data }) => setStore(data));

    supabase
      .from("board_posts")
      .select("*")
      .eq("store_id", storeId)
      .order("id")
      .then(({ data }) => setMessages(data ?? []));

    const ch = supabase
      .channel(`store-board-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "board_posts",
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) =>
              prev.some((m) => m.id === payload.new.id)
                ? prev
                : [...prev, payload.new as Message]
            );
          }

          if (payload.eventType === "DELETE") {
            setMessages((prev) =>
              prev.filter((m) => m.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [storeId]);

  /* スクロール */
  useEffect(() => {
    requestAnimationFrame(() => {
      boardRef.current?.scrollTo({
        top: boardRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages]);

  /* 送信 */
  const sendMessage = async () => {
    if (!body.trim()) return;

    const { data } = await supabase
      .from("board_posts")
      .insert({
        store_id: storeId,
        name: name.trim() || null,
        body,
      })
      .select()
      .single();

    if (data) {
      setMessages((prev) => [...prev, data]);
      setBody("");
    }
  };

  /* 管理人削除 */
  const deleteMessage = async (id: number) => {
    if (!confirm("削除しますか？")) return;
    await supabase.from("board_posts").delete().eq("id", id);
  };

  return (
    <main className="mx-auto flex h-screen max-w-3xl flex-col bg-white font-mono text-sm">
      <header className="border-b px-4 py-2 text-lg font-bold">
        {store ? `${store.name} 掲示板` : "掲示板"}
      </header>

      <div ref={boardRef} className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 && (
          <p className="text-center text-gray-400">
            まだ投稿はありません
          </p>
        )}

        {messages.map((m, i) => {
          const uid = makeUserId(m.name, m.created_at);
          const isAdmin = m.name === ADMIN_NAME;

          return (
            <div key={m.id} className="mb-1">
              <div className="flex justify-between text-xs text-gray-700">
                <span>
                  {i + 1} {m.name || "名無し"} ID:{uid}{" "}
                  {new Date(m.created_at).toLocaleString()}
                </span>
                {isAdmin && (
                  <button
                    onClick={() => deleteMessage(m.id)}
                    className="text-red-600"
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="pl-4 whitespace-pre-wrap">
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      {/* 入力 */}
      <div className="border-t px-4 py-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前（省略可）"
          className="mb-1 w-full rounded border px-3 py-1 text-xs"
        />
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Enterで送信"
            className="flex-1 rounded border px-3 py-2"
          />
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