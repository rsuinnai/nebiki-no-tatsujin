"use client";

import { supabase } from "@/src/lib/supabase";

export default function LoginOnce() {
  return (
    <button
      onClick={async () => {
        const email = prompt("管理人メールアドレス");
        if (!email) return;

        const { error } = await supabase.auth.signInWithOtp({
          email,
        });

        if (error) {
          alert(error.message);
        } else {
          alert("メール送信済み。リンク踏んで戻ってこい。");
        }
      }}
    >
      管理人ログイン（1回だけ）
    </button>
  );
}