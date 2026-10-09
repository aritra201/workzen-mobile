import { Tabs, Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/auth/AuthContext';
import { COMPANY_ROLE } from '../../src/constants/roles';
import LoadingState from '../../src/components/LoadingState';
import { useTheme } from '../../src/theme/ThemeContext';
import { getTabScreenOptions, tabIcon } from '../../src/theme/tabBar';

export default function MemberLayout() {
  const { loading, primaryMembership } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (loading) return <LoadingState />;
  if (primaryMembership?.role !== COMPANY_ROLE.MEMBER) {
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
        options={{ title: 'Attend', tabBarLabel: 'Attend', tabBarIcon: tabIcon('calendar-month') }}
      />
      <Tabs.Screen
        name="reports"
        options={{ title: 'Pay', tabBarLabel: 'Pay', tabBarIcon: tabIcon('payments') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarLabel: 'Me', tabBarIcon: tabIcon('person') }}
      />
    </Tabs>
  );
}
