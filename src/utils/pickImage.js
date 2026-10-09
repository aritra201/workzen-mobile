import * as ImagePicker from 'expo-image-picker';

export async function pickImageFromLibrary({ allowsEditing = true } = {}) {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error('Photo library permission is required.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
    allowsEditing,
    aspect: allowsEditing ? [1, 1] : undefined,
  });
  if (result.canceled || !result.assets?.[0]) {
    return null;
  }
  return result.assets[0];
}

export async function pickImagesFromLibrary() {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error('Photo library permission is required.');
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 0.85,
  });
  if (result.canceled || !result.assets?.length) {
    return [];
  }
  return result.assets;
}
