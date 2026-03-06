"use client";

import { useState } from "react";
import { supabase } from "../src/lib/supabase";

type Props = {
  reportId: number;
};

export default function BoardForm({ reportId }: Props) {
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!body.trim()) return;

    setLoading(true);

    const { error } = await supabase.from("board_posts").insert({
      report_id: reportId,
      body: body,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setBody("");
    location.reload();
  };

  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="このレポートに関する補足・注意を書いてください"
        className="w-full rounded border p-2 text-sm"
        rows={3}
      />

      <button
        onClick={submit}
        disabled={loading}
        className="rounded bg-blue-600 px-3 py-1 text-sm text-white disabled:opacity-50"
      >
        書き込む
      </button>
    </div>
  );
}
