import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AccountDetailLayout } from '@/features/account/AccountDetailLayout';
import { accountStyles as styles } from '@/features/account/accountScreenStyles';
import type { ScreenProps } from '@/navigation/types';

export function AccountSettingsScreen({ navigation }: ScreenProps<'AccountSettings'>) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <AccountDetailLayout title="Account Settings" onBack={() => navigation.goBack()}>
      <View style={styles.detailsCard}>
        <View style={styles.settingsRow}>
          <View style={styles.profileText}>
            <Text style={styles.cardHeading}>Email Notifications</Text>
            <Text style={styles.cardBody}>Receive order updates and promotions</Text>
          </View>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: notificationsEnabled }}
            onPress={() => setNotificationsEnabled((current) => !current)}
            style={[
              styles.switchTrack,
              !notificationsEnabled ? styles.switchTrackOff : null,
            ]}
          >
            <View
              style={[
                styles.switchThumb,
                !notificationsEnabled ? styles.switchThumbOff : null,
              ]}
            />
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.stack}>
          <Text style={styles.cardHeading}>Change Password</Text>
          <Pressable style={styles.outlineButton}>
            <Text style={styles.outlineButtonText}>Update Password</Text>
          </Pressable>
        </View>
      </View>
    </AccountDetailLayout>
  );
}
