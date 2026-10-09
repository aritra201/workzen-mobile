import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  getMyEmployeeProfile,
  updateMyEmployeeProfile,
  uploadMyEmployeeProfilePicture,
} from '../../src/api/employees';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import PersonAvatar from '../../src/components/PersonAvatar';
import TextField from '../../src/components/TextField';
import PrimaryButton from '../../src/components/PrimaryButton';
import LoadingState from '../../src/components/LoadingState';
import FormError from '../../src/components/FormError';
import { useToast } from '../../src/context/ToastContext';
import FilterCard from '../../src/components/FilterCard';
import { useAuth } from '../../src/auth/AuthContext';
import ChangePasswordSection from '../../src/components/ChangePasswordSection';
import { pickImageFromLibrary } from '../../src/utils/pickImage';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import { fetchCountryDialCodes } from '../../src/api/countryCodes';
import CountrySearchPicker from '../../src/components/CountrySearchPicker';
import {
  nationalPhoneHint,
  trimPhoneToCountryLimit,
  validateNationalPhone,
} from '../../src/utils/inputFilters';
import { buildCountryNameOptions, buildDialCodeOptions } from '../../src/utils/countryOptions';

const EMPTY_FORM = {
  employeeName: '',
  countryCode: '+91',
  phoneNumber: '',
  country: '',
  state: '',
  pinCode: '',
  fullAddress: '',
};

function profileToForm(profile) {
  if (!profile) return { ...EMPTY_FORM };
  return {
    employeeName: profile.employeeName || '',
    countryCode: profile.countryCode || '+91',
    phoneNumber: profile.phoneNumber || '',
    country: profile.country || '',
    state: profile.state || '',
    pinCode: profile.pinCode || '',
    fullAddress: profile.fullAddress || '',
  };
}

export default function EmployeeProfileScreen() {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const styles = useThemedStyles(createStyles);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [dialCodes, setDialCodes] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [codes, data] = await Promise.all([
        fetchCountryDialCodes().catch(() => []),
        getMyEmployeeProfile(),
      ]);
      setDialCodes(codes);
      setProfile(data);
      setForm(profileToForm(data));
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
    const phoneCheck = validateNationalPhone(form.phoneNumber, form.countryCode);
    if (!phoneCheck.ok) {
      setPhoneError(phoneCheck.message);
      showError(phoneCheck.message);
      return;
    }
    setPhoneError('');
    setSaving(true);
    setError('');
    try {
      await updateMyEmployeeProfile({
        employeeName: form.employeeName.trim(),
        countryCode: form.countryCode.trim() || null,
        phoneNumber: form.phoneNumber.trim() || null,
        country: form.country.trim() || null,
        state: form.state.trim() || null,
        pinCode: form.pinCode.trim() || null,
        fullAddress: form.fullAddress.trim() || null,
      });
      showSuccess('Profile saved.');
      await load();
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
      await uploadMyEmployeeProfilePicture(asset);
      await load();
      showSuccess('Photo updated.');
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const dialOptions = buildDialCodeOptions(dialCodes, form);
  const countryOptions = buildCountryNameOptions(dialCodes, form);

  function handleCountryCodeSelect(option) {
    setPhoneError('');
    setForm((prev) => ({
      ...prev,
      countryCode: option.dialCode,
      country: option.countryName,
      phoneNumber: trimPhoneToCountryLimit(prev.phoneNumber, option.dialCode),
    }));
  }

  function handleCountrySelect(option) {
    setForm((prev) => ({
      ...prev,
      country: option.countryName,
      countryCode: option.dialCode,
      phoneNumber: trimPhoneToCountryLimit(prev.phoneNumber, option.dialCode),
    }));
    setPhoneError('');
  }

  if (loading && !profile) {
    return <LoadingState label="Loading profile…" />;
  }

  return (
    <Screen>
      <AppHeader title="My profile" onLogout={logout} showThemeToggle />
      <FormError message={error} />
      <FormError message={phoneError} />
      <FilterCard compact>
        <View style={styles.avatarWrap}>
          <PersonAvatar
            name={form.employeeName}
            email={user?.email}
            src={profile?.profilePicture}
            size={96}
          />
        </View>
        <PrimaryButton title="Change photo" variant="outline" compact onPress={handlePhoto} loading={saving} />
        <TextField label="Work email" tone="auth" value={user?.email || ''} editable={false} />
        <TextField
          label="Name"
          tone="auth"
          value={form.employeeName}
          onChangeText={(v) => setForm((f) => ({ ...f, employeeName: v }))}
        />
        <CountrySearchPicker
          label="Country code"
          value={form.countryCode}
          valueKey="dialCode"
          options={dialOptions}
          onSelect={handleCountryCodeSelect}
          placeholder="Search country or code"
        />
        <TextField
          label="Phone number"
          tone="auth"
          value={form.phoneNumber}
          onChangeText={(v) => {
            setPhoneError('');
            setForm((f) => ({
              ...f,
              phoneNumber: trimPhoneToCountryLimit(v, f.countryCode),
            }));
          }}
          keyboardType="phone-pad"
          placeholder={nationalPhoneHint(form.countryCode)}
        />
        <CountrySearchPicker
          label="Country"
          value={form.country}
          valueKey="countryName"
          options={countryOptions}
          onSelect={handleCountrySelect}
          placeholder="Search country"
        />
        <TextField
          label="State"
          tone="auth"
          value={form.state}
          onChangeText={(v) => setForm((f) => ({ ...f, state: v }))}
        />
        <TextField
          label="PIN / ZIP"
          tone="auth"
          value={form.pinCode}
          onChangeText={(v) => setForm((f) => ({ ...f, pinCode: v }))}
          keyboardType="number-pad"
        />
        <TextField
          label="Address"
          tone="auth"
          value={form.fullAddress}
          onChangeText={(v) => setForm((f) => ({ ...f, fullAddress: v }))}
          multiline
        />
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
