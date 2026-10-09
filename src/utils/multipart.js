import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { getAccessToken } from './storage';

export function isFormDataBody(body) {
  return body != null && typeof body.append === 'function';
}

function fileNameFromAsset(asset) {
  return asset.fileName || asset.name || `upload-${Date.now()}.jpg`;
}

function mimeTypeFromAsset(asset) {
  return asset.mimeType || asset.type || 'image/jpeg';
}

async function resolveUploadUri(asset) {
  const uri = asset.uri;
  if (!uri) {
    throw new Error('Image is missing a file URI.');
  }
  if (Platform.OS === 'web' || !uri.startsWith('content://')) {
    return uri;
  }
  const ext = mimeTypeFromAsset(asset).includes('png') ? 'png' : 'jpg';
  const dest = `${FileSystem.cacheDirectory}workzen-upload-${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

function parseUploadBody(body) {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return { message: body };
  }
}

/**
 * Native multipart upload (avoids RN Blob + Expo fetch FormData issues).
 */
export async function uploadImageField(apiPath, fieldName, asset, { method = 'POST', headers = {} } = {}) {
  const base = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = `${base}${apiPath}`;
  const fileUri = await resolveUploadUri(asset);
  const token = await getAccessToken();
  const uploadHeaders = { ...headers };
  if (token && !uploadHeaders.Authorization) {
    uploadHeaders.Authorization = `Bearer ${token}`;
  }

  const result = await FileSystem.uploadAsync(url, fileUri, {
    httpMethod: method,
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName,
    mimeType: mimeTypeFromAsset(asset),
    headers: uploadHeaders,
  });

  const data = parseUploadBody(result.body);
  if (result.status < 200 || result.status >= 300) {
    const message = data?.message || `Upload failed (${result.status})`;
    const error = new Error(message);
    error.status = result.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function assetToWebBlob(asset) {
  const response = await fetch(asset.uri);
  if (!response.ok) {
    throw new Error('Could not read the selected image.');
  }
  return await response.blob();
}

/**
 * Append an image to FormData (web and multi-file native fallback).
 */
export async function appendImageToFormData(formData, fieldName, asset) {
  const fileName = fileNameFromAsset(asset);
  if (Platform.OS === 'web') {
    const blob = await assetToWebBlob(asset);
    formData.append(fieldName, blob, fileName);
    return;
  }

  const fileUri = await resolveUploadUri(asset);
  formData.append(fieldName, {
    uri: fileUri,
    name: fileName,
    type: mimeTypeFromAsset(asset),
  });
}

export async function createImageFormData(fieldName, asset) {
  const formData = new FormData();
  await appendImageToFormData(formData, fieldName, asset);
  return formData;
}

/**
 * Single-image upload: native uses FileSystem.uploadAsync; web uses FormData + apiRequest.
 */
export async function uploadSingleImage(apiPath, fieldName, asset, requestOptions = {}) {
  if (Platform.OS !== 'web') {
    return uploadImageField(apiPath, fieldName, asset, {
      method: requestOptions.method || 'POST',
      headers: requestOptions.headers || {},
    });
  }
  const { apiRequest } = await import('../api/client');
  const formData = await createImageFormData(fieldName, asset);
  return apiRequest(apiPath, {
    method: 'POST',
    body: formData,
    ...requestOptions,
  });
}

/**
 * Multipart POST using XMLHttpRequest on native (supports `{ uri }` parts; Expo fetch does not).
 */
export async function postMultipartRequest(apiPath, formData, { method = 'POST', headers = {} } = {}) {
  if (Platform.OS === 'web') {
    const { apiRequest } = await import('../api/client');
    return apiRequest(apiPath, { method, body: formData, headers });
  }

  const base = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');
  const url = `${base}${apiPath}`;
  const token = await getAccessToken();
  const reqHeaders = { ...headers };
  if (token && !reqHeaders.Authorization) {
    reqHeaders.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.entries(reqHeaders).forEach(([key, value]) => {
      if (value != null) xhr.setRequestHeader(key, String(value));
    });
    xhr.onload = () => {
      let data = null;
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : null;
      } catch {
        data = { message: xhr.responseText };
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }
      const message = data?.message || `Upload failed (${xhr.status})`;
      const error = new Error(message);
      error.status = xhr.status;
      error.data = data;
      reject(error);
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}
