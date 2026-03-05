import StoreList from "../../components/StoreList";
import Link from "next/link";

export default function StoresPage() {
  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1>店舗一覧</h1>
        <Link href="/stores/new">＋ 店舗追加</Link>
      </div>

      <StoreList />
    </main>
  );
}
