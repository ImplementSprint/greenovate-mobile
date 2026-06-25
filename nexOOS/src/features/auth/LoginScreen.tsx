import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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
import { loginPreferenceStorage } from '@/utils/storage';
import { isEmail, isPresent } from '@/utils/validation';

import {
  login,
  requestPasswordReset,
  updatePasswordWithReset,
  verifyPasswordResetCode,
} from './authApi';

type ResetStep = 'email' | 'code' | 'password';

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <View style={styles.eyeIcon}>
    <View style={styles.eyeOval}>
      <View style={[styles.eyeDot, visible ? styles.eyeDotVisible : null]} />
    </View>
    {!visible ? <View style={styles.eyeSlash} /> : null}
  </View>
);

const PasswordToggle = ({
  visible,
  onPress,
}: {
  visible: boolean;
  onPress: () => void;
}) => (
  <Pressable
    accessibilityLabel={visible ? 'Hide password' : 'Show password'}
    hitSlop={10}
    style={styles.iconButton}
    onPress={onPress}
  >
    <EyeIcon visible={visible} />
  </Pressable>
);

export function LoginScreen({ navigation }: ScreenProps<'Login'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState<ResetStep>('email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const { refreshCart } = useCart();
  const goToTab = (target: Parameters<typeof navigateTab>[2]) =>
    navigateTab(navigation, 'Account', target);

  useEffect(() => {
    let mounted = true;

    const loadRememberedLogin = async () => {
      const [savedRememberMe, savedEmail] = await Promise.all([
        loginPreferenceStorage.getRememberLogin(),
        loginPreferenceStorage.getRememberedEmail(),
      ]);

      if (!mounted) {
        return;
      }

      setRememberMe(savedRememberMe);
      if (savedRememberMe && savedEmail) {
        setEmail(savedEmail);
      }
    };

    void loadRememberedLogin();

    return () => {
      mounted = false;
    };
  }, []);

  const submit = async () => {
    if (!isEmail(email) || !isPresent(password)) {
      Alert.alert('Check details', 'Enter a valid email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password, rememberMe);
      if (rememberMe) {
        await loginPreferenceStorage.set(email.trim());
      } else {
        await loginPreferenceStorage.clear();
      }
      await refreshCart();
      navigation.navigate('Shop');
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openForgotPassword = () => {
    setResetOpen(true);
    setResetStep('email');
    setResetEmail(email);
    setResetCode('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const closeForgotPassword = () => {
    if (!resetSubmitting) {
      setResetOpen(false);
    }
  };

  const submitPasswordReset = async () => {
    setResetSubmitting(true);

    try {
      if (resetStep === 'email') {
        if (!isEmail(resetEmail)) {
          Alert.alert('Check email', 'Enter the email address for your account.');
          return;
        }

        const response = await requestPasswordReset(resetEmail);
        setResetToken(response.resetToken ?? '');
        setResetStep('code');
        Alert.alert('Code sent', 'Check your email for the 6-digit verification code.');
        return;
      }

      if (resetStep === 'code') {
        if (resetCode.length !== 6) {
          Alert.alert('Check code', 'Enter the 6-digit verification code.');
          return;
        }

        await verifyPasswordResetCode({
          email: resetEmail,
          verificationCode: resetCode,
          resetToken,
        });
        setResetStep('password');
        return;
      }

      if (newPassword.length < 6) {
        Alert.alert('Check password', 'Password must be at least 6 characters.');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Check password', 'New password and confirmation must match.');
        return;
      }

      await updatePasswordWithReset({
        email: resetEmail,
        verificationCode: resetCode,
        resetToken,
        newPassword,
      });
      setResetOpen(false);
      Alert.alert('Password updated', 'You can now sign in with your new password.');
    } catch (error) {
      Alert.alert('Password reset failed', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setResetSubmitting(false);
    }
  };

  const resendResetCode = async () => {
    setResetSubmitting(true);
    try {
      const response = await requestPasswordReset(resetEmail);
      setResetToken(response.resetToken ?? '');
      setResetCode('');
      setResetStep('code');
      Alert.alert('Code sent', 'A new verification code was sent to your email.');
    } catch (error) {
      Alert.alert('Could not resend code', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setResetSubmitting(false);
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
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Sign in to your account to continue shopping.</Text>
          </View>
          <Field
            autoCapitalize="none"
            keyboardType="email-address"
            label="Username or Email"
            onChangeText={setEmail}
            placeholder="username or email@example.com"
            value={email}
          />
          <Field
            label="Password"
            onChangeText={setPassword}
            placeholder="Password"
            rightAccessory={
              <PasswordToggle
                visible={showPassword}
                onPress={() => setShowPassword((current) => !current)}
              />
            }
            secureTextEntry={!showPassword}
            value={password}
          />
          <View style={styles.authRow}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: rememberMe }}
              style={styles.rememberRow}
              onPress={() => setRememberMe((current) => !current)}
            >
              <View style={[styles.checkbox, rememberMe ? styles.checkboxChecked : null]}>
                {rememberMe ? <View style={styles.checkmark} /> : null}
              </View>
              <Text style={styles.muted}>Remember me</Text>
            </Pressable>
            <Pressable onPress={openForgotPassword}>
              <Text style={styles.link}>Forgot Password?</Text>
            </Pressable>
          </View>
          <Button disabled={submitting} label={submitting ? 'Signing in...' : 'Sign In'} onPress={submit} />
          <View style={styles.divider} />
          <Button
            label="Create Account"
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
      <Modal animationType="fade" transparent visible={resetOpen} onRequestClose={closeForgotPassword}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Text style={styles.modalSubtitle}>
                  Enter your email, verify the code, then choose a new password.
                </Text>
              </View>
              <Pressable style={styles.closeButton} onPress={closeForgotPassword}>
                <Text style={styles.closeText}>x</Text>
              </Pressable>
            </View>

            <Field
              autoCapitalize="none"
              editable={resetStep === 'email' && !resetSubmitting}
              keyboardType="email-address"
              label="Email"
              onChangeText={setResetEmail}
              placeholder="name@example.com"
              value={resetEmail}
            />

            {resetStep !== 'email' ? (
              <Field
                editable={resetStep === 'code' && !resetSubmitting}
                keyboardType="number-pad"
                label="Verification Code"
                maxLength={6}
                onChangeText={(value) => setResetCode(value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                value={resetCode}
              />
            ) : null}

            {resetStep === 'password' ? (
              <>
                <Field
                  label="New Password"
                  onChangeText={setNewPassword}
                  placeholder="New password"
                  rightAccessory={
                    <PasswordToggle
                      visible={showNewPassword}
                      onPress={() => setShowNewPassword((current) => !current)}
                    />
                  }
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                />
                <Field
                  label="Confirm New Password"
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm password"
                  rightAccessory={
                    <PasswordToggle
                      visible={showConfirmPassword}
                      onPress={() => setShowConfirmPassword((current) => !current)}
                    />
                  }
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                />
              </>
            ) : null}

            <Button
              disabled={resetSubmitting}
              label={
                resetSubmitting
                  ? 'Please wait...'
                  : resetStep === 'email'
                    ? 'Send Code'
                    : resetStep === 'code'
                      ? 'Verify Code'
                      : 'Update Password'
              }
              onPress={submitPasswordReset}
            />
            <Button
              disabled={resetSubmitting}
              label="Cancel"
              variant="ghost"
              onPress={closeForgotPassword}
            />
            {resetStep !== 'email' ? (
              <Button
                disabled={resetSubmitting}
                label="Resend Code"
                variant="ghost"
                onPress={resendResetCode}
              />
            ) : null}
          </View>
        </View>
      </Modal>
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
  authRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rememberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.textMuted,
    borderRadius: 4,
    borderWidth: 1,
    height: 18,
    justifyContent: 'center',
    width: 18,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    borderBottomColor: colors.surface,
    borderBottomWidth: 2,
    borderRightColor: colors.surface,
    borderRightWidth: 2,
    height: 9,
    transform: [{ rotate: '45deg' }],
    width: 5,
  },
  muted: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  link: {
    color: colors.primary,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  eyeIcon: {
    alignItems: 'center',
    height: 20,
    justifyContent: 'center',
    width: 24,
  },
  eyeOval: {
    alignItems: 'center',
    borderColor: colors.textMuted,
    borderRadius: 12,
    borderWidth: 1.7,
    height: 12,
    justifyContent: 'center',
    transform: [{ scaleX: 1.45 }],
    width: 15,
  },
  eyeDot: {
    backgroundColor: colors.textMuted,
    borderRadius: 4,
    height: 5,
    opacity: 0.7,
    width: 5,
  },
  eyeDotVisible: {
    backgroundColor: colors.primary,
    opacity: 1,
  },
  eyeSlash: {
    backgroundColor: colors.textMuted,
    height: 2,
    position: 'absolute',
    transform: [{ rotate: '-35deg' }],
    width: 25,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    gap: spacing.lg,
    maxWidth: 540,
    padding: spacing.xl,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 380,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 24,
  },
});
