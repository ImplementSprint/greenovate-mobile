import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, ScreenState, cardStyles } from '@components/ui';
import { useAppContext } from '@context/AppContext';
import type { RootStackParamList } from '@navigation/types';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<RootStackParamList, 'Branches'>;

export function BranchesScreen({ navigation }: Props) {
  const { branches, selectedBranch, setSelectedBranch } = useAppContext();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Choose Branch</Text>
      {branches.length === 0 ? (
        <ScreenState title="No branches loaded" message="Check your API base URL or backend connection." />
      ) : (
        <View style={styles.list}>
          {branches.map((branch) => {
            const isSelected = selectedBranch?.id === branch.id;

            return (
              <View key={branch.id} style={[cardStyles.card, styles.card, isSelected && styles.selectedCard]}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <Text style={styles.copy}>{branch.address}</Text>
                <Text style={styles.copy}>{branch.phone}</Text>
                <Text style={styles.copy}>{branch.opening_time} - {branch.closing_time}</Text>
                <Button
                  label={isSelected ? 'Selected' : 'Use This Branch'}
                  variant={isSelected ? 'secondary' : 'primary'}
                  onPress={() => {
                    setSelectedBranch(branch);
                    navigation.navigate('Shop');
                  }}
                />
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  list: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.sm,
  },
  selectedCard: {
    borderColor: colors.primary,
  },
  branchName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  copy: {
    color: colors.muted,
    fontSize: 14,
  },
});
