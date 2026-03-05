type BoardPost = {
  id: number;
  name: string | null;
  body: string;
  created_at: string | null;
};

type Props = {
  posts: BoardPost[];
};

export default function BoardList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        まだ書き込みはありません
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {posts.map((post) => (
        <li
          key={post.id}
          className="rounded-lg border bg-gray-50 px-3 py-2"
        >
          <div className="text-sm text-gray-800">
            {post.body}
          </div>

          <div className="mt-1 flex gap-2 text-xs text-gray-400">
            <span>
              {post.name ? post.name : "匿名"}
            </span>
            {post.created_at && (
              <span>
                {new Date(post.created_at).toLocaleString()}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
