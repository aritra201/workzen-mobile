import { Pressable, Text } from 'react-native';
import MobileListCard from './MobileListCard';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function StatCard({ label, value, sub, onPress }) {
  const styles = useThemedStyles(createStyles);
  return (
    <MobileListCard onPress={onPress} style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.sub}>{sub}</Text>
    </MobileListCard>
  );
}

function createStyles(colors) {
  return {
    card: { marginBottom: 0 },
    label: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      color: colors.onSurfaceVariant,
    },
    value: {
      fontSize: 28,
      fontWeight: '800',
      marginVertical: 4,
      color: colors.primary,
    },
    sub: {
      fontSize: 13,
      color: colors.onSurfaceVariant,
    },
  };
}
