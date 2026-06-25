import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

import { useBranch } from './BranchContext';
import { isBranchOpenNow } from './branchData';

type BranchPickerButtonProps = {
  compact?: boolean;
};

export function BranchPickerButton({ compact = false }: BranchPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const { branches, selectBranch, selectedBranch } = useBranch();
  const compactLabel = selectedBranch?.name ?? 'Branch';
  const fullLabel = selectedBranch?.name ?? 'Select Branch';

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          compact ? styles.compactPill : styles.pill,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.icon}>{'\u{1F4CD}'}</Text>
        <Text numberOfLines={1} style={compact ? styles.compactText : styles.text}>
          {compact ? compactLabel : fullLabel}
        </Text>
      </Pressable>

      <Modal animationType="fade" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <Pressable style={styles.scrim} onPress={() => setOpen(false)} />
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.titleWrap}>
                <Text style={styles.title}>Select a Branch</Text>
                <Text style={styles.subtitle}>
                  Choose an open branch to see available products
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close branch selector"
                onPress={() => setOpen(false)}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
              {branches.map((branch) => {
                const active = selectedBranch?.id === branch.id;
                const isOpenNow = isBranchOpenNow(branch);
                const disabled = !isOpenNow;

                return (
                  <Pressable
                    key={branch.id}
                    disabled={disabled}
                    onPress={() => {
                      if (disabled) {
                        return;
                      }

                      void selectBranch(branch);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.branchCard,
                      active && styles.branchCardActive,
                      disabled && styles.branchCardClosed,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.branchTopRow}>
                      <Text style={styles.branchTitle}>{branch.name}</Text>
                      <View style={[styles.statusPill, disabled && styles.statusPillClosed]}>
                        <Text style={[styles.statusText, disabled && styles.statusTextClosed]}>
                          {isOpenNow ? 'Open Now' : 'Closed'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaIcon}>{'\u{25CE}'}</Text>
                      <Text style={styles.metaText}>{branch.address}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaIcon}>{'\u{25F4}'}</Text>
                      <Text style={styles.metaText}>{branch.hours}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-end',
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    paddingHorizontal: spacing.md,
  },
  compactPill: {
    maxWidth: 122,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
  },
  icon: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  text: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  compactText: {
    color: colors.primary,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '900',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(6, 20, 43, 0.18)',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    maxHeight: '82%',
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: colors.surface,
    paddingTop: spacing.xl,
    shadowColor: colors.text,
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  titleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  closeText: {
    color: colors.label,
    fontSize: 28,
    lineHeight: 30,
  },
  list: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  branchCard: {
    gap: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
  branchCardActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: '#eef4ff',
  },
  branchCardClosed: {
    opacity: 0.68,
  },
  branchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  branchTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  statusPill: {
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusPillClosed: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  statusTextClosed: {
    color: '#b91c1c',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaIcon: {
    width: 14,
    color: '#8fa0bc',
    fontSize: 13,
    textAlign: 'center',
  },
  metaText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  pressed: {
    opacity: 0.82,
  },
});
