import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AccountDetailLayout } from '@/features/account/AccountDetailLayout';
import { updateProfile } from '@/features/auth/authApi';
import { getCities, getProvinces } from '@/features/delivery/deliveryApi';
import {
  getDisplayName,
  MAX_SAVED_ADDRESSES,
  parseAddresses,
  stringifyAddresses,
  type SavedAddress,
} from '@/features/account/accountShared';
import { accountStyles as sharedStyles } from '@/features/account/accountScreenStyles';
import type { ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { PH_PHONE_MESSAGE, normalizePhilippinePhone } from '@/utils/phone';
import { profileStorage } from '@/utils/storage';
import type { UserProfile } from '@/types';

const emptyAddress = (profile?: UserProfile | null): SavedAddress => ({
  fullName: getDisplayName(profile ?? null),
  phoneNumber: profile?.phone || '',
  province: '',
  city: '',
  postalCode: '',
  streetAddress: '',
  label: 'Home',
});

export function AccountAddressFormScreen({
  navigation,
  route,
}: ScreenProps<'AccountAddressForm'>) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<SavedAddress>(emptyAddress(null));
  const [makeDefault, setMakeDefault] = useState(route.params.mode === 'create');
  const [saving, setSaving] = useState(false);
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  useEffect(() => {
    let active = true;

    profileStorage.get().then((stored) => {
      if (!active) return;
      setProfile(stored);
      setForm(route.params.address ?? emptyAddress(stored));
    });

    void getProvinces().then((nextProvinces) => {
      if (active) {
        setProvinces(nextProvinces);
      }
    });

    return () => {
      active = false;
    };
  }, [route.params.address]);

  useEffect(() => {
    let active = true;

    if (!form.province.trim()) {
      setCities([]);
      return () => {
        active = false;
      };
    }

    void getCities(form.province).then((nextCities) => {
      if (active) {
        setCities(nextCities);
      }
    });

    return () => {
      active = false;
    };
  }, [form.province]);

  const title = route.params.mode === 'create' ? 'Add Address' : 'Edit Address';
  const currentAddresses = useMemo(() => parseAddresses(profile?.address, profile), [profile]);

  const updateField = <K extends keyof SavedAddress>(key: K, value: SavedAddress[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async () => {
    const missing = [
      !form.fullName.trim() ? 'Full Name' : null,
      !form.phoneNumber.trim() ? 'Phone Number' : null,
      !form.province.trim() ? 'Province' : null,
      !form.city.trim() ? 'City' : null,
      !form.postalCode.trim() ? 'Postal Code' : null,
      !form.streetAddress.trim() ? 'Street Address' : null,
    ].filter(Boolean);

    if (missing.length > 0) {
      Alert.alert('Incomplete address details', missing.join(', '));
      return;
    }

    const normalizedPhone = normalizePhilippinePhone(form.phoneNumber);
    if (!normalizedPhone) {
      Alert.alert('Invalid phone number', PH_PHONE_MESSAGE);
      return;
    }

    const nextAddress: SavedAddress = { ...form, phoneNumber: normalizedPhone };
    const nextAddresses = [...currentAddresses];

    if (route.params.mode === 'edit' && typeof route.params.index === 'number') {
      nextAddresses[route.params.index] = nextAddress;
    } else {
      if (nextAddresses.length >= MAX_SAVED_ADDRESSES) {
        Alert.alert('Address limit reached', `You can only save up to ${MAX_SAVED_ADDRESSES} addresses.`);
        return;
      }

      nextAddresses.push(nextAddress);
    }

    const orderedAddresses =
      makeDefault && nextAddresses.length > 0
        ? [
            nextAddress,
            ...nextAddresses.filter((_, index) =>
              route.params.mode === 'edit' && typeof route.params.index === 'number'
                ? index !== route.params.index
                : !(route.params.mode === 'create' && index === nextAddresses.length - 1),
            ),
          ]
        : nextAddresses;

    setSaving(true);
    try {
      const updatedProfile = await updateProfile({
        full_name: getDisplayName(profile),
        phone: profile?.phone || normalizedPhone,
        birthday: profile?.birthday || profile?.dob,
        address: stringifyAddresses(orderedAddresses),
      });
      await profileStorage.set(updatedProfile);
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Save failed',
        error instanceof Error ? error.message : 'Could not save this address.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountDetailLayout
      title={title}
      subtitle="Update your delivery details and keep this address ready for checkout."
      onBack={() => navigation.goBack()}
    >
      <View style={sharedStyles.detailsCard}>
        <View style={styles.grid}>
          <Field label="FULL NAME" value={form.fullName} onChangeText={(value) => updateField('fullName', value)} />
          <Field
            label="PHONE NUMBER"
            value={form.phoneNumber}
            onChangeText={(value) => updateField('phoneNumber', value)}
          />
        </View>

        <View style={styles.grid}>
          <SelectField
            label="PROVINCE"
            open={provinceOpen}
            options={provinces}
            placeholder="Select province"
            value={form.province}
            onSelect={(value) => {
              updateField('province', value);
              updateField('city', '');
              setProvinceOpen(false);
            }}
            onToggle={() => {
              setProvinceOpen((current) => !current);
              setCityOpen(false);
            }}
          />
          <SelectField
            label="CITY"
            open={cityOpen}
            options={cities}
            placeholder="Select city"
            value={form.city}
            onSelect={(value) => {
              updateField('city', value);
              setCityOpen(false);
            }}
            onToggle={() => {
              setCityOpen((current) => !current);
              setProvinceOpen(false);
            }}
          />
        </View>

        <Field label="POSTAL CODE" value={form.postalCode} onChangeText={(value) => updateField('postalCode', value)} />
        <Field
          label="STREET NAME, BUILDING, HOUSE NO."
          multiline
          style={styles.textArea}
          value={form.streetAddress}
          onChangeText={(value) => updateField('streetAddress', value)}
        />

        <Pressable style={styles.defaultBox} onPress={() => setMakeDefault((current) => !current)}>
          <View style={[styles.checkbox, makeDefault && styles.checkboxChecked]} />
          <View style={sharedStyles.profileText}>
            <Text style={sharedStyles.cardBodyStrong}>Make this my default address</Text>
            <Text style={sharedStyles.cardBody}>
              This address will be selected first during checkout.
            </Text>
          </View>
        </Pressable>

        <View>
          <Text style={styles.labelTitle}>LABEL AS</Text>
          <View style={styles.labelRow}>
            {(['Home', 'Work'] as const).map((label) => (
              <Pressable
                key={label}
                onPress={() => updateField('label', label)}
                style={[styles.labelChip, form.label === label && styles.labelChipActive]}
              >
                <Text style={[styles.labelChipText, form.label === label && styles.labelChipTextActive]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => navigation.goBack()} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable disabled={saving} onPress={submit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>{saving ? 'Saving...' : 'Submit'}</Text>
          </Pressable>
        </View>
      </View>
    </AccountDetailLayout>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  style?: object;
};

function Field({ label, value, onChangeText, multiline, style }: FieldProps) {
  return (
    <View style={styles.fieldShell}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        style={[styles.fieldInput, multiline ? styles.multiInput : null, style]}
        value={value}
      />
    </View>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
};

function SelectField({
  label,
  value,
  placeholder,
  options,
  open,
  onToggle,
  onSelect,
}: SelectFieldProps) {
  return (
    <View style={styles.fieldShell}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable onPress={onToggle} style={styles.selectInput}>
        <Text style={[styles.selectText, !value ? styles.placeholder : null]}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>
      {open ? (
        <ScrollView style={styles.selectList} nestedScrollEnabled>
          {options.map((option) => (
            <Pressable key={option} onPress={() => onSelect(option)} style={styles.option}>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          ))}
          {options.length === 0 ? (
            <Text style={styles.emptyOption}>No options available.</Text>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.md,
  },
  fieldShell: {
    gap: spacing.xs,
  },
  fieldLabel: {
    color: colors.label,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  fieldInput: {
    minHeight: 58,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    fontWeight: '700',
  },
  multiInput: {
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  textArea: {
    minHeight: 140,
  },
  selectInput: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.lg,
  },
  selectText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  placeholder: {
    color: colors.label,
    fontWeight: '600',
  },
  chevron: {
    color: colors.label,
    fontSize: 20,
  },
  selectList: {
    maxHeight: 180,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionText: {
    color: colors.text,
  },
  emptyOption: {
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  defaultBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 2,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    borderColor: '#ff7a00',
    backgroundColor: '#ff7a00',
  },
  labelTitle: {
    color: colors.label,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  labelRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  labelChip: {
    minWidth: 110,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  labelChipActive: {
    borderColor: '#ff7a00',
    backgroundColor: '#fff1e7',
  },
  labelChipText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '900',
  },
  labelChipTextActive: {
    color: '#ff7a00',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  cancelButton: {
    minWidth: 120,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '900',
  },
  submitButton: {
    minWidth: 120,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#ff7a00',
    paddingHorizontal: spacing.lg,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '900',
  },
});
