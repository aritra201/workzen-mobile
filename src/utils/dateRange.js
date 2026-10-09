export function toDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateKey(key) {
  if (!key) return new Date();
  const d = new Date(`${key}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

export function listRangeLastDays(days = 30) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { startDate: toDateKey(start), endDate: toDateKey(end) };
}
