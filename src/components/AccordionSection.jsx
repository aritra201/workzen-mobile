import { Pressable, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAccordionGroup } from './AccordionGroup';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function AccordionSection({
  accordionId,
  title,
  subtitle,
  trailing,
  headerActions,
  children,
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const group = useAccordionGroup();
  const inGroup = group != null && accordionId != null;
  const open = inGroup ? group.isOpen(accordionId) : false;

  function handleToggle() {
    if (inGroup) {
      group.toggle(accordionId);
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={handleToggle}
          style={({ pressed }) => [styles.headerPress, pressed && styles.headerPressed]}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
        >
          <View style={styles.chevronWrap}>
            <MaterialIcons
              name={open ? 'expand-less' : 'expand-more'}
              size={22}
              color={colors.onSurfaceVariant}
            />
          </View>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
        </Pressable>
        {headerActions ? <View style={styles.headerActions}>{headerActions}</View> : null}
      </View>
      {open ? <View style={styles.panel}>{children}</View> : null}
    </View>
  );
}

function createStyles(colors) {
  return {
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      overflow: 'hidden',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
    },
    headerPress: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingLeft: 10,
      paddingRight: 8,
      minWidth: 0,
    },
    headerPressed: {
      backgroundColor: colors.surfaceContainerLow,
    },
    chevronWrap: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.surfaceContainerLow,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
    },
    subtitle: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginTop: 2,
    },
    trailing: {
      flexShrink: 0,
      marginLeft: 4,
    },
    headerActions: {
      flexShrink: 0,
      justifyContent: 'center',
      paddingRight: 10,
      paddingLeft: 4,
    },
    panel: {
      borderTopWidth: 1,
      borderTopColor: colors.outlineVariant,
      padding: 14,
      paddingTop: 12,
      gap: 10,
    },
  };
}
