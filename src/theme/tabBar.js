import React from 'react';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * @param {import('./colors').darkColors} colors
 * @param {{ iconOnly?: boolean, bottomInset?: number }} options
 */
export function getTabScreenOptions(colors, options = {}) {
  const { iconOnly = false, bottomInset = 0 } = options;
  const bottomPad = Math.max(bottomInset, Platform.OS === 'ios' ? 8 : 10);

  return {
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.onSurfaceVariant,
    tabBarShowLabel: !iconOnly,
    tabBarHideOnKeyboard: true,
    tabBarStyle: {
      backgroundColor: colors.tabBar,
      borderTopColor: colors.tabBarBorder,
      borderTopWidth: 1,
      paddingTop: 8,
      paddingBottom: iconOnly ? bottomPad : bottomPad + 2,
      height: iconOnly ? 56 + bottomPad : 62 + bottomPad,
    },
    tabBarIconStyle: {
      marginTop: 0,
    },
    tabBarItemStyle: {
      paddingHorizontal: 0,
      maxWidth: '100%',
    },
    tabBarLabelStyle: iconOnly
      ? { display: 'none', height: 0, width: 0, opacity: 0 }
      : {
          fontSize: 9,
          fontWeight: '700',
          marginTop: 1,
          letterSpacing: -0.2,
        },
    tabBarAllowFontScaling: false,
  };
}

export function tabIcon(name) {
  return ({ color, size }) =>
    React.createElement(MaterialIcons, { name, size: size ?? 24, color });
}
