export const HALF_SHIFT_DAY_KEY = 'half_shift_day';
export const HALF_SHIFT_NIGHT_KEY = 'half_shift_night';

export const MAX_HALF_SHIFTS = 2;

const LEGACY_ALIASES = {
  half_shift_1: HALF_SHIFT_DAY_KEY,
  half_shift_2: HALF_SHIFT_NIGHT_KEY,
};

export function normalizeHalfShiftApiKey(shiftKey) {
  if (typeof shiftKey !== 'string') {
    return shiftKey;
  }
  const normalized = shiftKey.trim().toLowerCase();
  return LEGACY_ALIASES[normalized] ?? normalized;
}

export function parseHalfShiftSlot(shiftKey) {
  const key = normalizeHalfShiftApiKey(shiftKey);
  if (key === HALF_SHIFT_DAY_KEY) {
    return 1;
  }
  if (key === HALF_SHIFT_NIGHT_KEY) {
    return 2;
  }
  return null;
}

export function isHalfShiftKey(shiftKey) {
  const key = normalizeHalfShiftApiKey(shiftKey);
  return key === HALF_SHIFT_DAY_KEY || key === HALF_SHIFT_NIGHT_KEY;
}

export function halfShiftLabel(slotOrKey) {
  if (slotOrKey === 1 || slotOrKey === HALF_SHIFT_DAY_KEY) {
    return 'Half Shift Day';
  }
  if (slotOrKey === 2 || slotOrKey === HALF_SHIFT_NIGHT_KEY) {
    return 'Half Shift Night';
  }
  return 'Half shift';
}

export function getShiftDisplayMeta(shiftKey) {
  const key = normalizeHalfShiftApiKey(shiftKey);
  if (key === HALF_SHIFT_DAY_KEY) {
    return { label: 'Half Shift Day', short: 'Half Day' };
  }
  if (key === HALF_SHIFT_NIGHT_KEY) {
    return { label: 'Half Shift Night', short: 'Half Night' };
  }
  return null;
}
