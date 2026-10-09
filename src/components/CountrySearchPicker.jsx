import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

function optionLabel(option, valueKey) {
  if (valueKey === 'countryName') {
    return option.countryName;
  }
  return `${option.dialCode} ${option.countryName}`;
}

export default function CountrySearchPicker({
  label,
  value,
  valueKey = 'dialCode',
  options = [],
  onSelect,
  disabled,
  error,
  placeholder = 'Search country',
  tone = 'auth',
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = options.find((o) => o[valueKey] === value);
  const displayValue = selected ? optionLabel(selected, valueKey) : value || 'Select…';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (c) =>
        String(c.countryName || '').toLowerCase().includes(q) ||
        String(c.dialCode || '').toLowerCase().includes(q) ||
        String(c.isoCode || '').toLowerCase().includes(q)
    );
  }, [options, search]);

  function handleSelect(option) {
    onSelect(option);
    setOpen(false);
    setSearch('');
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          tone === 'auth' && styles.triggerAuth,
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
      >
        <Text style={[styles.triggerText, !selected && !value && styles.placeholder]} numberOfLines={1}>
          {displayValue}
        </Text>
        <MaterialIcons name="expand-more" size={22} color={colors.onSurfaceVariant} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label || 'Select'}</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={placeholder}
              placeholderTextColor={colors.onSurfaceVariant}
              style={styles.search}
              autoFocus
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => `${item.isoCode}-${item.dialCode}-${item.id}`}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text style={styles.empty}>No matches</Text>}
              renderItem={({ item }) => {
                const active = item[valueKey] === value;
                return (
                  <Pressable onPress={() => handleSelect(item)} style={[styles.option, active && styles.optionActive]}>
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>
                      {optionLabel(item, valueKey)}
                    </Text>
                    {active ? <MaterialIcons name="check" size={20} color={colors.primary} /> : null}
                  </Pressable>
                );
              }}
            />
            <Pressable onPress={() => setOpen(false)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(colors) {
  return {
    wrap: { marginBottom: 14 },
    label: { fontSize: 12, fontWeight: '600', color: colors.onSurface, marginBottom: 6 },
    trigger: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: 10,
      paddingHorizontal: 14,
      backgroundColor: colors.surfaceContainerLowest,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    triggerAuth: {
      backgroundColor: colors.surfaceContainer,
    },
    triggerText: { flex: 1, fontSize: 16, color: colors.onSurface },
    placeholder: { color: colors.onSurfaceVariant },
    pressed: { opacity: 0.92 },
    disabled: { opacity: 0.5 },
    error: { marginTop: 4, fontSize: 12, color: colors.error },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    sheet: {
      maxHeight: '85%',
      backgroundColor: colors.surfaceContainerLow,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.onSurface, marginBottom: 12 },
    search: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: 10,
      paddingHorizontal: 12,
      color: colors.onSurface,
      backgroundColor: colors.surfaceContainerLowest,
      marginBottom: 8,
    },
    list: { maxHeight: 360 },
    empty: { padding: 16, textAlign: 'center', color: colors.onSurfaceVariant },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    optionActive: { backgroundColor: colors.primaryContainer },
    optionText: { fontSize: 15, color: colors.onSurface, flex: 1 },
    optionTextActive: { fontWeight: '600', color: colors.onPrimaryContainer },
    closeBtn: {
      marginTop: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    closeBtnText: { fontSize: 15, fontWeight: '600', color: colors.onSurface },
  };
}
