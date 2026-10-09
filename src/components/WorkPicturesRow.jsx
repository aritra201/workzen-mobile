import { Image, ScrollView, Text, View } from 'react-native';
import { getShiftWorkPictureUrls } from '../utils/workPictures';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function WorkPicturesRow({ shift }) {
  const styles = useThemedStyles(createStyles);
  const urls = getShiftWorkPictureUrls(shift);
  if (!urls.length) {
    return <Text style={styles.empty}>No work photos</Text>;
  }
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
      {urls.map((uri, index) => (
        <Image key={`${uri}-${index}`} source={{ uri }} style={styles.thumb} />
      ))}
    </ScrollView>
  );
}

function createStyles(colors) {
  return {
    row: { marginVertical: 8 },
    thumb: {
      width: 72,
      height: 72,
      borderRadius: 8,
      marginRight: 8,
      backgroundColor: colors.surfaceContainer,
    },
    empty: { fontSize: 13, color: colors.onSurfaceVariant, marginVertical: 4 },
  };
}
