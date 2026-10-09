export const INPUT_FILTER_MESSAGES = {
  numeric: 'Only numbers are allowed.',
  phoneIndiaLength: 'Indian phone numbers must be exactly 10 digits.',
  phoneOtherLength: 'Phone number must be at most 20 digits.',
};

const DEFAULT_NATIONAL_PHONE_MAX = 20;

export function filterNumericInput(value) {
  return String(value).replace(/\D/g, '');
}

export function normalizeDialCode(countryCode) {
  return String(countryCode ?? '').replace(/\D/g, '');
}

export function maxNationalPhoneDigits(countryCode) {
  if (normalizeDialCode(countryCode) === '91') {
    return 10;
  }
  return DEFAULT_NATIONAL_PHONE_MAX;
}

/** @returns {{ ok: boolean, message: string }} */
export function validateNationalPhone(phone, countryCode) {
  const digits = filterNumericInput(phone);
  if (!digits) {
    return { ok: true, message: '' };
  }
  if (normalizeDialCode(countryCode) === '91') {
    if (digits.length !== 10) {
      return { ok: false, message: INPUT_FILTER_MESSAGES.phoneIndiaLength };
    }
    return { ok: true, message: '' };
  }
  if (digits.length > DEFAULT_NATIONAL_PHONE_MAX) {
    return { ok: false, message: INPUT_FILTER_MESSAGES.phoneOtherLength };
  }
  return { ok: true, message: '' };
}

export function nationalPhoneHint(countryCode) {
  if (normalizeDialCode(countryCode) === '91') {
    return '10-digit mobile number (no country code)';
  }
  return `National number without country code (up to ${DEFAULT_NATIONAL_PHONE_MAX} digits)`;
}

export function trimPhoneToCountryLimit(phone, countryCode) {
  const digits = filterNumericInput(phone);
  const max = maxNationalPhoneDigits(countryCode);
  if (digits.length <= max) {
    return digits;
  }
  return digits.slice(0, max);
}

export const INPUT_FILTER_MESSAGES_AMOUNT = {
  required: 'Daily amount is required.',
  positive: 'Daily amount must be greater than 0.',
};

/** @returns {{ ok: boolean, value?: number, message: string }} */
export function parseDailyAmountForSubmit(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) {
    return { ok: false, message: INPUT_FILTER_MESSAGES_AMOUNT.required };
  }
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) {
    return { ok: false, message: INPUT_FILTER_MESSAGES_AMOUNT.positive };
  }
  return { ok: true, value: num, message: '' };
}
