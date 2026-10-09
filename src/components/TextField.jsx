import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

const ICONS = {
  email: 'alternate-email',
  lock: 'lock-outline',
};

export default function TextField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  placeholder,
  icon,
  labelRight,
  editable = true,
  tone = 'default',
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const isPassword = Boolean(secureTextEntry);
  const iconName = typeof icon === 'string' ? ICONS[icon] || icon : icon;

  return (
    <View style={styles.wrap}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {labelRight}
        </View>
      ) : null}
      <View style={styles.inputWrap}>
        {iconName ? (
          <MaterialIcons name={iconName} size={20} color={colors.onSurfaceVariant} style={styles.leadingIcon} />
        ) : null}
        <TextInput
          style={[
            styles.input,
            tone === 'auth' && styles.inputAuth,
            iconName && styles.inputWithIcon,
            isPassword && styles.inputWithTrailing,
          ]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant}
          editable={editable}
        />
        {isPassword ? (
          <Pressable onPress={() => setHidden((v) => !v)} style={styles.trailingBtn} hitSlop={8}>
            <MaterialIcons
              name={hidden ? 'visibility-off' : 'visibility'}
              size={20}
              color={colors.onSurfaceVariant}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors) {
  return {
    wrap: {
      marginBottom: 14,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.onSurface,
    },
    inputWrap: {
      position: 'relative',
      justifyContent: 'center',
    },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: 16,
      color: colors.onSurface,
      backgroundColor: colors.surfaceContainerLowest,
    },
    inputAuth: {
      backgroundColor: colors.surfaceContainer,
    },
    inputWithIcon: {
      paddingLeft: 42,
    },
    inputWithTrailing: {
      paddingRight: 44,
    },
    leadingIcon: {
      position: 'absolute',
      left: 12,
      zIndex: 1,
    },
    trailingBtn: {
      position: 'absolute',
      right: 10,
      zIndex: 1,
      padding: 4,
    },
  };
}
