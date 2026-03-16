"use client";

import { supabase } from "@/src/lib/supabase";
import { isHolidayToday } from "@/src/lib/date";
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
};

type BoardPost = {
  id: number;
  content: string;
  created_at: string;
  store_id: number | null;
};

export default function HomePage() {

  const [reports, setReports] = useState<Report[]>([]);
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [reportExpanded, setReportExpanded] = useState(false);
  const [boardExpanded, setBoardExpanded] = useState(false);

  const holiday = isHolidayToday();

  useEffect(() => {
    loadData();
    subscribeRealtime();
  }, []);

  async function loadData() {

    const { data: storeData } = await supabase
      .from("stores")
      .select("id,name");

    const { data: reportData } = await supabase
      .from("reports")
      .select("id,discount_time,created_at,store_id")
      .order("created_at", { ascending: false })
      .limit(20);

    const { data: boardData } = await supabase
      .from("store_messages")
      .select("id,content,created_at,store_id")
      .not("store_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(50);

    setStores(storeData || []);
    setReports(reportData || []);
    setBoardPosts(boardData || []);
  }

  function subscribeRealtime() {

    supabase
      .channel("reports-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reports" },
        (payload) => {

          const newReport = payload.new as Report;

          setReports((prev) => [newReport, ...prev]);

        }
      )
      .subscribe();


    supabase
      .channel("board-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "store_messages" },
        (payload) => {

          const newPost = payload.new as BoardPost;

          setBoardPosts((prev) => [newPost, ...prev]);

        }
      )
      .subscribe();

  }

  function getStoreName(store_id: number | null) {
    const s = stores.find((v) => v.id === store_id);
    return s ? s.name : "店舗不明";
  }

  function getLastComment(store_id: number) {
    const post = boardPosts.find((p) => p.store_id === store_id);
    return post ? post.content : null;
  }

  const visibleReports = reportExpanded ? reports : reports.slice(0,5);
  const visiblePosts = boardExpanded ? boardPosts.slice(0,20) : boardPosts.slice(0,5);

  return (

    <div className="min-h-screen bg-gray-50 px-4 py-10">

      <div className="mx-auto max-w-2xl space-y-10">

        <div className="text-center">

          <h1 className="text-3xl font-bold text-gray-800">
            値引きの達人
          </h1>

          <p className="mt-2 text-gray-500">
            お店の値引き開始時間をみんなで共有！
          </p>

        </div>



        {/* 今日の値引き */}

        <section className="rounded-xl bg-white p-6 shadow">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-xl font-semibold">
              今日（{holiday ? "休日" : "平日"}）の値引き情報
            </h2>

            <Link
              href="/reports"
              className="text-sm text-blue-600 hover:underline"
            >
              詳しく見る →
            </Link>

          </div>

          {visibleReports.length === 0 && (
            <p className="text-gray-500">
              まだ投稿がありません
            </p>
          )}

          <div className="space-y-3">

            {visibleReports.map((report) => {

              const storeName = getStoreName(report.store_id);
              const lastComment = getLastComment(report.store_id);

              return (

                <Link
                  key={report.id}
                  href={`/stores/${report.store_id}`}
                  className="block rounded-lg border p-4 hover:bg-gray-50 transition"
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

                    </div>

                    <div className="text-2xl font-bold text-blue-600">

                      {report.discount_time
                        ? report.discount_time.slice(0,5)
                        : "--:--"}

                    </div>

                  </div>

                </Link>

              );

            })}

          </div>

          {reports.length > 5 && (

            <div className="mt-4 text-center">

              <button
                onClick={() => setReportExpanded(!reportExpanded)}
                className="text-blue-600 hover:underline"
              >

                {reportExpanded ? "折りたたむ" : "もっと見る"}

              </button>

            </div>

          )}

        </section>



        {/* 掲示板 */}

        <section className="rounded-xl bg-white p-6 shadow">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-xl font-semibold">
              掲示板（最新）
            </h2>

            <Link
              href="/board"
              className="text-sm text-blue-600 hover:underline"
            >
              詳しく見る →
            </Link>

          </div>

          {visiblePosts.length === 0 && (
            <p className="text-gray-500">
              まだ投稿がありません
            </p>
          )}

          <ul className="space-y-3">

            {visiblePosts.map((post) => {

              const storeName = getStoreName(post.store_id);

              return (

                <li key={post.id}>

                  <Link
                    href={`/stores/${post.store_id}`}
                    className="block rounded-lg border p-4 hover:bg-gray-50"
                  >

                    <p className="font-semibold text-gray-800">
                      {storeName}
                    </p>

                    <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                      {post.content}
                    </p>

                    <p className="text-xs text-gray-400 mt-1">
                      {post.created_at.slice(0,16).replace("T"," ")}
                    </p>

                  </Link>

                </li>

              );

            })}

          </ul>

          {boardPosts.length > 5 && (

            <div className="mt-4 text-center">

              <button
                onClick={() => setBoardExpanded(!boardExpanded)}
                className="text-blue-600 hover:underline"
              >

                {boardExpanded ? "折りたたむ" : "もっと見る"}

              </button>

            </div>

          )}

        </section>



        <div className="flex gap-4">

          <Link
            href="/reports"
            className="flex-1 rounded-lg border py-3 text-center hover:bg-gray-100"
          >
            値引き店舗一覧
          </Link>

          <Link
            href="/reports/new"
            className="flex-1 rounded-lg bg-blue-600 py-3 text-center text-white hover:bg-blue-700"
          >
            値引きを投稿
          </Link>

          <Link
            href="/chat"
            className="flex-1 rounded-lg bg-green-600 py-3 text-center text-white hover:bg-green-700"
          >
            雑談チャット
          </Link>

        </div>

      </div>

    </div>

  );
}