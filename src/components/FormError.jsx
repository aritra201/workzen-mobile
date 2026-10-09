import { Text, View } from 'react-native';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function FormError({ message }) {
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
      backgroundColor: colors.errorContainer,
    },
    text: {
      color: colors.error,
      fontSize: 14,
      lineHeight: 20,
    },
  };
}
