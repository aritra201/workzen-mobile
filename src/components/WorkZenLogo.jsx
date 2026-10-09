import { Image, Text, View } from 'react-native';
import { WORKZEN_LOGO_URI } from '../constants/brand';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function WorkZenLogo({
  size = 48,
  showTagline = false,
  tagline = 'Field Operations & Ledger OS',
  compact = false,
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Image source={{ uri: WORKZEN_LOGO_URI }} style={[styles.logo, { width: size, height: size }]} />
      <View style={[styles.text, compact && styles.textCompact]}>
        <Text style={styles.brand} numberOfLines={1}>WorkZen</Text>
        {showTagline ? (
          <Text style={styles.tagline} numberOfLines={1}>{tagline}</Text>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors) {
  return {
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      maxWidth: '100%',
    },
    rowCompact: {
      gap: 8,
    },
    logo: {
      borderRadius: 10,
      backgroundColor: colors.surfaceContainerLow,
      flexShrink: 0,
    },
    text: {
      flex: 1,
      minWidth: 0,
      flexShrink: 1,
    },
    textCompact: {
      flex: 0,
    },
    brand: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.onSurface,
    },
    tagline: {
      marginTop: 2,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: colors.onSurfaceVariant,
    },
  };
}
