export const DEFAULT_DIAL_CODES = [
  { id: 0, countryName: 'India', dialCode: '+91', isoCode: 'IN' },
];

export function withCurrentCountryOption(options, matchKey, currentValue, fallbackOption) {
  if (!currentValue || options.some((c) => c[matchKey] === currentValue)) {
    return options;
  }
  return [fallbackOption, ...options];
}

export function buildDialCodeOptions(dialCodes, form) {
  const base = dialCodes.length > 0 ? dialCodes : DEFAULT_DIAL_CODES;
  return withCurrentCountryOption(base, 'dialCode', form.countryCode, {
    id: -1,
    countryName: form.country || 'Current',
    dialCode: form.countryCode || '+91',
    isoCode: 'XX',
  });
}

export function buildCountryNameOptions(dialCodes, form) {
  const base = dialCodes.length > 0 ? dialCodes : DEFAULT_DIAL_CODES;
  return withCurrentCountryOption(base, 'countryName', form.country, {
    id: -2,
    countryName: form.country,
    dialCode: form.countryCode || '+91',
    isoCode: 'XX',
  });
}
