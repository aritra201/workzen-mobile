import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function StatusChip({ children, tone = 'neutral' }) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const palette = tonePalette(tone, colors, isDark);

  return (
    <View style={[styles.chip, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>{children}</Text>
    </View>
  );
}

function tonePalette(tone, colors, isDark) {
  const map = {
    verified: {
      bg: isDark ? 'rgba(52, 211, 153, 0.2)' : '#d4f5e8',
      text: colors.statusVerified,
    },
    pending: {
      bg: isDark ? 'rgba(251, 191, 36, 0.2)' : '#fff3cd',
      text: colors.statusPending,
    },
    rejected: {
      bg: isDark ? 'rgba(248, 113, 113, 0.2)' : '#fde8e8',
      text: colors.statusDenied,
    },
    locked: {
      bg: isDark ? colors.surfaceContainerHigh : '#e8eaed',
      text: colors.statusLocked,
    },
    neutral: {
      bg: colors.surfaceContainer,
      text: colors.onSurfaceVariant,
    },
    notMarked: {
      bg: isDark ? colors.surfaceContainerHigh : colors.surfaceContainer,
      text: colors.onSurfaceVariant,
    },
  };
  return map[tone] || map.neutral;
}

function createStyles() {
  return {
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      alignSelf: 'flex-start',
    },
    text: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  };
}
