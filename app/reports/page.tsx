"use client";

import { supabase } from "@/src/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

type Store = {
  id: number;
  name: string;
};

type Report = {
  id: number;
  discount_time: string | null;
  created_at: string;
  store_id: number;
  prefecture: string | null;
  city: string | null;
};

type BoardPost = {
  id: number;
  content: string;
  created_at: string;
  store_id: number | null;
};

export default function ReportsPage() {

  const [reports, setReports] = useState<Report[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>([]);

  const [keyword, setKeyword] = useState("");
  const [prefFilter, setPrefFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const { data: storeData } = await supabase
      .from("stores")
      .select("id,name");

    const { data: reportData } = await supabase
      .from("reports")
      .select("id,discount_time,created_at,store_id,prefecture,city")
      .order("created_at", { ascending: false });

    const { data: boardData } = await supabase
      .from("store_messages")
      .select("id,content,created_at,store_id")
      .not("store_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);

    setStores(storeData || []);
    setReports(reportData || []);
    setBoardPosts(boardData || []);
  }

  function getStoreName(store_id: number) {
    const s = stores.find((v) => v.id === store_id);
    return s ? s.name : "店舗不明";
  }

  function getLastComment(store_id: number) {
    const post = boardPosts.find((p) => p.store_id === store_id);
    return post ? post.content : null;
  }

  const filteredReports = reports.filter((report) => {
    const storeName = getStoreName(report.store_id);

    if (keyword && !storeName.includes(keyword)) return false;
    if (prefFilter && report.prefecture !== prefFilter) return false;
    if (cityFilter && report.city !== cityFilter) return false;

    return true;
  });

  return (

    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto max-w-2xl">

        {/* ← トップに戻るボタン追加 */}
        <Link
          href="/"
          className="inline-block mb-4 text-blue-600 hover:underline"
        >
          ← トップに戻る
        </Link>

        <h1 className="text-2xl font-bold mb-4">
          値引き店舗一覧
        </h1>

        <div className="mb-6 space-y-2">

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="店舗名で検索（例：イオン）"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          <div className="flex gap-2">
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="都道府県"
              value={prefFilter}
              onChange={(e) => setPrefFilter(e.target.value)}
            />
            <input
              className="flex-1 border rounded px-3 py-2"
              placeholder="市区町村"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            />
          </div>

        </div>

        {filteredReports.length === 0 && (
          <p className="text-gray-500">
            条件に合う投稿がありません
          </p>
        )}

        <div className="space-y-3">

          {filteredReports.map((report) => {

            const storeName = getStoreName(report.store_id);
            const lastComment = getLastComment(report.store_id);

            return (

              <Link
                key={report.id}
                href={`/stores/${report.store_id}`}
                className="block rounded-lg border p-4 hover:bg-gray-50"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <p className="font-semibold text-gray-800">
                      {storeName}
                    </p>

                    {lastComment && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        💬 {lastComment}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      {report.created_at.slice(0,16).replace("T"," ")}
                    </p>

                  </div>

                  <div className="text-xl font-bold text-blue-600">
                    {report.discount_time
                      ? report.discount_time.slice(0,5)
                      : "--:--"}
                  </div>

                </div>

              </Link>

            );

          })}

        </div>

      </div>

    </div>

  );
}