import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAttention } from '@/state/store';

export default function TabLayout() {
  const c = Colors[useColorScheme() === 'light' ? 'light' : 'dark'];
  const { atRisk, toAnswer } = useAttention();

  return (
    <NativeTabs
      backgroundColor={c.background}
      indicatorColor={c.accentSoft}
      tintColor={c.accent}
      labelStyle={{ selected: { color: c.text } }}
      disableTransparentOnScrollEdge>
      <NativeTabs.Trigger name="index" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="insights" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Insights</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="sparkles" md="auto_awesome" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="grow" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Grow</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.line.uptrend.xyaxis" md="trending_up" />
        {atRisk > 0 ? <NativeTabs.Trigger.Badge>{String(atRisk)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="menu" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Menu</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" md="restaurant_menu" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reviews" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Label>Reviews</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'text.bubble', selected: 'text.bubble.fill' }} md="reviews" />
        {toAnswer > 0 ? <NativeTabs.Trigger.Badge>{String(toAnswer)}</NativeTabs.Trigger.Badge> : null}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
