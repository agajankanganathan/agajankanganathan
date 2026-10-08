// Web preview of the app: same screens, with a simple bottom tab bar standing in for the native one.
import { TabList, TabSlot, TabTrigger, Tabs, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { T } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAttention } from '@/state/store';

export default function WebTabs() {
  const c = useTheme();
  const { atRisk, toAnswer } = useAttention();
  return (
    <Tabs>
      <TabSlot style={{ flex: 1 }} />
      <TabList style={[s.bar, { backgroundColor: c.background, borderTopColor: c.line }]}>
        <TabTrigger name="index" href="/" asChild>
          <TabButton label="Today" />
        </TabTrigger>
        <TabTrigger name="insights" href="/insights" asChild>
          <TabButton label="Insights" />
        </TabTrigger>
        <TabTrigger name="grow" href="/grow" asChild>
          <TabButton label="Grow" badge={atRisk} />
        </TabTrigger>
        <TabTrigger name="menu" href="/menu" asChild>
          <TabButton label="Menu" />
        </TabTrigger>
        <TabTrigger name="reviews" href="/reviews" asChild>
          <TabButton label="Reviews" badge={toAnswer} />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

function TabButton({ label, badge, isFocused, ...props }: TabTriggerSlotProps & { label: string; badge?: number }) {
  const c = useTheme();
  return (
    <Pressable {...props} style={[s.tab, isFocused && { backgroundColor: c.accentSoft }]}>
      <T variant="smallStrong" color={isFocused ? c.text : c.textSecondary}>
        {label}
      </T>
      {badge ? (
        <View style={[s.badge, { backgroundColor: c.bad }]}>
          <T variant="caption" color="#fff">
            {badge}
          </T>
        </View>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
