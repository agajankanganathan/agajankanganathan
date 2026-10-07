import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AiTag, Button, Card, Screen, styles as ui, T, tap } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { DRIVERS, FUNNEL } from '@/core/sample-data';
import type { ModuleKey } from '@/core/types';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/state/store';

const MODULE_HREF: Record<ModuleKey, Href> = {
  insights: '/insights',
  promos: '/grow',
  loyalty: '/grow?tab=loyalty',
  menu: '/menu',
  reviews: '/reviews',
};

export default function Insights() {
  const c = useTheme();
  const { state, dispatch } = useStore();
  const driver = DRIVERS.find((d) => d.id === state.driverId) ?? DRIVERS[0];
  const top = DRIVERS[0].share;

  return (
    <Screen title="Insights" subtitle="Why guests don’t come back, ranked by lost visits.">
      <Card>
        <T variant="bodyStrong">Why customers leave</T>
        <View style={{ gap: 6 }}>
          {DRIVERS.map((d) => {
            const on = d.id === driver.id;
            return (
              <Pressable
                key={d.id}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${d.name}, ${d.share}% of lost visits`}
                onPress={() => {
                  tap();
                  dispatch({ type: 'selectDriver', id: d.id });
                }}
                style={s.driver}>
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    s.driverFill,
                    {
                      width: `${(d.share / top) * 100}%`,
                      backgroundColor: on ? c.accent : c.accentSoft,
                      opacity: on ? 0.55 : 1,
                    },
                  ]}
                />
                <T variant="small" style={{ flex: 1 }}>
                  {d.name}
                </T>
                <T variant="smallStrong">{d.share}%</T>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card tone="ai">
        <AiTag />
        <T variant="bodyStrong">{driver.name}</T>
        <T variant="small">{driver.detail}</T>
        <T variant="small">
          <T variant="smallStrong">Suggested fix: </T>
          {driver.fix}
        </T>
        {driver.action ? (
          <Button
            label={`${driver.action.label} →`}
            onPress={() => router.navigate(MODULE_HREF[driver.action!.module])}
          />
        ) : null}
      </Card>

      <Card>
        <T variant="bodyStrong">Customer journey · last 30 days</T>
        <View style={{ gap: 6 }}>
          {FUNNEL.map((f, i) => (
            <View key={f.label} style={s.step}>
              <View
                style={[
                  StyleSheet.absoluteFill,
                  s.driverFill,
                  { width: `${Math.max(8, (f.count / FUNNEL[0].count) * 100)}%`, backgroundColor: c.accentSoft },
                ]}
              />
              <View style={[ui.row, { justifyContent: 'space-between' }]}>
                <T variant="small">{f.label}</T>
                <T variant="smallStrong">{f.count.toLocaleString('en-US')}</T>
              </View>
              {i > 0 ? (
                <T variant="caption" muted>
                  {Math.round((f.count / FUNNEL[i - 1].count) * 100)}% of the step before
                </T>
              ) : null}
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  driver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  driverFill: { borderRadius: Radius.sm },
  step: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: Radius.sm, overflow: 'hidden', gap: 2 },
});
