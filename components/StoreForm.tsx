"use client";

import { useState } from "react";
import { supabase } from "@/src/lib/supabase";

export default function StoreForm() {

  const [storeName, setStoreName] = useState("");
  const [chain, setChain] = useState("");
  const [prefecture, setPrefecture] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("stores")
      .insert({
        name: storeName.trim(),
        chain: chain.trim() || null,
        prefecture: prefecture || null,
        city: city || null,
      });

    if (error) {
      if (error.code === "23505") {
        alert("このチェーンの同名店舗はすでに登録されています");
      } else {
        alert(error.message);
      }
      setLoading(false);
      return;
    }

    alert("店舗を登録しました");
    setStoreName("");
    setChain("");
    setPrefecture("");
    setCity("");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>店舗名</label>
        <input
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          required
        />
      </div>

      <div>
        <label>チェーン名（任意）</label>
        <input
          value={chain}
          onChange={(e) => setChain(e.target.value)}
        />
      </div>

      <div>
        <label>都道府県</label>
        <input
          value={prefecture}
          onChange={(e) => setPrefecture(e.target.value)}
        />
      </div>

      <div>
        <label>市区町村</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "登録中..." : "店舗を登録"}
      </button>
    </form>
  );
}
