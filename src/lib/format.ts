export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 30) return `${diffDays} hari yang lalu`;
  if (diffMonths < 12) return `${diffMonths} bulan yang lalu`;
  return `${Math.floor(diffMonths / 12)} tahun yang lalu`;
}
