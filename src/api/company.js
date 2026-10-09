import { apiRequest } from './client';
import { uploadSingleImage } from '../utils/multipart';

export function getCompanyProfile() {
  return apiRequest('/api/company/');
}

export function updateCompanyProfile(body) {
  return apiRequest('/api/company/', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function uploadCompanyProfilePicture(asset) {
  return uploadSingleImage('/api/company/profile-picture', 'companyProfilePicture', asset);
}
