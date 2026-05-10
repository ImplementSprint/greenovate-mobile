import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Field, cardStyles } from '@components/ui';
import { useAppContext } from '@context/AppContext';
import type { RootStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation }: Props) {
  const { login, register } = useAppContext();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (mode === 'register' && !fullName.trim())) {
      Alert.alert('Missing details', 'Please complete the required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ full_name: fullName, email, phone, password });
      }

      navigation.navigate('Home');
    } catch (error) {
      Alert.alert(mode === 'login' ? 'Sign in failed' : 'Registration failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={[cardStyles.card, styles.card]}>
        <Text style={styles.title}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
        <Text style={styles.copy}>
          {mode === 'login'
            ? 'Sign in to sync your cart and place orders.'
            : 'Create a PharmaQuick account for checkout and order history.'}
        </Text>

        {mode === 'register' ? (
          <>
            <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Juan Dela Cruz" />
            <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="09XX XXX XXXX" />
          </>
        ) : null}

        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="name@example.com" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Password" />

        <Button label={isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'} disabled={isSubmitting} onPress={handleSubmit} />
        <Button
          label={mode === 'login' ? 'Need an account?' : 'Already have an account?'}
          variant="ghost"
          onPress={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
  },
  copy: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
});
