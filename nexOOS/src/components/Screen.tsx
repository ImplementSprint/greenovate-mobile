import { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: ViewStyle;
  topBar?: ReactNode;
  bottomBar?: ReactNode;
}>;

export function Screen({ children, scroll = true, contentStyle, topBar, bottomBar }: ScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safe}>
        {topBar ? <View style={styles.topBar}>{topBar}</View> : null}
        <View style={bottomBar ? styles.fixedContent : styles.flex}>{children}</View>
        {bottomBar ? <View style={styles.bottomBar}>{bottomBar}</View> : null}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {topBar ? <View style={styles.topBar}>{topBar}</View> : null}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          contentStyle,
          bottomBar ? styles.contentWithBottomBar : null,
        ]}
      >
        {children}
      </ScrollView>
      {bottomBar ? <View style={styles.bottomBar}>{bottomBar}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  fixedContent: {
    flex: 1,
    paddingBottom: 82,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  contentWithBottomBar: {
    paddingBottom: 112,
  },
  bottomBar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
  },
  topBar: {
    zIndex: 2,
  },
});
