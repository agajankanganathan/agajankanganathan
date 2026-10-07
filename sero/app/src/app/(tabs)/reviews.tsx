import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Button, Card, Screen, Segmented, styles as ui, T, tap } from '@/components/ui';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { draftReply } from '@/core/logic';
import { REVIEWS } from '@/core/sample-data';
import type { Review, Tone } from '@/core/types';
import { useTheme } from '@/hooks/use-theme';
import { useStore } from '@/state/store';

export default function Reviews() {
  const { state } = useStore();
  const [openId, setOpenId] = useState<string | null>(REVIEWS[0].id);

  return (
    <Screen title="Reviews" subtitle="On-brand replies, drafted in seconds. Edit anything before you post.">
      {REVIEWS.map((r) => (
        <ReviewCard
          key={r.id}
          review={r}
          open={openId === r.id}
          replied={state.replied.includes(r.id)}
          onToggle={() => setOpenId(openId === r.id ? null : r.id)}
        />
      ))}
    </Screen>
  );
}

function ReviewCard({
  review,
  open,
  replied,
  onToggle,
}: {
  review: Review;
  open: boolean;
  replied: boolean;
  onToggle: () => void;
}) {
  const c = useTheme();
  const { dispatch } = useStore();
  const [tone, setTone] = useState<Tone>('warm');
  const [variant, setVariant] = useState(0);
  const [text, setText] = useState(() => draftReply(review, 'warm', 0));

  const redraft = (t: Tone, v: number) => {
    setTone(t);
    setVariant(v);
    setText(draftReply(review, t, v));
  };

  return (
    <Card style={open && { borderColor: c.accent }}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${review.stars} star review from ${review.author} on ${review.source}`}
        onPress={() => {
          tap();
          onToggle();
        }}
        style={{ gap: 4 }}>
        <View style={[ui.row, { justifyContent: 'space-between' }]}>
          <T variant="body" color={c.star} style={{ letterSpacing: 1 }}>
            {'★'.repeat(review.stars)}
            <T variant="body" color={c.textSecondary} style={{ opacity: 0.4 }}>
              {'★'.repeat(5 - review.stars)}
            </T>
          </T>
          <View style={[s.status, { borderColor: replied ? c.good : c.bad }]}>
            <T variant="caption" color={replied ? c.good : c.bad}>
              {replied ? 'Replied' : 'Needs a reply'}
            </T>
          </View>
        </View>
        <T variant="smallStrong">
          {review.author} · {review.source}
        </T>
        <T variant="small" muted numberOfLines={open ? undefined : 2}>
          {review.text}
        </T>
      </Pressable>

      {open && !replied ? (
        <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
          <Segmented<Tone>
            label="Tone"
            value={tone}
            onChange={(t) => redraft(t, 0)}
            options={[
              { key: 'warm', label: 'Warm' },
              { key: 'professional', label: 'Professional' },
              { key: 'short', label: 'Short' },
            ]}
          />
          <TextInput
            accessibilityLabel="Draft reply"
            multiline
            value={text}
            onChangeText={setText}
            style={[s.input, { color: c.text, borderColor: c.line, backgroundColor: c.background }]}
          />
          <View style={[ui.row, { justifyContent: 'flex-end' }]}>
            <Button kind="ghost" label="↻ Regenerate" onPress={() => redraft(tone, variant + 1)} />
            <Button
              label={`Post to ${review.source}`}
              disabled={!text.trim()}
              onPress={() => {
                tap('success');
                dispatch({ type: 'postReply', id: review.id });
              }}
            />
          </View>
        </View>
      ) : null}

      {open && replied ? (
        <View style={[s.posted, { borderColor: c.line }]}>
          <T variant="caption" muted>
            Your reply
          </T>
          <T variant="small">{text}</T>
        </View>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  status: { paddingHorizontal: 9, paddingVertical: 2, borderRadius: Radius.pill, borderWidth: 1 },
  input: {
    minHeight: 130,
    padding: 12,
    borderWidth: 1,
    borderRadius: Radius.sm,
    fontFamily: Fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    textAlignVertical: 'top',
  },
  posted: { gap: 4, padding: 12, borderWidth: 1, borderRadius: Radius.sm, marginTop: Spacing.two },
});
