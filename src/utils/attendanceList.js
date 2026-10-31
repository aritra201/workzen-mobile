export function getListItems(data) {
  if (!data) return [];
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.records)) return data.records;
  return [];
}

export function getEmployeeName(row) {
  return row?.employee?.name ?? row?.employeeName ?? '—';
}

export function sumShiftAmounts(shifts) {
  if (!shifts) return null;
  let total = 0;
  let has = false;
  for (const [key, shift] of Object.entries(shifts)) {
    if (key === 'halfShifts' || !shift?.marked) continue;
    if (shift.amount != null && !Number.isNaN(Number(shift.amount))) {
      total += Number(shift.amount);
      has = true;
    }
  }
  for (const half of shifts.halfShifts || []) {
    if (half?.marked && half.amount != null) {
      total += Number(half.amount);
      has = true;
    }
  }
  return has ? total : null;
}

export function shiftStatusSummary(shifts) {
  const parts = [];
  const keys = ['day', 'night', 'extraDay', 'extraNight', 'halfShiftDay', 'halfShiftNight'];
  for (const key of keys) {
    const s = shifts?.[key];
    if (s?.marked) parts.push(key);
  }
  for (const h of shifts?.halfShifts || []) {
    if (h?.marked) parts.push(h.shiftKey || 'half');
  }
  return parts.length ? parts.join(', ') : 'Not marked';
}
