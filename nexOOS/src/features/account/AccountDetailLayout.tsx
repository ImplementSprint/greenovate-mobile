import type { PropsWithChildren } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { accountStyles as styles } from '@/features/account/accountScreenStyles';

type Props = PropsWithChildren<{
  title: string;
  onBack: () => void;
  subtitle?: string;
}>;

export function AccountDetailLayout({ title, subtitle, onBack, children }: Props) {
  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.page}>
        <View style={styles.headerRow}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.sectionIntro}>{subtitle}</Text> : null}
        {children}
      </View>
    </Screen>
  );
}
