import { Text, View } from 'react-native';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function ListPageHeader({ title, description }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

function createStyles(colors) {
  return {
    wrap: { marginBottom: 14 },
    title: { fontSize: 24, fontWeight: '800', color: colors.onSurface },
    description: { marginTop: 6, fontSize: 14, lineHeight: 20, color: colors.onSurfaceVariant },
  };
}
