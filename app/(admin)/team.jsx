import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import ListPageHeader from '../../src/components/ListPageHeader';
import AdminEmployeesPanel from '../../src/features/admin/AdminEmployeesPanel';
import AdminMembersPanel from '../../src/features/admin/AdminMembersPanel';
import { useThemedStyles } from '../../src/theme/useThemedStyles';

export default function AdminTeamScreen() {
  const [tab, setTab] = useState('employees');
  const styles = useThemedStyles(createStyles);

  return (
    <Screen style={styles.screenPad}>
      <AppHeader title="Team" subtitle="Employees & members" showThemeToggle />
      <View style={styles.segment}>
        <Pressable
          onPress={() => setTab('employees')}
          style={[styles.segmentBtn, tab === 'employees' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, tab === 'employees' && styles.segmentTextActive]}>Employees</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('members')}
          style={[styles.segmentBtn, tab === 'members' && styles.segmentBtnActive]}
        >
          <Text style={[styles.segmentText, tab === 'members' && styles.segmentTextActive]}>Members</Text>
        </Pressable>
      </View>
      <ListPageHeader
        title={tab === 'employees' ? 'Employees & labour' : 'Members'}
        description={
          tab === 'employees'
            ? 'Invite employees, set daily wages, and manage access.'
            : 'Invite read-only members for attendance and payroll.'
        }
      />
      {tab === 'employees' ? <AdminEmployeesPanel /> : <AdminMembersPanel />}
    </Screen>
  );
}

function createStyles(colors) {
  return {
    screenPad: {
      paddingBottom: 8,
    },
    segment: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
      padding: 4,
      borderRadius: 12,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    segmentBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    segmentBtnActive: {
      backgroundColor: colors.primary,
    },
    segmentText: {
      fontWeight: '700',
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    segmentTextActive: {
      color: colors.onPrimary,
    },
  };
}
