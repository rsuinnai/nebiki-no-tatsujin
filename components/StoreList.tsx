"use client";

import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabase";

type Store = {
  id: string;
  name: string;
  chain: string | null;
  prefecture: string | null;
  city: string | null;
};

export default function StoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setStores(data);
      }
      setLoading(false);
    };

    fetchStores();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (stores.length === 0) return <p>店舗がまだ登録されていません</p>;

  return (
    <ul className="space-y-3">
      {stores.map((store) => (
        <li key={store.id} className="border p-3">
          <div className="font-bold">
            {store.chain ? `${store.chain} ` : ""}
            {store.name}
          </div>
          <div className="text-sm text-gray-600">
            {store.prefecture}
            {store.city ? ` / ${store.city}` : ""}
          </div>
        </li>
      ))}
    </ul>
  );
}
