import { Stack } from 'expo-router';
import AuthShell from '../../src/components/AuthShell';
import { useTheme } from '../../src/theme/ThemeContext';

export default function AuthLayout() {
  const { colors } = useTheme();
  return (
    <AuthShell>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.surface, flex: 1 },
          sceneContainerStyle: { backgroundColor: colors.surface },
        }}
      />
    </AuthShell>
  );
}
