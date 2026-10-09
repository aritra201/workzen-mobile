import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  getMyMemberProfile,
  updateMyMemberProfile,
  uploadMyMemberProfilePicture,
} from '../../src/api/members';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import PersonAvatar from '../../src/components/PersonAvatar';
import TextField from '../../src/components/TextField';
import PrimaryButton from '../../src/components/PrimaryButton';
import LoadingState from '../../src/components/LoadingState';
import FormError from '../../src/components/FormError';
import FilterCard from '../../src/components/FilterCard';
import { useAuth } from '../../src/auth/AuthContext';
import ChangePasswordSection from '../../src/components/ChangePasswordSection';
import { pickImageFromLibrary } from '../../src/utils/pickImage';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { useToast } from '../../src/context/ToastContext';

export default function MemberProfileScreen() {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const styles = useThemedStyles(createStyles);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyMemberProfile();
      setProfile(data);
      setName(data.name || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await updateMyMemberProfile({ name: name.trim() });
      await load();
      showSuccess('Profile saved.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handlePhoto() {
    setError('');
    try {
      const asset = await pickImageFromLibrary();
      if (!asset) return;
      setSaving(true);
      await uploadMyMemberProfilePicture(asset);
      await load();
      showSuccess('Photo updated.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !profile) {
    return <LoadingState label="Loading profile…" />;
  }

  return (
    <Screen>
      <AppHeader title="My profile" onLogout={logout} showThemeToggle />
      <FormError message={error} />
      <FilterCard compact>
        <View style={styles.avatarWrap}>
          <PersonAvatar name={name} email={user?.email} src={profile?.profilePicture} size={96} />
        </View>
        <PrimaryButton title="Change photo" variant="outline" compact onPress={handlePhoto} loading={saving} />
        <TextField label="Work email" tone="auth" value={user?.email || ''} editable={false} />
        <TextField label="Name" tone="auth" value={name} onChangeText={setName} />
        <PrimaryButton title="Save changes" compact onPress={handleSave} loading={saving} />
      </FilterCard>
      <ChangePasswordSection authProvider={user?.auth_provider} userEmail={user?.email} />
    </Screen>
  );
}

function createStyles() {
  return {
    avatarWrap: { alignItems: 'center', marginBottom: 8 },
  };
}
