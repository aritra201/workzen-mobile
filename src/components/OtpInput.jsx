import { useRef } from 'react';
import { TextInput, View } from 'react-native';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function OtpInput({ value, onChange, length = 4, disabled = false }) {
  const styles = useThemedStyles(createStyles);
  const inputsRef = useRef([]);

  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  function focusIndex(index) {
    inputsRef.current[index]?.focus();
  }

  function handleChange(index, char) {
    const digit = char.replace(/\D/g, '').slice(-1);
    const next = digits.map((d, i) => {
      if (i === index) return digit;
      return d === ' ' ? '' : d;
    });
    onChange(next.join('').replace(/\s/g, ''));
    if (digit && index < length - 1) {
      focusIndex(index + 1);
    }
  }

  function handleKeyPress(index, event) {
    if (event.nativeEvent.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      focusIndex(index - 1);
    }
  }

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          style={styles.cell}
          value={digit.trim()}
          onChangeText={(text) => handleChange(index, text)}
          onKeyPress={(e) => handleKeyPress(index, e)}
          keyboardType="number-pad"
          maxLength={1}
          editable={!disabled}
          selectTextOnFocus
          accessibilityLabel={`Digit ${index + 1} of ${length}`}
        />
      ))}
    </View>
  );
}

function createStyles(colors) {
  return {
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 4,
    },
    cell: {
      width: 48,
      height: 56,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLowest,
      textAlign: 'center',
      fontSize: 22,
      fontWeight: '700',
      color: colors.onSurface,
    },
  };
}
