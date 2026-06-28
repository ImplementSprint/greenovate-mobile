import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppHeader, BottomNav } from '@/components/AppHeader';
import { BrandLogo } from '@/components/BrandLogo';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Screen } from '@/components/Screen';
import { useCart } from '@/features/cart/CartContext';
import { navigateTab } from '@/navigation/tabNavigation';
import type { ScreenProps } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { isEmail, isPresent } from '@/utils/validation';

import { register } from './authApi';

export function RegisterScreen({ navigation }: ScreenProps<'Register'>) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const { refreshCart } = useCart();
  const goToTab = (target: Parameters<typeof navigateTab>[2]) =>
    navigateTab(navigation, 'Account', target);

  const submit = async () => {
    if (
      !isPresent(name) ||
      !isEmail(email) ||
      !isPresent(phone) ||
      !isPresent(birthday) ||
      !isPresent(gender) ||
      password.length < 8
    ) {
      Alert.alert(
        'Check details',
        'Enter your name, phone, birthday, gender, valid email, and an 8 character password.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Check password', 'Password and confirmation must match.');
      return;
    }

    if (needsVerification && verificationCode.length !== 6) {
      Alert.alert('Check code', 'Enter the 6-digit verification code sent to your email.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await register({
        full_name: name,
        email,
        phone,
        birthday,
        gender,
        password,
        verificationCode: needsVerification ? verificationCode : undefined,
        registrationToken: needsVerification ? registrationToken : undefined,
      });

      if (response.requiresVerification) {
        setRegistrationToken(response.registrationToken ?? '');
        setNeedsVerification(true);
        setVerificationCode('');
        Alert.alert('Verification code sent', 'Check your email for the 6-digit code.');
        return;
      }

      await refreshCart();
      navigation.navigate('Shop');
    } catch (error) {
      Alert.alert('Registration failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resendCode = async () => {
    setSubmitting(true);
    try {
      const response = await register({
        full_name: name,
        email,
        phone,
        birthday,
        gender,
        password,
      });

      if (response.requiresVerification) {
        setRegistrationToken(response.registrationToken ?? '');
        setVerificationCode('');
        Alert.alert('Verification code sent', 'A new code was sent to your email.');
      }
    } catch (error) {
      Alert.alert('Could not resend code', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen
      contentStyle={styles.content}
      bottomBar={
        <BottomNav
          active="Account"
          onAccount={() => goToTab('Account')}
          onCart={() => goToTab('Cart')}
          onHome={() => goToTab('Home')}
          onOrders={() => goToTab('Orders')}
          onShop={() => goToTab('Shop')}
        />
      }
    >
      <AppHeader
        active="Home"
        onAccount={() => navigation.navigate('Account')}
        onCart={() => navigation.navigate('Cart')}
        onHome={() => navigation.navigate('Home')}
        onLogin={() => navigation.navigate('Login')}
        onShop={() => navigation.navigate('Shop')}
      />
      <View style={styles.center}>
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <BrandLogo />
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us for a better healthcare experience.</Text>
          </View>
          <Field label="Full Name" onChangeText={setName} placeholder="Juan Dela Cruz" value={name} />
          <Field keyboardType="phone-pad" label="Phone Number" onChangeText={setPhone} placeholder="9XXXXXXXXX" value={phone} />
          <Field
            autoCapitalize="none"
            keyboardType="email-address"
            label="Email Address"
            onChangeText={setEmail}
            placeholder="name@example.com"
            value={email}
          />
          <View style={styles.twoColumn}>
            <View style={styles.columnField}>
              <Field label="Birthday" onChangeText={setBirthday} placeholder="yyyy-mm-dd" value={birthday} />
            </View>
            <View style={styles.columnField}>
              <Field label="Gender" onChangeText={setGender} placeholder="Select gender" value={gender} />
            </View>
          </View>
          <View style={styles.twoColumn}>
            <View style={styles.columnField}>
              <Field
                label="Password"
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                value={password}
              />
            </View>
            <View style={styles.columnField}>
              <Field
                label="Confirm Password"
                onChangeText={setConfirmPassword}
                placeholder="Confirm"
                secureTextEntry
                value={confirmPassword}
              />
            </View>
          </View>
          {needsVerification ? (
            <View style={styles.verificationBox}>
              <Text style={styles.verificationText}>
                Enter the verification code sent to your email to finish creating your account.
              </Text>
              <Field
                keyboardType="number-pad"
                label="Verification Code"
                maxLength={6}
                onChangeText={(value) => setVerificationCode(value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                value={verificationCode}
              />
            </View>
          ) : null}
          <Text style={styles.terms}>I agree to the Terms of Service and Privacy Policy</Text>
          <Button
            disabled={submitting}
            label={
              submitting
                ? 'Please wait...'
                : needsVerification
                  ? 'Verify & Create Account'
                  : 'Create Account'
            }
            onPress={submit}
          />
          {needsVerification ? (
            <Button
              disabled={submitting}
              label="Resend Code"
              variant="ghost"
              onPress={resendCode}
            />
          ) : null}
          <View style={styles.divider} />
          <Button
            label="Sign In"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingBottom: 0,
    gap: 0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  card: {
    width: '100%',
    maxWidth: 560,
    gap: spacing.lg,
    borderTopColor: colors.primary,
    borderTopWidth: 6,
    borderRadius: 38,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    shadowColor: colors.text,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  logoWrap: {
    alignItems: 'center',
  },
  header: {
    gap: spacing.xs,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  columnField: {
    flex: 1,
  },
  terms: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  verificationBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  verificationText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
