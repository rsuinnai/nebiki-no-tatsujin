"use client";

import { useState } from "react";
import { supabase } from "../../src/lib/supabase";

type Message = {
  id: number;
  name: string | null;
  body: string;
  created_at: string;
};

export default function ChatClient({
  messages,
}: {
  messages: Message[];
}) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!body.trim()) return;

    setSending(true);
    await supabase.from("chat_messages").insert({
      name: name || null,
      body,
    });

    setBody("");
    setSending(false);
    location.reload(); // シンプルに更新
  };

  return (
    <div className="flex h-[70vh] flex-col rounded border bg-white">
      {/* メッセージ */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id}>
            <div className="text-xs text-gray-500">
              {m.name || "匿名"} /{" "}
              {m.created_at.slice(11, 16)}
            </div>
            <div className="inline-block rounded-lg bg-gray-100 px-3 py-2">
              {m.body}
            </div>
          </div>
        ))}
      </div>

      {/* 入力 */}
      <div className="border-t p-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前（省略可）"
          className="mb-2 w-full rounded border px-2 py-1 text-sm"
        />
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="メッセージ"
            className="flex-1 rounded border px-2 py-1"
          />
          <button
            onClick={submit}
            disabled={sending}
            className="rounded bg-blue-600 px-4 text-white disabled:opacity-50"
          >
            送信
          </button>
        </div>
      </div>
    </div>
  );
}
