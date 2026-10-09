import * as Location from 'expo-location';

/**
 * Same shape as web geolocation helper: { lat, lng } for attendance API.
 */
export async function getSubmitGeoLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission is required to mark attendance.');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
}
