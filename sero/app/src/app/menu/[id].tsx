import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, styles as ui, T, tap } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { marginBand, marginPct, money, parseMoney } from '@/core/logic';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/state/store';

export default function EditItem() {
  const c = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, dispatch } = useStore();
  const item = state.menu.find((m) => m.id === id);

  const [price, setPrice] = useState(item ? item.price.toFixed(2) : '');
  const [cost, setCost] = useState(item ? item.cost.toFixed(2) : '');

  if (!item) {
    return (
      <View style={[s.wrap, { backgroundColor: c.background }]}>
        <T>That item no longer exists.</T>
      </View>
    );
  }

  const p = parseMoney(price);
  const k = parseMoney(cost);
  const error =
    Number.isNaN(p) || p <= 0
      ? 'Enter a price above $0.'
      : Number.isNaN(k) || k < 0
        ? 'Enter a cost of $0 or more.'
        : k > p
          ? 'Cost is higher than the price, so this item loses money.'
          : null;
  const valid = !Number.isNaN(p) && p > 0 && !Number.isNaN(k) && k >= 0;
  const pct = valid ? marginPct(p, k) : 0;
  const band = marginBand(pct);
  const bandColor = band === 'healthy' ? c.good : band === 'low' ? c.bad : c.text;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: c.background }}>
      <Stack.Screen options={{ title: item.name }} />
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <T variant="title">{item.name}</T>

        <View style={s.fields}>
          <Field label="Selling price" value={price} onChange={setPrice} />
          <Field label="Cost to make" value={cost} onChange={setCost} hint="Ingredients + packaging" />
        </View>

        <Card style={{ alignItems: 'center', gap: Spacing.one }}>
          <T variant="caption" muted>
            Gross margin
          </T>
          <T variant="display" color={valid ? bandColor : c.textSecondary} style={{ fontFamily: Fonts.semibold }}>
            {valid ? `${Math.round(pct)}%` : '–'}
          </T>
          {valid ? (
            <T variant="small" muted style={{ textAlign: 'center' }}>
              ({money(p, true)} − {money(k, true)}) ÷ {money(p, true)} = {pct.toFixed(1)}%{'\n'}
              {money(p - k, true)} profit per item · {money((p - k) * item.sold)} this week ({item.sold} sold)
            </T>
          ) : null}
        </Card>

        {error ? (
          <T variant="small" color={c.bad}>
            {error}
          </T>
        ) : null}

        <View style={ui.row}>
          <Button label="Cancel" kind="ghost" onPress={() => router.back()} />
          <Button
            label="Save"
            disabled={!valid}
            onPress={() => {
              tap('success');
              dispatch({
                type: 'updateItem',
                id: item.id,
                price: Math.round(p * 100) / 100,
                cost: Math.round(k * 100) / 100,
              });
              router.back();
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const c = useTheme();
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <T variant="smallStrong">{label}</T>
      <View style={[s.input, { borderColor: c.line, backgroundColor: c.card }]}>
        <T muted>$</T>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          inputMode="decimal"
          selectTextOnFocus
          style={[s.inputText, { color: c.text }]}
        />
      </View>
      {hint ? (
        <T variant="caption" muted>
          {hint}
        </T>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { padding: Spacing.four, gap: Spacing.three, width: '100%', maxWidth: 560, alignSelf: 'center' },
  fields: { flexDirection: 'row', gap: Spacing.three },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
  },
  inputText: { flex: 1, minWidth: 0, paddingVertical: 12, fontFamily: Fonts.semibold, fontSize: 18 },
});
