import { useState } from 'react';
import { Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { parseDateKey, toDateKey } from '../utils/dateRange';
import { formatDateLabel } from '../utils/format';
import PrimaryButton from './PrimaryButton';

export default function DateField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  compact = false,
  disabled = false,
  style,
}) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => parseDateKey(value));

  function openPicker() {
    if (disabled) return;
    setDraft(parseDateKey(value));
    setOpen(true);
  }

  function commitDraft() {
    onChange(toDateKey(draft));
    setOpen(false);
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.wrap, compact && styles.wrapCompact, style]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <TextInput
          value={value || ''}
          onChangeText={onChange}
          editable={!disabled}
          style={[styles.webInput, compact && styles.webInputCompact, disabled && styles.disabled]}
          // Web: native date picker (same as workzen-frontend type="date")
          type="date"
        />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        onPress={openPicker}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trigger,
          compact && styles.triggerCompact,
          disabled && styles.disabled,
          pressed && !disabled && styles.pressed,
        ]}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {value ? formatDateLabel(value) : 'Select date'}
        </Text>
        <MaterialIcons name="calendar-today" size={compact ? 18 : 20} color={colors.onSurfaceVariant} />
      </Pressable>

      {Platform.OS === 'android' && open ? (
        <DateTimePicker
          value={draft}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(event, selected) => {
            setOpen(false);
            if (event.type === 'dismissed') return;
            if (selected) onChange(toDateKey(selected));
          }}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.sheetTitle}>{label || 'Date'}</Text>
              <DateTimePicker
                value={draft}
                mode="date"
                display="spinner"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={(_, selected) => {
                  if (selected) setDraft(selected);
                }}
                themeVariant={isDark ? 'dark' : 'light'}
              />
              <View style={styles.sheetActions}>
                <PrimaryButton title="Cancel" variant="outline" compact onPress={() => setOpen(false)} />
                <PrimaryButton title="Done" compact onPress={commitDraft} />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

function createStyles(colors) {
  return {
    wrap: {
      marginBottom: 12,
      flex: 1,
      minWidth: 0,
    },
    wrapCompact: {
      marginBottom: 0,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.onSurface,
      marginBottom: 4,
    },
    trigger: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.surfaceContainerLowest,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    triggerCompact: {
      minHeight: 40,
    },
    triggerText: {
      flex: 1,
      fontSize: 14,
      color: colors.onSurface,
    },
    webInput: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 14,
      color: colors.onSurface,
      backgroundColor: colors.surfaceContainerLowest,
    },
    webInputCompact: {
      minHeight: 40,
    },
    pressed: { opacity: 0.92 },
    disabled: { opacity: 0.5 },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surfaceContainerLow,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onSurface,
      marginBottom: 8,
      textAlign: 'center',
    },
    sheetActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
  };
}
