import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type BrandLogoProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function BrandLogo({ compact, inverse }: BrandLogoProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, compact && styles.compactMark]}>
        <View style={styles.capsule} />
      </View>
      <Text style={[styles.word, compact && styles.compactWord, inverse && styles.inverse]}>
        PharmaQuick
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactMark: {
    width: 22,
    height: 22,
    borderRadius: 7,
  },
  capsule: {
    width: 17,
    height: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.surface,
    transform: [{ rotate: '-45deg' }],
  },
  word: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  compactWord: {
    fontSize: 18,
  },
  inverse: {
    color: colors.surface,
  },
});
