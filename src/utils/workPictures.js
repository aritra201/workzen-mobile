export function getShiftWorkPictureUrls(shift) {
  const raw = shift?.workPictures ?? shift?.work_picture ?? [];
  if (!Array.isArray(raw)) return [];
  return raw.filter(Boolean);
}
