import { Text, View } from 'react-native';
import PersonAvatar from './PersonAvatar';
import StatusChip from './StatusChip';
import PrimaryButton from './PrimaryButton';
import MobileListCard from './MobileListCard';
import { useThemedStyles } from '../theme/useThemedStyles';

export default function TeamPersonCard({
  name,
  email,
  photoUrl,
  status,
  meta,
  primaryAction,
  secondaryAction,
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <MobileListCard>
      <View style={styles.header}>
        <PersonAvatar name={name} email={email} src={photoUrl} size={44} />
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.email} numberOfLines={1}>{email}</Text>
        </View>
      </View>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {status ? <StatusChip tone={status.tone}>{status.label}</StatusChip> : null}
      <View style={styles.actions}>
        {secondaryAction ? (
          <PrimaryButton
            title={secondaryAction.title}
            variant="outline"
            onPress={secondaryAction.onPress}
            loading={secondaryAction.loading}
          />
        ) : null}
        {primaryAction ? (
          <PrimaryButton
            title={primaryAction.title}
            variant="secondary"
            onPress={primaryAction.onPress}
            loading={primaryAction.loading}
          />
        ) : null}
      </View>
    </MobileListCard>
  );
}

function createStyles(colors) {
  return {
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerText: { flex: 1, minWidth: 0 },
    name: { fontSize: 17, fontWeight: '700', color: colors.onSurface },
    email: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 2 },
    meta: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 10 },
    actions: { marginTop: 12, gap: 8 },
  };
}
