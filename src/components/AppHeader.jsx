import { Pressable, Text, View } from 'react-native';
import ThemeToggle from './ThemeToggle';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function AppHeader({ title, subtitle, onLogout, showThemeToggle = true }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <View style={styles.textBlock}>
        <Text style={styles.kicker}>WorkZen</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        {showThemeToggle ? <ThemeToggle /> : null}
        {onLogout ? (
          <Pressable onPress={onLogout} hitSlop={8} style={styles.logoutBtn}>
            <Text style={styles.logout}>Log out</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors) {
  return {
    wrap: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 18,
      marginTop: 4,
      gap: 12,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    textBlock: {
      flex: 1,
      minWidth: 0,
      paddingRight: 8,
    },
    kicker: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: colors.primary,
      marginBottom: 4,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.onSurface,
    },
    subtitle: {
      fontSize: 13,
      color: colors.onSurfaceVariant,
      marginTop: 4,
    },
    actions: {
      flexShrink: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 10,
    },
    logoutBtn: {
      paddingVertical: 4,
    },
    logout: {
      color: colors.primary,
      fontWeight: '600',
      fontSize: 13,
    },
  };
}
