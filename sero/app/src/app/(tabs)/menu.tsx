import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AiTag, BrandSwitch, Card, Screen, styles as ui, T, tap } from '@/components/ui';
import { Radius, Spacing } from '@/constants/theme';
import { marginBand, marginPct, menuTip, money, weeklyProfit } from '@/core/logic';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/state/store';

export default function Menu() {
  const c = useTheme();
  const { state, dispatch } = useStore();
  const tip = menuTip(state.menu);
  const bandColor = { healthy: c.good, ok: c.text, low: c.bad } as const;

  return (
    <Screen title="Menu" subtitle="What sells, what earns, and what to change. Tap an item to edit its price and cost.">
      {tip ? (
        <Card tone="ai">
          <AiTag label="AI tip" />
          <T variant="small">{tip}</T>
        </Card>
      ) : null}

      <Card style={{ paddingVertical: Spacing.one, gap: 0 }}>
        {state.menu.map((m, i) => {
          const pct = Math.round(marginPct(m.price, m.cost));
          return (
            <View
              key={m.id}
              style={[
                s.row,
                i > 0 && {
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: c.line,
                },
              ]}>
              <View style={s.main}>
                <Link href={{ pathname: '/menu/[id]', params: { id: m.id } }} asChild>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityHint="Edit price and cost"
                    style={({ pressed }) => [{ gap: 2 }, pressed && { opacity: 0.6 }]}>
                    <T variant="bodyStrong" style={!m.available && s.off}>
                      {m.name}
                    </T>
                    <T variant="caption" muted>
                      {money(m.price, true)} · {m.sold} sold ·{' '}
                      <T variant="caption" color={m.trend >= 0 ? c.good : c.bad}>
                        {m.trend >= 0 ? '▲' : '▼'} {Math.abs(m.trend)}%
                      </T>
                    </T>
                  </Pressable>
                </Link>
              </View>
              <View style={s.margin}>
                <T variant="bodyStrong" color={bandColor[marginBand(pct)]}>
                  {pct}%
                </T>
                <T variant="caption" muted>
                  {money(weeklyProfit(m))}/wk
                </T>
              </View>
              <BrandSwitch
                accessibilityLabel={`${m.name} on menu`}
                value={m.available}
                onValueChange={() => {
                  tap();
                  dispatch({ type: 'toggleItem', id: m.id });
                }}
              />
            </View>
          );
        })}
      </Card>

      <View style={[ui.row, { flexWrap: 'wrap' }]}>
        <Legend color={c.good} label="65%+ healthy" />
        <Legend color={c.text} label="45–64% ok" />
        <Legend color={c.bad} label="under 45% review" />
      </View>
      <T variant="caption" muted>
        Margin = (price − cost to make) ÷ price. Switch an item off to mark it sold out.
      </T>
    </Screen>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={ui.row}>
      <View style={[s.dot, { backgroundColor: color }]} />
      <T variant="caption" muted>
        {label}
      </T>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: 12,
  },
  main: { flex: 1, minWidth: 0 },
  off: { opacity: 0.5, textDecorationLine: 'line-through' },
  margin: { alignItems: 'flex-end', width: 84 },
  dot: { width: 8, height: 8, borderRadius: Radius.pill },
});
