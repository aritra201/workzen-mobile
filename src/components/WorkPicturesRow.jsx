import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { getShiftWorkPictureUrls } from '../utils/workPictures';
import { useThemedStyles } from '../theme/useThemedStyles';
import WorkPictureLightbox from './WorkPictureLightbox';

export default function WorkPicturesRow({ shift }) {
  const styles = useThemedStyles(createStyles);
  const urls = getShiftWorkPictureUrls(shift);
  const [previewIndex, setPreviewIndex] = useState(null);

  if (!urls.length) {
    return <Text style={styles.empty}>No work photos</Text>;
  }

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {urls.map((uri, index) => (
          <Pressable
            key={`${uri}-${index}`}
            onPress={() => setPreviewIndex(index)}
            accessibilityLabel="View work photo"
            style={({ pressed }) => [styles.thumbBtn, pressed && styles.thumbPressed]}
          >
            <Image source={{ uri }} style={styles.thumb} />
          </Pressable>
        ))}
      </ScrollView>
      <WorkPictureLightbox
        visible={previewIndex != null}
        urls={urls}
        initialIndex={previewIndex ?? 0}
        onClose={() => setPreviewIndex(null)}
      />
    </>
  );
}

function createStyles(colors) {
  return {
    row: { marginVertical: 8 },
    thumbBtn: {
      marginRight: 8,
      borderRadius: 8,
      overflow: 'hidden',
    },
    thumbPressed: { opacity: 0.85 },
    thumb: {
      width: 72,
      height: 72,
      borderRadius: 8,
      backgroundColor: colors.surfaceContainer,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    empty: { fontSize: 13, color: colors.onSurfaceVariant, marginVertical: 4 },
  };
}
