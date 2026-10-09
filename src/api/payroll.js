import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { apiRequest, API_BASE } from './client';
import { getAccessToken } from '../utils/storage';

export function listMyPayroll(params = {}) {
  const search = new URLSearchParams(params).toString();
  const qs = search ? `?${search}` : '';
  return apiRequest(`/api/payroll/me${qs}`);
}

export function listPayroll(params = {}) {
  const search = new URLSearchParams(params).toString();
  const qs = search ? `?${search}` : '';
  return apiRequest(`/api/payroll${qs}`);
}

function filenameFromContentDisposition(header) {
  if (!header) return null;
  const match = /filename="([^"]+)"/i.exec(header);
  return match?.[1] ?? null;
}

/** Unique name so repeat exports do not trigger "replace or keep both" in Files/Downloads. */
function uniqueExportFilename(serverFilename) {
  const raw = (serverFilename || 'payroll-export.csv').replace(/[/\\]/g, '_');
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dot = raw.lastIndexOf('.');
  if (dot > 0) {
    return `${raw.slice(0, dot)}_${stamp}${raw.slice(dot)}`;
  }
  return `${raw}_${stamp}.csv`;
}

/** Download payroll CSV and open the system share sheet (save / open in another app). */
export async function downloadPayrollCsv(params = {}) {
  const search = new URLSearchParams(params).toString();
  const qs = search ? `?${search}` : '';
  const token = await getAccessToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/api/payroll/export${qs}`, { headers });
  if (!response.ok) {
    const text = await response.text();
    let message = `Export failed (${response.status})`;
    try {
      const data = JSON.parse(text);
      if (data?.message) message = data.message;
    } catch {
      if (text) message = text;
    }
    throw new Error(message);
  }

  const csvText = await response.text();
  const serverName = filenameFromContentDisposition(response.headers.get('Content-Disposition'));
  const filename = uniqueExportFilename(serverName);
  const dir = FileSystem.cacheDirectory;
  if (!dir) {
    throw new Error('File storage is not available on this device.');
  }
  const path = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(path, csvText, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(path, {
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
  });

  return { filename, path };
}
