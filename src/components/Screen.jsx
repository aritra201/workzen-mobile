import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function Screen({ children, scroll = true, style, edges = ['top', 'left', 'right'] }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, style]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.surface }]} edges={edges}>
      {content}
    </SafeAreaView>
  );
}

function createStyles() {
  return {
    safe: {
      flex: 1,
    },
    fill: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
      paddingBottom: 96,
      paddingTop: 4,
    },
  };
}
