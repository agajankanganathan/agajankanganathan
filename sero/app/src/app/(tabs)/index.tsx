import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Screen, Segmented, styles as ui, T, tap } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { greeting, money } from '@/core/logic';
import { CAFE_NAME, DRIVERS, RANGES } from '@/core/sample-data';
import type { RangeKey } from '@/core/types';
import { useTheme } from '@/hooks/use-theme';
import { useAttention, useStore } from '@/state/store';

export default function Today() {
  const c = useTheme();
  const { state, dispatch } = useStore();
  const attention = useAttention();
  const R = RANGES[state.range];
  const [bar, setBar] = useState<number | null>(null);
  const max = Math.max(...R.bars);

  const shortcuts: { label: string; value: string; href: Href }[] = [
    { label: 'Top reason guests leave', value: 'Morning waits', href: '/insights' },
    { label: 'Regulars at risk', value: String(attention.atRisk), href: '/grow?tab=loyalty' },
    { label: 'Reviews to answer', value: String(attention.toAnswer), href: '/reviews' },
    { label: 'Promotions running', value: String(attention.promosRunning), href: '/grow' },
  ];

  return (
    <Screen title={greeting()} subtitle={`${CAFE_NAME} · sample data`}>
      <Segmented<RangeKey>
        label="Date range"
        value={state.range}
        onChange={(range) => {
          setBar(null);
          dispatch({ type: 'setRange', range });
        }}
        options={[
          { key: '7d', label: '7 days' },
          { key: '30d', label: '30 days' },
        ]}
      />

      <View style={s.grid}>
        {R.kpis.map((k) => (
          <Card key={k.label} style={s.half}>
            <T variant="caption" muted>
              {k.label}
            </T>
            <T variant="stat">{k.value}</T>
            <T variant="caption" color={k.good ? c.good : c.bad}>
              {k.delta}
            </T>
          </Card>
        ))}
      </View>

      <Card>
        <View style={[ui.row, { justifyContent: 'space-between' }]}>
          <T variant="bodyStrong">Revenue</T>
          <T variant="small" muted style={{ fontVariant: ['tabular-nums'] }}>
            {bar === null ? 'Tap a bar' : `${R.labels[bar]} · ${money(R.bars[bar])}`}
          </T>
        </View>
        <View style={s.bars}>
          {R.bars.map((v, i) => (
            <Pressable
              key={R.labels[i]}
              accessibilityRole="button"
              accessibilityLabel={`${R.labels[i]}, ${money(v)}`}
              accessibilityState={{ selected: bar === i }}
              onPress={() => {
                tap();
                setBar(i);
              }}
              style={s.barCol}>
              <View style={s.barTrack}>
                <View
                  style={[
                    s.bar,
                    { height: `${(v / max) * 100}%`, backgroundColor: c.accent, opacity: bar === i ? 1 : 0.42 },
                  ]}
                />
              </View>
              <T variant="caption" muted>
                {R.labels[i]}
              </T>
            </Pressable>
          ))}
        </View>
      </Card>

      <T variant="heading">Needs your attention</T>
      <View style={s.grid}>
        {shortcuts.map((sc) => (
          <Pressable
            key={sc.label}
            accessibilityRole="link"
            onPress={() => {
              tap();
              router.navigate(sc.href);
            }}
            style={({ pressed }) => [s.half, pressed && { opacity: 0.7 }]}>
            <Card style={{ flex: 1 }}>
              <T variant="caption" muted>
                {sc.label}
              </T>
              <T variant="title">{sc.value}</T>
              <T variant="caption" color={c.accent}>
                Open →
              </T>
            </Card>
          </Pressable>
        ))}
      </View>

      <Card tone="ai">
        <T variant="caption" color={c.accent}>
          ✦ Biggest opportunity
        </T>
        <T variant="bodyStrong">{DRIVERS[0].name}</T>
        <T variant="small">{DRIVERS[0].fix}</T>
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  half: { flexBasis: '48%', flexGrow: 1, gap: Spacing.half },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.two, height: 160, marginTop: Spacing.two },
  barCol: { flex: 1, height: '100%', alignItems: 'center', gap: 6 },
  barTrack: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: {
    width: '100%',
    maxWidth: 40,
    borderTopLeftRadius: Radius.sm,
    borderTopRightRadius: Radius.sm,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    minHeight: 6,
  },
});
