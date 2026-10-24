import { View } from 'react-native';
import { useRouter } from 'expo-router';
import PrimaryButton from './PrimaryButton';
import { useAuth } from '../auth/AuthContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function ProfileLogoutButton() {
  const { logout } = useAuth();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <View style={styles.wrap}>
      <PrimaryButton title="Log out" variant="outline" onPress={handleLogout} />
    </View>
  );
}

function createStyles() {
  return {
    wrap: { marginTop: 16, marginBottom: 8 },
  };
}
