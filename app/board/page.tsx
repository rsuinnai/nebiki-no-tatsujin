"use client";

import { supabase } from "@/src/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";

type Store = {
  id: number;
  name: string;
};

type BoardPost = {
  id: number;
  content: string;
  created_at: string;
  store_id: number | null;
};

type Report = {
  id: number;
  discount_time: string | null;
  store_id: number;
};

export default function BoardPage() {

  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    const { data: storeData } = await supabase
      .from("stores")
      .select("id,name");

    const { data: boardData } = await supabase
      .from("store_messages")
      .select("id,content,created_at,store_id")
      .not("store_id", "is", null)
      .order("created_at", { ascending: false });

    const { data: reportData } = await supabase
      .from("reports")
      .select("id,discount_time,store_id")
      .not("discount_time", "is", null)
      .order("created_at", { ascending: false });

    setStores(storeData || []);
    setPosts(boardData || []);
    setReports(reportData || []);
  }

  function getStoreName(store_id: number | null) {
    const s = stores.find((v) => v.id === store_id);
    return s ? s.name : "店舗不明";
  }

  function getLastDiscount(store_id: number | null) {
    const r = reports.find((v) => v.store_id === store_id);
    return r?.discount_time ? r.discount_time.slice(0,5) : null;
  }

  return (

    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto max-w-2xl">

        <h1 className="text-2xl font-bold mb-6">
          掲示板
        </h1>

        {posts.length === 0 && (
          <p className="text-gray-500">
            まだ投稿がありません
          </p>
        )}

        <div className="space-y-3">

          {posts.map((post) => {

            const storeName = getStoreName(post.store_id);
            const discount = getLastDiscount(post.store_id);

            return (

              <Link
                key={post.id}
                href={`/stores/${post.store_id}`}
                className="block rounded-lg border p-4 hover:bg-gray-50"
              >

                <div className="flex justify-between items-center">

                  <div>

                    <p className="font-semibold text-gray-800">
                      {storeName}
                    </p>

                    <p className="text-sm text-gray-700 mt-1">
                      {post.content}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {post.created_at.slice(0,16).replace("T"," ")}
                    </p>

                  </div>

                  {discount && (

                    <div className="text-blue-600 font-bold text-lg">
                      {discount}
                    </div>

                  )}

                </div>

              </Link>

            );

          })}

        </div>

      </div>

    </div>

  );
}