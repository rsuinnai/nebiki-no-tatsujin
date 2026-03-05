export function isHolidayToday() {
  const day = new Date().getDay();
  return day === 0 || day === 6; // 日曜 or 土曜
}
