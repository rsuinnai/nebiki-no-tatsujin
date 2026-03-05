export function isAdmin() {
  if (typeof window === "undefined") return false

  const flag = localStorage.getItem("my_admin_flag")

  if (flag === "true") return true

  // 初回アクセス時に自動であなたを管理人にする
  localStorage.setItem("my_admin_flag", "true")
  return true
}