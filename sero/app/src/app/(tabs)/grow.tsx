import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrandSwitch, Button, Card, Screen, Segmented, styles as ui, T, tap } from '@/components/ui';
import { Brand, Radius, Spacing } from '@/constants/theme';
import { money, projectedLift } from '@/core/logic';
import { AT_RISK, LOYALTY } from '@/core/sample-data';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/state/store';

type Tab = 'promos' | 'loyalty';

export default function Grow() {
  // The active segment lives in the URL so other screens can deep-link to Loyalty.
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const active: Tab = tab === 'loyalty' ? 'loyalty' : 'promos';

  return (
    <Screen title="Grow" subtitle="Win guests back and reward your regulars.">
      <Segmented<Tab>
        label="Section"
        value={active}
        onChange={(t) => router.setParams({ tab: t })}
        options={[
          { key: 'promos', label: 'Promotions' },
          { key: 'loyalty', label: 'Loyalty' },
        ]}
      />
      {active === 'promos' ? <Promotions /> : <Loyalty />}
    </Screen>
  );
}

function Promotions() {
  const c = useTheme();
  const { state, dispatch } = useStore();
  const running = state.promos.filter((p) => p.on).length;

  return (
    <>
      <View style={s.grid}>
        <Card style={s.half}>
          <T variant="caption" muted>
            Running now
          </T>
          <T variant="stat">
            {running} of {state.promos.length}
          </T>
        </Card>
        <Card style={s.half}>
          <T variant="caption" muted>
            Projected lift / week
          </T>
          <T variant="stat" color={c.good}>
            +{money(projectedLift(state.promos))}
          </T>
        </Card>
      </View>
      {state.promos.map((p) => (
        <Card key={p.id} style={[ui.row, { justifyContent: 'space-between' }]}>
          <View style={{ flex: 1, gap: 2 }}>
            <T variant="bodyStrong">{p.name}</T>
            <T variant="small" muted>
              {p.audience} · est. +{money(p.weeklyLift)}/wk
            </T>
          </View>
          <BrandSwitch
            accessibilityLabel={p.name}
            value={p.on}
            onValueChange={() => {
              tap();
              dispatch({ type: 'togglePromo', id: p.id });
            }}
          />
        </Card>
      ))}
    </>
  );
}

function Loyalty() {
  const c = useTheme();
  const { state, dispatch } = useStore();
  const full = state.stamps >= LOYALTY.stampsForReward;

  return (
    <>
      <View style={s.grid}>
        <Card style={s.third}>
          <T variant="caption" muted>
            Members
          </T>
          <T variant="title">{LOYALTY.members}</T>
        </Card>
        <Card style={s.third}>
          <T variant="caption" muted>
            Visits / month
          </T>
          <T variant="title">{LOYALTY.visitsThisMonth.toLocaleString('en-US')}</T>
        </Card>
        <Card style={s.third}>
          <T variant="caption" muted>
            Redeemed
          </T>
          <T variant="title">{LOYALTY.rewardsRedeemed + state.redeemed}</T>
        </Card>
      </View>

      <Card>
        <T variant="bodyStrong">Stamp card · Maya R.</T>
        <View style={s.stamps} accessible accessibilityLabel={`${state.stamps} of ${LOYALTY.stampsForReward} stamps`}>
          {Array.from({ length: LOYALTY.stampsForReward }, (_, i) => {
            const on = i < state.stamps;
            return (
              <View
                key={i}
                style={[
                  s.stamp,
                  on
                    ? { backgroundColor: c.accent, borderColor: c.accent }
                    : { borderColor: c.line, borderStyle: 'dashed' },
                ]}>
                {on ? <View style={s.stampDot} /> : null}
              </View>
            );
          })}
        </View>
        <T variant="small" muted>
          {full ? 'Free drink unlocked 🎉' : `${LOYALTY.stampsForReward - state.stamps} more for a free drink`}
        </T>
        <Button
          label={full ? 'Redeem reward' : 'Add a stamp'}
          onPress={() => {
            if (full) tap('success');
            dispatch({ type: 'addStamp' });
          }}
        />
      </Card>

      <Card>
        <T variant="bodyStrong">Regulars at risk</T>
        {AT_RISK.map((m) => {
          const sent = state.rewardsSent.includes(m.id);
          return (
            <View key={m.id} style={[ui.row, { paddingVertical: 4 }]}>
              <View style={[s.avatar, { backgroundColor: Brand.chocolate }]}>
                <T variant="smallStrong" color={Brand.linen}>
                  {m.name.charAt(0)}
                </T>
              </View>
              <View style={{ flex: 1 }}>
                <T variant="smallStrong">{m.name}</T>
                <T variant="caption" muted>
                  {m.cadence} · last visit {m.daysAway} days ago
                </T>
              </View>
              <Button
                size="sm"
                label={sent ? 'Sent ✓' : 'Send reward'}
                disabled={sent}
                onPress={() => {
                  tap('success');
                  dispatch({ type: 'sendReward', id: m.id });
                }}
              />
            </View>
          );
        })}
      </Card>
    </>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  half: { flexBasis: '48%', flexGrow: 1, gap: Spacing.half },
  third: { flexBasis: '30%', flexGrow: 1, gap: Spacing.half },
  stamps: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, maxWidth: 300 },
  stamp: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Brand.linen },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
