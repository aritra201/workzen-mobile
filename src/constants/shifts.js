export const SHIFT_KEY = {
  DAY: 'day',
  NIGHT: 'night',
  EXTRA_DAY: 'extra_day',
  EXTRA_NIGHT: 'extra_night',
};

export const SHIFT_META = {
  [SHIFT_KEY.DAY]: { label: 'Day shift', short: 'Day', responseKey: 'day' },
  [SHIFT_KEY.NIGHT]: { label: 'Night shift', short: 'Night', responseKey: 'night' },
  [SHIFT_KEY.EXTRA_DAY]: { label: 'Extra day', short: 'Extra day', responseKey: 'extraDay' },
  [SHIFT_KEY.EXTRA_NIGHT]: { label: 'Extra night', short: 'Extra night', responseKey: 'extraNight' },
};

export const SHIFT_STATUS = {
  AWAITING_ATTENDANCE: 'awaiting_attendance',
  AWAITING_SUBMISSION: 'awaiting_submission',
  PENDING_VERIFICATION: 'pending_verification',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};
