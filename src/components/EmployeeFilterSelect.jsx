import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { listEmployeeDropdownOptions } from '../api/employees';
import { useAuth } from '../auth/AuthContext';
import PrimaryButton from './PrimaryButton';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

function selectionSummary(options, value) {
  const ids = value.map(String);
  if (!ids.length) return 'All employees';
  const selected = options.filter((o) => ids.includes(String(o.employeeId)));
  if (selected.length === 1) return selected[0].employeeName;
  return `${selected.length} employees selected`;
}

export default function EmployeeFilterSelect({ value = [], onChange, label = 'Employees', disabled, compact = false }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { primaryMembership } = useAuth();
  const companyId = primaryMembership?.companyId;
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    let cancelled = false;
    if (!companyId) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    listEmployeeDropdownOptions(companyId)
      .then((data) => {
        if (!cancelled) setOptions(data.employees || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        String(o.employeeName || '').toLowerCase().includes(q) ||
        String(o.employeeEmail || '').toLowerCase().includes(q)
    );
  }, [options, search]);

  function toggleId(id) {
    const sid = String(id);
    setDraft((prev) => {
      const set = new Set(prev.map(String));
      if (set.has(sid)) set.delete(sid);
      else set.add(sid);
      return [...set];
    });
  }

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      <Pressable
        disabled={disabled || loading}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.trigger,
          compact && styles.triggerCompact,
          pressed && styles.pressed,
          (disabled || loading) && styles.disabled,
        ]}
      >
        <Text style={[styles.triggerText, compact && styles.triggerTextCompact]} numberOfLines={1}>
          {loading ? 'Loading employees…' : selectionSummary(options, value)}
        </Text>
        <MaterialIcons name="expand-more" size={22} color={colors.onSurfaceVariant} />
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search name or email…"
              placeholderTextColor={colors.onSurfaceVariant}
              style={styles.search}
            />
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.employeeId)}
              style={styles.list}
              ListHeaderComponent={
                <Pressable onPress={() => setDraft([])} style={styles.option}>
                  <MaterialIcons
                    name={draft.length === 0 ? 'check-box' : 'check-box-outline-blank'}
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.optionText}>All employees</Text>
                </Pressable>
              }
              renderItem={({ item }) => {
                const checked = draft.map(String).includes(String(item.employeeId));
                return (
                  <Pressable onPress={() => toggleId(item.employeeId)} style={styles.option}>
                    <MaterialIcons
                      name={checked ? 'check-box' : 'check-box-outline-blank'}
                      size={22}
                      color={colors.primary}
                    />
                    <View style={styles.optionBody}>
                      <Text style={styles.optionText}>{item.employeeName}</Text>
                      <Text style={styles.optionEmail}>{item.employeeEmail}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />
            <View style={styles.sheetActions}>
              <PrimaryButton title="Cancel" variant="outline" onPress={() => setOpen(false)} />
              <PrimaryButton
                title="Done"
                onPress={() => {
                  onChange(draft);
                  setOpen(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(colors) {
  return {
    wrap: { marginBottom: 12 },
    wrapCompact: { marginBottom: 0 },
    label: { fontSize: 12, fontWeight: '600', color: colors.onSurface, marginBottom: 6 },
    labelCompact: { fontSize: 11, marginBottom: 4 },
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
    triggerCompact: {
      minHeight: 40,
      borderRadius: 8,
      paddingHorizontal: 12,
    },
    triggerText: { flex: 1, fontSize: 16, color: colors.onSurface },
    triggerTextCompact: { fontSize: 14 },
    pressed: { opacity: 0.9 },
    disabled: { opacity: 0.5 },
    error: { marginTop: 4, fontSize: 12, color: colors.error },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      justifyContent: 'flex-end',
    },
    sheet: {
      maxHeight: '80%',
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
    list: { maxHeight: 320 },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.outlineVariant,
    },
    optionBody: { flex: 1 },
    optionText: { fontSize: 15, fontWeight: '600', color: colors.onSurface },
    optionEmail: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },
    sheetActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  };
}
