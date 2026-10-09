import { SHIFT_STATUS } from '../constants/shifts';
import { formatShiftResponseKey, formatShiftStatus, shiftStatusChipTone } from './shiftLabels';

export function getAttendanceEmployeeName(row) {
  return row?.employee?.name ?? row?.employeeName ?? '—';
}

export function getAttendanceEmployeeProfilePicture(row) {
  return row?.employee?.profilePicture ?? row?.employee?.profile_picture ?? null;
}

export function shiftsCountedForAttendanceStatus(shifts) {
  const counted = {};
  for (const [key, shift] of Object.entries(shifts || {})) {
    if (!shift || key === 'halfShifts') continue;
    if (key === 'extraDay' || key === 'extraNight') {
      if (shift.marked) counted[key] = shift;
      continue;
    }
    if (shift.marked) counted[key] = shift;
  }
  for (const half of shifts?.halfShifts || []) {
    if (half?.marked && half.shiftKey) {
      counted[half.shiftKey] = half;
    }
  }
  return counted;
}

export function getAttendanceShiftStatusEntries(shifts) {
  const counted = shiftsCountedForAttendanceStatus(shifts);
  return Object.entries(counted).map(([responseKey, shift]) => ({
    responseKey,
    shiftLabel: formatShiftResponseKey(responseKey),
    label: formatShiftStatus(shift?.status),
    tone: shiftStatusChipTone(shift?.status),
  }));
}

export function sumShiftAmountsFromShifts(shifts) {
  let total = 0;
  let hasAmount = false;
  for (const shift of Object.values(shiftsCountedForAttendanceStatus(shifts))) {
    if (shift?.amount != null && !Number.isNaN(Number(shift.amount))) {
      total += Number(shift.amount);
      hasAmount = true;
    }
  }
  return hasAmount ? total : null;
}

export function attendanceListRangeLabel(page, pageSize, total) {
  if (!total) return 'No records in this range.';
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return `Showing ${start}–${end} of ${total}`;
}
