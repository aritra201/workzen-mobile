import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from './PrimaryButton';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function WorkPictureLightbox({ visible, urls, initialIndex = 0, onClose }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (visible) {
      setIndex(initialIndex);
    }
  }, [visible, initialIndex]);

  if (!visible || !urls?.length) {
    return null;
  }

  const safeIndex = Math.min(Math.max(0, index), urls.length - 1);
  const uri = urls[safeIndex];
  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < urls.length - 1;
  const title =
    urls.length > 1 ? `Proof of work (${safeIndex + 1} of ${urls.length})` : 'Proof of work';

  const imageMaxHeight = height - insets.top - insets.bottom - 160;
  const imageMaxWidth = width - 32;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.backdrop, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            accessibilityLabel="Close"
            style={styles.closeBtn}
          >
            <MaterialIcons name="close" size={26} color="#f8fafc" />
          </Pressable>
        </View>

        <View style={styles.imageWrap}>
          <Image
            source={{ uri }}
            style={{ width: imageMaxWidth, height: imageMaxHeight, maxWidth: '100%' }}
            resizeMode="contain"
            accessibilityLabel="Work proof photo"
          />
        </View>

        {urls.length > 1 ? (
          <View style={styles.navRow}>
            <PrimaryButton
              title="Previous"
              variant="outline"
              compact
              disabled={!hasPrev}
              onPress={() => setIndex((i) => Math.max(0, i - 1))}
            />
            <PrimaryButton
              title="Next"
              variant="outline"
              compact
              disabled={!hasNext}
              onPress={() => setIndex((i) => Math.min(urls.length - 1, i + 1))}
            />
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function createStyles(colors) {
  return {
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: '#f8fafc',
    },
    closeBtn: {
      padding: 4,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.12)',
    },
    imageWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    navRow: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
  };
}
