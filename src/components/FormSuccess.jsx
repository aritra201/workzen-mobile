import { Text, View } from 'react-native';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function FormSuccess({ message }) {
  const styles = useThemedStyles(createStyles);
  if (!message) return null;
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

function createStyles(colors) {
  return {
    box: {
      marginTop: 12,
      marginBottom: 4,
      padding: 12,
      borderRadius: 10,
      backgroundColor: colors.primaryContainer,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    text: {
      color: colors.onPrimaryContainer,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
    },
  };
}
