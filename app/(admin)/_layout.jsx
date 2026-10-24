import { Tabs, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { COMPANY_ROLE } from '../../src/constants/roles';
import LoadingState from '../../src/components/LoadingState';
import { useTheme } from '../../src/theme/ThemeContext';
import { getTabScreenOptions, tabIcon } from '../../src/theme/tabBar';

export default function AdminLayout() {
  const { loading, primaryMembership } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (loading) return <LoadingState />;
  if (primaryMembership?.role !== COMPANY_ROLE.ADMIN) {
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
        name="verification"
        options={{ title: 'Verify', tabBarLabel: 'Verify', tabBarIcon: tabIcon('fact-check') }}
      />
      <Tabs.Screen
        name="attendance"
        options={{ title: 'Attend', tabBarLabel: 'Attend', tabBarIcon: tabIcon('calendar-month') }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: 'Pay', tabBarLabel: 'Pay', tabBarIcon: tabIcon('payments') }}
      />
      <Tabs.Screen
        name="unlock"
        options={{ title: 'Unlock', tabBarLabel: 'Unlock', tabBarIcon: tabIcon('lock-open') }}
      />
      <Tabs.Screen
        name="team"
        options={{ title: 'Team', tabBarLabel: 'Team', tabBarIcon: tabIcon('groups') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Company', tabBarLabel: 'Me', tabBarIcon: tabIcon('person') }}
      />
      <Tabs.Screen name="company" options={{ href: null }} />
    </Tabs>
  );
}
