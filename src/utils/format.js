export function formatDateLabel(dateKey) {
  if (!dateKey) return '—';
  const d = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatCurrencyInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
