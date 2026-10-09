import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { listEmployees, listPresentEmployees } from '../../src/api/employees';
import { listCompanyAttendance } from '../../src/api/companyAttendance';
import { listUnlockRequestsAdmin } from '../../src/api/unlockRequests';
import { getListItems } from '../../src/utils/attendanceList';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import LoadingState from '../../src/components/LoadingState';
import StatCard from '../../src/components/StatCard';
import { useAuth } from '../../src/auth/AuthContext';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function AdminDashboard() {
  const { primaryMembership, logout } = useAuth();
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [employees, present, unlocks, pending] = await Promise.all([
        listEmployees({ limit: 1, page: 1 }),
        listPresentEmployees({ limit: 1 }),
        listUnlockRequestsAdmin({ status: 'pending', limit: 1 }),
        listCompanyAttendance({ status: 'pending_verification', limit: 5 }),
      ]);
      setStats({
        workforce: employees?.total ?? 0,
        present: present?.total ?? 0,
        unlocks: unlocks?.total ?? 0,
        pending: pending?.total ?? 0,
        recent: getListItems(pending),
      });
    } catch {
      setStats({ workforce: 0, present: 0, unlocks: 0, pending: 0, recent: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && !stats) {
    return <LoadingState />;
  }

  return (
    <Screen>
      <AppHeader title="Admin" subtitle={primaryMembership?.companyName} onLogout={logout} />
      <View style={styles.grid}>
        <StatCard
          label="Workforce"
          value={stats?.workforce ?? 0}
          sub={`${stats?.present ?? 0} present today`}
          onPress={() => router.push('/(admin)/team')}
        />
        <StatCard
          label="Verification"
          value={stats?.pending ?? 0}
          sub="Pending reviews"
          onPress={() => router.push('/(admin)/verification')}
        />
        <StatCard
          label="Unlocks"
          value={stats?.unlocks ?? 0}
          sub="Awaiting decision"
          onPress={() => router.push('/(admin)/unlock')}
        />
      </View>
      <Pressable style={styles.linkRow} onPress={() => router.push('/(admin)/company')}>
        <Text style={styles.linkText}>Company profile & password</Text>
      </Pressable>
      <Pressable style={styles.linkRow} onPress={() => router.push('/(admin)/attendance')}>
        <Text style={styles.linkText}>All attendance</Text>
      </Pressable>
    </Screen>
  );
}

function createStyles(colors) {
  return {
    grid: { gap: 12, marginBottom: 8 },
    linkRow: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    linkText: { fontSize: 16, fontWeight: '600', color: colors.onSurface },
  };
}
