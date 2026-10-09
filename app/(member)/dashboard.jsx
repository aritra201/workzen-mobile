import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import PrimaryButton from '../../src/components/PrimaryButton';
import { useAuth } from '../../src/auth/AuthContext';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function MemberDashboard() {
  const { primaryMembership, logout } = useAuth();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  return (
    <Screen>
      <AppHeader title="Member" subtitle={primaryMembership?.companyName} onLogout={logout} />
      <Text style={styles.text}>Read-only attendance and payroll for your company.</Text>
      <View style={styles.actions}>
        <PrimaryButton title="Attendance" onPress={() => router.push('/(member)/attendance')} />
        <PrimaryButton title="Payroll" variant="outline" onPress={() => router.push('/(member)/reports')} />
        <PrimaryButton title="Profile" variant="outline" onPress={() => router.push('/(member)/profile')} />
      </View>
    </Screen>
  );
}

function createStyles(colors) {
  return {
    text: { fontSize: 15, color: colors.onSurfaceVariant, marginBottom: 20, lineHeight: 22 },
    actions: { gap: 10 },
  };
}
