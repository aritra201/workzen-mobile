import { Tabs, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { COMPANY_ROLE } from '../../src/constants/roles';
import LoadingState from '../../src/components/LoadingState';
import { useTheme } from '../../src/theme/ThemeContext';
import { getTabScreenOptions, tabIcon } from '../../src/theme/tabBar';

export default function EmployeeLayout() {
  const { loading, primaryMembership } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (loading) return <LoadingState />;
  if (primaryMembership?.role !== COMPANY_ROLE.EMPLOYEE) {
    return <Redirect href="/" />;
  }

  const screenOptions = getTabScreenOptions(colors, { bottomInset: insets.bottom });

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Home', tabBarLabel: 'Home', tabBarIcon: tabIcon('home') }}
      />
      <Tabs.Screen
        name="attendance"
        options={{ title: 'Today', tabBarLabel: 'Today', tabBarIcon: tabIcon('today') }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'History', tabBarLabel: 'Past', tabBarIcon: tabIcon('history') }}
      />
      <Tabs.Screen
        name="unlock-requests"
        options={{ title: 'Unlock', tabBarLabel: 'Unlock', tabBarIcon: tabIcon('lock-open') }}
      />
      <Tabs.Screen
        name="payroll"
        options={{ title: 'Pay', tabBarLabel: 'Pay', tabBarIcon: tabIcon('account-balance-wallet') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarLabel: 'Me', tabBarIcon: tabIcon('person') }}
      />
    </Tabs>
  );
}
