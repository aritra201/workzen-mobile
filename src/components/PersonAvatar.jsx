import { Image, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

function initialsFromName(name, email) {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function PersonAvatar({ name, email, src, size = 40 }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const initials = initialsFromName(name, email);

  if (src) {
    return (
      <Image
        source={{ uri: src }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primaryContainer }]}>
      <Text style={[styles.initials, { fontSize: size * 0.36, color: colors.onPrimaryContainer }]}>{initials}</Text>
    </View>
  );
}

function createStyles() {
  return {
    image: {
      backgroundColor: '#333',
    },
    fallback: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    initials: {
      fontWeight: '700',
    },
  };
}
