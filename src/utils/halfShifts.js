export const MAX_HALF_SHIFTS = 4;

export function parseHalfShiftSlot(shiftKey) {
  if (typeof shiftKey !== 'string') {
    return null;
  }
  const match = /^half_shift_([1-4])$/i.exec(shiftKey.trim());
  return match ? Number(match[1]) : null;
}

export function isHalfShiftKey(shiftKey) {
  return parseHalfShiftSlot(shiftKey) != null;
}

export function halfShiftLabel(slot) {
  return `Half Shift ${slot}`;
}

export function getShiftDisplayMeta(shiftKey) {
  const slot = parseHalfShiftSlot(shiftKey);
  if (slot) {
    return {
      label: halfShiftLabel(slot),
      short: `Half ${slot}`,
    };
  }
  return null;
}
