"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../src/lib/supabase";

type Store = {
  id: number;
  name: string;
  chain: string | null;
};

type Filter = {
  storeId?: number;
  onlyHoliday?: boolean;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
};

type Props = {
  onChange: (filter: Filter) => void;
};

export function FilterBar({ onChange }: Props) {
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState<number | undefined>();
  const [onlyHoliday, setOnlyHoliday] = useState(false);
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    const fetchStores = async () => {
      const { data } = await supabase
        .from("stores")
        .select("id, name, chain")
        .order("name");
      if (data) setStores(data);
    };
    fetchStores();
  }, []);

  useEffect(() => {
    onChange({
      storeId,
      onlyHoliday,
      from: from || undefined,
      to: to || undefined,
    });
  }, [storeId, onlyHoliday, from, to]);

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-xl border bg-white px-4 py-3 shadow-sm">
      {/* 店舗 */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">店舗</label>
        <select
          className="rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={storeId ?? ""}
          onChange={(e) =>
            setStoreId(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">すべての店舗</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.chain ? `${store.chain} ` : ""}
              {store.name}
            </option>
          ))}
        </select>
      </div>

      {/* 期間 */}
      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">開始日</label>
        <input
          type="date"
          className="rounded-md border px-3 py-2 text-sm"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-gray-500 mb-1">終了日</label>
        <input
          type="date"
          className="rounded-md border px-3 py-2 text-sm"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {/* 祝日のみ */}
      <label className="flex items-center gap-2 mb-1 text-sm text-gray-700 cursor-pointer">
        <input
          type="checkbox"
          checked={onlyHoliday}
          onChange={(e) => setOnlyHoliday(e.target.checked)}
          className="h-4 w-4 accent-blue-500"
        />
        祝日のみ
      </label>
    </div>
  );
}
