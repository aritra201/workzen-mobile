import { SHIFT_KEY, SHIFT_META, SHIFT_STATUS } from '../constants/shifts';

export function shiftFromResponse(attendance, shiftKey) {
  const meta = SHIFT_META[shiftKey];
  if (!meta) return null;
  return attendance?.shifts?.[meta.responseKey] ?? { marked: false };
}

export function listMarkAttendanceShiftItems(attendance) {
  const fixedOrder = [SHIFT_KEY.DAY, SHIFT_KEY.NIGHT, SHIFT_KEY.EXTRA_DAY, SHIFT_KEY.EXTRA_NIGHT];
  const fixed = fixedOrder.map((shiftKey) => ({
    shiftKey,
    shift: shiftFromResponse(attendance, shiftKey),
    accordionId: shiftKey,
  }));

  const half = (attendance?.shifts?.halfShifts ?? []).map((entry) => ({
    shiftKey: entry.shiftKey,
    shift: entry?.marked ? entry : { ...entry, status: undefined },
    label: entry.shiftKey?.replace(/_/g, ' ') || 'Half shift',
    accordionId: entry.shiftKey,
  }));

  return [...fixed, ...half];
}

export function isShiftDetailsLockedForEmployee(shift, attendance) {
  if (attendance?.lockAttendance || attendance?.canEdit === false) return true;
  const status = shift?.status;
  return status === SHIFT_STATUS.VERIFIED || status === SHIFT_STATUS.REJECTED;
}

export function statusLabel(status, lockAttendance) {
  if (lockAttendance) return 'Locked';
  switch (status) {
    case SHIFT_STATUS.VERIFIED:
      return 'Verified';
    case SHIFT_STATUS.REJECTED:
      return 'Rejected';
    case SHIFT_STATUS.PENDING_VERIFICATION:
      return 'Pending';
    case SHIFT_STATUS.AWAITING_SUBMISSION:
      return 'Awaiting submission';
    case SHIFT_STATUS.AWAITING_ATTENDANCE:
      return 'Not marked';
    default:
      return status ? String(status) : '—';
  }
}

export function shiftDisplayLabel(shiftKey, fallback) {
  return SHIFT_META[shiftKey]?.label || fallback || shiftKey;
}
