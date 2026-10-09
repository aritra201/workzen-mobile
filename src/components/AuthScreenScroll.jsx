import { ScrollView, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

/**
 * Full-height themed scroll area for auth screens (fixes white gaps in dark mode on web).
 * @param {'top' | 'center'} align — `top` for short forms (forgot/reset); `center` for login-style pages.
 */
export default function AuthScreenScroll({ children, contentStyle, align = 'top' }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.surface }]}
        contentContainerStyle={[
          styles.content,
          align === 'center' && styles.contentCentered,
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

function createStyles(colors) {
  return {
    root: {
      flex: 1,
      minHeight: '100%',
    },
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'flex-start',
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 32,
      maxWidth: 520,
      width: '100%',
      alignSelf: 'center',
      backgroundColor: colors.surface,
    },
    contentCentered: {
      justifyContent: 'center',
      paddingTop: 16,
    },
  };
}
