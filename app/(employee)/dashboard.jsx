import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import PrimaryButton from '../../src/components/PrimaryButton';
import { useAuth } from '../../src/auth/AuthContext';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function EmployeeDashboard() {
  const { primaryMembership, logout } = useAuth();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);

  return (
    <Screen>
      <AppHeader
        title="Employee"
        subtitle={primaryMembership?.companyName}
        onLogout={logout}
      />
      <Text style={styles.text}>Mark shifts, track history, payroll, and unlock locked days.</Text>
      <View style={styles.actions}>
        <PrimaryButton title="Today's attendance" onPress={() => router.push('/(employee)/attendance')} />
        <PrimaryButton title="History" variant="outline" onPress={() => router.push('/(employee)/history')} />
        <PrimaryButton title="Payroll" variant="outline" onPress={() => router.push('/(employee)/payroll')} />
        <PrimaryButton title="Unlock requests" variant="outline" onPress={() => router.push('/(employee)/unlock-requests')} />
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
