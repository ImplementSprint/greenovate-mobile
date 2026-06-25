import { useCallback, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { AccountDetailLayout } from '@/features/account/AccountDetailLayout';
import { accountStyles as styles } from '@/features/account/accountScreenStyles';
import { formatReadableDate } from '@/features/account/accountShared';
import { getMyReturnRequests } from '@/features/orders/ordersApi';
import type { ScreenProps } from '@/navigation/types';
import type { ReturnRequestSummary } from '@/types';

export function AccountRefundRequestsScreen({
  navigation,
}: ScreenProps<'AccountRefundRequests'>) {
  const [requests, setRequests] = useState<ReturnRequestSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadRequests = async () => {
        setLoading(true);
        try {
          const nextRequests = await getMyReturnRequests();
          if (active) {
            setRequests(nextRequests);
          }
        } catch {
          if (active) {
            setRequests([]);
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      void loadRequests();

      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <AccountDetailLayout title="Refund Requests" onBack={() => navigation.goBack()}>
      <View style={styles.detailsCard}>
        {loading ? (
          <ActivityIndicator color="#2563eb" />
        ) : requests.length === 0 ? (
          <View style={styles.centerCard}>
            <Text style={styles.centerTitle}>No refund requests yet</Text>
            <Text style={styles.centerBody}>
              When you submit a return or refund request, it will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.stack}>
            {requests.map((request) => (
              <View key={request.id} style={styles.infoCard}>
                <Text style={styles.cardHeading}>Receipt {request.receiptNumber}</Text>
                <Text style={styles.cardBody}>Status: {request.status}</Text>
                <Text style={styles.cardBody}>Reason: {request.reason}</Text>
                <Text style={styles.cardBody}>Submitted: {formatReadableDate(request.createdAt)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </AccountDetailLayout>
  );
}
