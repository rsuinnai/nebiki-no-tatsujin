"use client";

type Post = {
  id: number;
  name: string | null;
  body: string;
  created_at: string;
};

export default function BoardClient({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        まだ投稿がありません
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <li
          key={p.id}
          className="rounded-xl border bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{p.name || "匿名"}</span>
            <span>{p.created_at.slice(0, 16).replace("T", " ")}</span>
          </div>

          <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
            {p.body}
          </div>
        </li>
      ))}
    </ul>
  );
}
