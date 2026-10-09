const LAWSIKHO_COUNTRY_CODE_URL = 'https://lawsikho.com/api/v1/country-code';

export function dialCodeFromApi(countryCode) {
  const raw = String(countryCode ?? '').trim();
  if (!raw) {
    return '';
  }
  return raw.startsWith('+') ? raw : `+${raw}`;
}

/**
 * @returns {Promise<Array<{ id: number, countryName: string, dialCode: string, isoCode: string }>>}
 */
export async function fetchCountryDialCodes() {
  const response = await fetch(LAWSIKHO_COUNTRY_CODE_URL);
  if (!response.ok) {
    throw new Error('Could not load country codes');
  }
  const json = await response.json();
  const rows = json?.data ?? [];
  return rows
    .map((row) => ({
      id: row.id,
      countryName: row.country_name,
      dialCode: dialCodeFromApi(row.country_code),
      isoCode: row.iso_code,
    }))
    .sort((a, b) => a.countryName.localeCompare(b.countryName));
}
