export function shiftChipStyle(responseKey, isDark) {
  const key = resolvePaletteKey(responseKey);
  const palettes = isDark
    ? {
        day: { bg: 'rgba(16, 185, 129, 0.15)', text: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)' },
        night: { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
        extraDay: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fcd34d', border: 'rgba(245, 158, 11, 0.3)' },
        extraNight: { bg: 'rgba(249, 115, 22, 0.15)', text: '#fdba74', border: 'rgba(249, 115, 22, 0.3)' },
        halfShift: { bg: 'rgba(139, 92, 246, 0.25)', text: '#ddd6fe', border: 'rgba(167, 139, 250, 0.4)' },
      }
    : {
        day: { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
        night: { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
        extraDay: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
        extraNight: { bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
        halfShift: { bg: '#ede9fe', text: '#4c1d95', border: '#c4b5fd' },
      };
  return palettes[key] || palettes.day;
}

function resolvePaletteKey(responseKey) {
  if (
    responseKey === 'halfShiftDay' ||
    responseKey === 'halfShiftNight' ||
    (typeof responseKey === 'string' && responseKey.startsWith('half_shift_'))
  ) {
    return 'halfShift';
  }
  if (responseKey === 'extraDay' || responseKey === 'extra_day') return 'extraDay';
  if (responseKey === 'extraNight' || responseKey === 'extra_night') return 'extraNight';
  if (responseKey === 'night') return 'night';
  return 'day';
}
