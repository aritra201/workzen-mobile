export function getMyAttendanceListItems(data) {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.records)) return data.records;
  return [];
}
