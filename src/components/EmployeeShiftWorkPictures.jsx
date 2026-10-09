import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import {
  deleteWorkPictures,
  replaceWorkPictures,
  uploadWorkPictures,
} from '../api/attendance';
import { getShiftWorkPictureUrls } from '../utils/workPictures';
import { pickImageFromLibrary, pickImagesFromLibrary } from '../utils/pickImage';
import { useThemedStyles } from '../theme/useThemedStyles';
import WorkPictureLightbox from './WorkPictureLightbox';

export const MAX_SHIFT_WORK_PICTURES = 10;

export default function EmployeeShiftWorkPictures({
  shift,
  shiftKey,
  attendanceDate,
  disabled,
  busy,
  onBusyChange,
  onUpdated,
  onError,
  onSuccess,
}) {
  const styles = useThemedStyles(createStyles);
  const pictureUrls = getShiftWorkPictureUrls(shift);
  const [replacingUrl, setReplacingUrl] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(null);

  async function run(action) {
    onError('');
    onBusyChange(true);
    try {
      await action();
      await onUpdated();
      onSuccess?.();
    } catch (err) {
      onError(err.message);
    } finally {
      onBusyChange(false);
      setReplacingUrl(null);
    }
  }

  async function handleAdd() {
    const remaining = MAX_SHIFT_WORK_PICTURES - pictureUrls.length;
    if (remaining <= 0) return;
    const assets = await pickImagesFromLibrary();
    if (!assets.length) return;
    const toUpload = assets.slice(0, remaining);
    await run(() => uploadWorkPictures(toUpload, { shiftKey, attendanceDate }));
  }

  async function handleRemove(url) {
    await run(() => deleteWorkPictures({ urls: [url] }, { shiftKey, attendanceDate }));
  }

  async function handleReplace(url) {
    setReplacingUrl(url);
    const asset = await pickImageFromLibrary({ allowsEditing: false });
    if (!asset) {
      setReplacingUrl(null);
      return;
    }
    await run(() => replaceWorkPictures([asset], [url], { shiftKey, attendanceDate }));
  }

  const canAddMore = pictureUrls.length < MAX_SHIFT_WORK_PICTURES;

  return (
    <View>
      <Text style={styles.heading}>
        Proof of work {pictureUrls.length ? `(${pictureUrls.length})` : '(optional)'}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {pictureUrls.map((url, index) => (
          <View key={`${url}-${index}`} style={styles.thumbWrap}>
            <Pressable
              onPress={() => setPreviewIndex(index)}
              accessibilityLabel="View work photo"
              style={styles.thumbTap}
            >
              <Image source={{ uri: url }} style={styles.thumb} />
            </Pressable>
            {!disabled ? (
              <>
                <Pressable
                  style={styles.removeBtn}
                  disabled={busy}
                  onPress={() => handleRemove(url)}
                  accessibilityLabel="Remove photo"
                >
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
                <Pressable
                  style={styles.replaceBtn}
                  disabled={busy}
                  onPress={() => handleReplace(url)}
                >
                  <Text style={styles.replaceText}>
                    {busy && replacingUrl === url ? '…' : 'Replace'}
                  </Text>
                </Pressable>
              </>
            ) : null}
          </View>
        ))}
        {!disabled && canAddMore ? (
          <Pressable
            style={styles.addBtn}
            disabled={busy}
            onPress={handleAdd}
            accessibilityLabel="Add work photo"
          >
            <Text style={styles.addIcon}>+</Text>
            <Text style={styles.addLabel}>Add</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      {!disabled && !canAddMore ? (
        <Text style={styles.hint}>
          Maximum {MAX_SHIFT_WORK_PICTURES} photos per shift. Remove or replace one to change.
        </Text>
      ) : null}
      <WorkPictureLightbox
        visible={previewIndex != null}
        urls={pictureUrls}
        initialIndex={previewIndex ?? 0}
        onClose={() => setPreviewIndex(null)}
      />
    </View>
  );
}

function createStyles(colors) {
  return {
    heading: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: colors.onSurfaceVariant,
      marginTop: 4,
      marginBottom: 8,
    },
    row: { marginBottom: 4 },
    thumbWrap: {
      width: 72,
      height: 72,
      marginRight: 8,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    thumbTap: { width: '100%', height: '100%' },
    thumb: { width: '100%', height: '100%' },
    removeBtn: {
      position: 'absolute',
      top: -2,
      right: -2,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeText: { color: colors.onError, fontSize: 16, fontWeight: '700', lineHeight: 18 },
    replaceBtn: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.72)',
      paddingVertical: 2,
      alignItems: 'center',
    },
    replaceText: { color: '#fff', fontSize: 10, fontWeight: '600' },
    addBtn: {
      width: 72,
      height: 72,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    addIcon: { fontSize: 22, color: colors.onSurfaceVariant, fontWeight: '300' },
    addLabel: { fontSize: 10, color: colors.onSurfaceVariant, marginTop: 2 },
    hint: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 4 },
  };
}
