import { useCallback, useState } from 'react';
import { Image, View } from 'react-native';
import { useFocusEffect, useRouter, useSegments } from 'expo-router';
import { pickImageFromLibrary } from '../../src/utils/pickImage';
import {
  getCompanyProfile,
  updateCompanyProfile,
  uploadCompanyProfilePicture,
} from '../../src/api/company';
import { fetchCountryDialCodes } from '../../src/api/countryCodes';
import { DEFAULT_COMPANY_TIMEZONE } from '../../src/constants/company';
import Screen from '../../src/components/Screen';
import AppHeader from '../../src/components/AppHeader';
import BackButton from '../../src/components/BackButton';
import TextField from '../../src/components/TextField';
import PrimaryButton from '../../src/components/PrimaryButton';
import ChangePasswordSection from '../../src/components/ChangePasswordSection';
import ProfileLogoutButton from '../../src/components/ProfileLogoutButton';
import LoadingState from '../../src/components/LoadingState';
import FormError from '../../src/components/FormError';
import { useToast } from '../../src/context/ToastContext';
import FilterCard from '../../src/components/FilterCard';
import { useAuth } from '../../src/auth/AuthContext';
import { useThemedStyles } from '../../src/theme/useThemedStyles';
import CountrySearchPicker from '../../src/components/CountrySearchPicker';
import {
  nationalPhoneHint,
  trimPhoneToCountryLimit,
  validateNationalPhone,
} from '../../src/utils/inputFilters';
import { buildCountryNameOptions, buildDialCodeOptions } from '../../src/utils/countryOptions';

const EMPTY_FORM = {
  companyName: '',
  ownerName: '',
  countryCode: '+91',
  personalEmailId: '',
  phoneNumber: '',
  country: '',
  state: '',
  pinCode: '',
  fullAddress: '',
};

function profileToForm(profile) {
  if (!profile) return { ...EMPTY_FORM };
  return {
    companyName: profile.companyName || '',
    ownerName: profile.ownerName || '',
    countryCode: profile.countryCode || '+91',
    personalEmailId: profile.personalEmailId || '',
    phoneNumber: profile.phoneNumber || '',
    country: profile.country || '',
    state: profile.state || '',
    pinCode: profile.pinCode || '',
    fullAddress: profile.fullAddress || '',
  };
}

export default function AdminCompanyScreen() {
  const router = useRouter();
  const segments = useSegments();
  const showBackButton = segments[segments.length - 1] === 'company';
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const styles = useThemedStyles(createStyles);
  const [form, setForm] = useState(EMPTY_FORM);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [dialCodes, setDialCodes] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const codes = await fetchCountryDialCodes().catch(() => []);
      setDialCodes(codes);
      const profile = await getCompanyProfile();
      setForm(profileToForm(profile));
      setLogo(profile.companyProfilePicture || null);
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
      await updateCompanyProfile({
        companyName: form.companyName.trim(),
        ownerName: form.ownerName.trim() || null,
        countryCode: form.countryCode.trim() || null,
        personalEmailId: form.personalEmailId.trim() || null,
        phoneNumber: form.phoneNumber.trim() || null,
        country: form.country.trim() || null,
        state: form.state.trim() || null,
        pinCode: form.pinCode.trim() || null,
        fullAddress: form.fullAddress.trim() || null,
        timezone: DEFAULT_COMPANY_TIMEZONE,
      });
      showSuccess('Company profile saved.');
      await load();
    } catch (err) {
      setError(err.message);
      showError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleLogo() {
    setError('');
    try {
      const asset = await pickImageFromLibrary();
      if (!asset) return;
      setSaving(true);
      await uploadCompanyProfilePicture(asset);
      await load();
      showSuccess('Logo updated.');
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

  if (loading) return <LoadingState label="Loading company…" />;

  return (
    <Screen>
      {showBackButton ? <BackButton onPress={() => router.back()} /> : null}
      <AppHeader title="Company" subtitle="Profile & security" onLogout={logout} showThemeToggle />
      <FormError message={error} />
      <FormError message={phoneError} />
      <FilterCard compact>
        {logo ? <Image source={{ uri: logo }} style={styles.logo} /> : null}
        <PrimaryButton title="Update logo" variant="outline" compact onPress={handleLogo} loading={saving} />
        <TextField
          label="Company name"
          tone="auth"
          value={form.companyName}
          onChangeText={(v) => setForm((f) => ({ ...f, companyName: v }))}
        />
        <TextField
          label="Owner name"
          tone="auth"
          value={form.ownerName}
          onChangeText={(v) => setForm((f) => ({ ...f, ownerName: v }))}
        />
        <TextField
          label="Personal email"
          tone="auth"
          icon="email"
          value={form.personalEmailId}
          onChangeText={(v) => setForm((f) => ({ ...f, personalEmailId: v }))}
          keyboardType="email-address"
          autoCapitalize="none"
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
        <PrimaryButton title="Save company" compact onPress={handleSave} loading={saving} />
      </FilterCard>
      <ChangePasswordSection authProvider={user?.auth_provider} userEmail={user?.email} />
      <ProfileLogoutButton />
    </Screen>
  );
}

function createStyles(colors) {
  return {
    logo: {
      width: 96,
      height: 96,
      borderRadius: 12,
      alignSelf: 'center',
      marginVertical: 8,
      backgroundColor: colors.surfaceContainer,
    },
  };
}
