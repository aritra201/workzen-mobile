export function formatDateLabel(dateKey, options = {}) {
  if (!dateKey) return '—';
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  const { weekday, ...intlOptions } = options;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(weekday ? { weekday: 'long' } : {}),
    ...intlOptions,
  });
}

export function formatCurrencyInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
