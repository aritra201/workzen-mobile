import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WorkZenLogo from './WorkZenLogo';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function AuthShell({ children }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <WorkZenLogo size={32} compact />
        </View>
        <View style={styles.toggleWrap}>
          <ThemeToggle />
        </View>
      </View>
      <View style={styles.main}>
        <View pointerEvents="none" style={styles.glowPrimary} />
        <View pointerEvents="none" style={styles.glowSecondary} />
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return {
    safe: {
      flex: 1,
    },
    header: {
      zIndex: 10,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
      backgroundColor: colors.surface,
      overflow: 'visible',
    },
    logoWrap: {
      flex: 1,
      minWidth: 0,
      marginRight: 12,
    },
    toggleWrap: {
      flexShrink: 0,
    },
    main: {
      flex: 1,
      position: 'relative',
      backgroundColor: colors.surface,
    },
    glowPrimary: {
      position: 'absolute',
      top: 24,
      left: -100,
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: colors.primary,
      opacity: 0.07,
    },
    glowSecondary: {
      position: 'absolute',
      top: 120,
      right: -80,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: colors.secondaryContainer,
      opacity: 0.14,
    },
    content: {
      flex: 1,
      zIndex: 2,
      backgroundColor: colors.surface,
    },
  };
}
