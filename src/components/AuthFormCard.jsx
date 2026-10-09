import { StyleSheet, Text, View } from 'react-native';
import WorkZenLogo from './WorkZenLogo';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function AuthFormCard({ title, subtitle, children, showBranding = true }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.card}>
      {showBranding ? <WorkZenLogo size={48} showTagline /> : null}
      {title ? <Text style={[styles.title, !showBranding && styles.titleCompact]}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

export function AuthDivider({ label = 'or email' }) {
  const styles = useThemedStyles(createDividerStyles);
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

function createStyles(colors) {
  return {
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 22,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 2,
      zIndex: 1,
      width: '100%',
    },
    title: {
      marginTop: 20,
      fontSize: 24,
      fontWeight: '700',
      color: colors.onSurface,
    },
    titleCompact: {
      marginTop: 0,
    },
    subtitle: {
      marginTop: 6,
      fontSize: 14,
      lineHeight: 20,
      color: colors.onSurfaceVariant,
    },
    body: {
      marginTop: 8,
      zIndex: 1,
    },
  };
}

function createDividerStyles(colors) {
  return {
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginVertical: 18,
    },
    line: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.outlineVariant,
      opacity: 0.5,
    },
    label: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.onSurfaceVariant,
    },
  };
}
