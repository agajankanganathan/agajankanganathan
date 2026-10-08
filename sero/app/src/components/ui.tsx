import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  type PressableProps,
  type SwitchProps,
  type StyleProp,
  type TextProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Fonts, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function tap(kind: 'light' | 'success' = 'light') {
  if (Platform.OS === 'web') return;
  if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  else Haptics.selectionAsync();
}

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'small' | 'smallStrong' | 'caption' | 'stat';

const variants = StyleSheet.create({
  display: { fontFamily: Fonts.regular, fontSize: 34, lineHeight: 37, letterSpacing: -1 },
  title: { fontFamily: Fonts.semibold, fontSize: 22, lineHeight: 27, letterSpacing: -0.4 },
  heading: { fontFamily: Fonts.semibold, fontSize: 17, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: Fonts.regular, fontSize: 15.5, lineHeight: 22 },
  bodyStrong: { fontFamily: Fonts.semibold, fontSize: 15.5, lineHeight: 22 },
  small: { fontFamily: Fonts.regular, fontSize: 13.5, lineHeight: 18 },
  smallStrong: { fontFamily: Fonts.semibold, fontSize: 13.5, lineHeight: 18 },
  caption: { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 16 },
  stat: {
    fontFamily: Fonts.semibold,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.6,
    fontVariant: ['tabular-nums'],
  },
});

export function T({
  variant = 'body',
  muted,
  color,
  style,
  ...rest
}: TextProps & { variant?: Variant; muted?: boolean; color?: string }) {
  const c = useTheme();
  return <Text {...rest} style={[variants[variant], { color: color ?? (muted ? c.textSecondary : c.text) }, style]} />;
}

/** Big two-tone headline: regular text with a bold italic emphasis, like the brand site. */
export function Headline({ before, em, after }: { before?: string; em: string; after?: string }) {
  return (
    <T variant="display" accessibilityRole="header">
      {before}
      <Text style={{ fontFamily: Fonts.italicBold }}>{em}</Text>
      {after}
    </T>
  );
}

/** Scrollable screen with a large title and centred max-width content. */
export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={[
        styles.screen,
        { paddingTop: insets.top + Spacing.three, paddingBottom: insets.bottom + Spacing.six + Spacing.five },
      ]}>
      <View style={styles.screenHead}>
        <T variant="display" accessibilityRole="header">
          {title}
        </T>
        {subtitle ? <T muted>{subtitle}</T> : null}
      </View>
      {children}
    </ScrollView>
  );
}

export function Card({
  children,
  style,
  tone = 'plain',
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'plain' | 'ai';
}) {
  const c = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.card, borderColor: c.line },
        tone === 'ai' && { backgroundColor: c.accentSoft, borderColor: c.accent },
        style,
      ]}>
      {children}
    </View>
  );
}

export function AiTag({ label = 'AI insight' }: { label?: string }) {
  const c = useTheme();
  return (
    <View style={[styles.tag, { backgroundColor: c.accent }]}>
      <T variant="caption" color={c.onAccent}>
        ✦ {label}
      </T>
    </View>
  );
}

export function Button({
  label,
  onPress,
  kind = 'solid',
  size = 'md',
  disabled,
  style,
  ...rest
}: Omit<PressableProps, 'style'> & {
  label: string;
  kind?: 'solid' | 'ghost';
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}) {
  const c = useTheme();
  const solid = kind === 'solid';
  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={(e) => {
        tap();
        onPress?.(e);
      }}
      style={({ pressed }) => [
        styles.btn,
        size === 'sm' && styles.btnSm,
        solid ? { backgroundColor: c.inverse } : { borderColor: c.line, borderWidth: 1 },
        (pressed || disabled) && { opacity: disabled ? 0.45 : 0.75 },
        style,
      ]}>
      <T variant={size === 'sm' ? 'caption' : 'smallStrong'} color={solid ? c.onInverse : c.text}>
        {label}
      </T>
    </Pressable>
  );
}

export function Segmented<K extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { key: K; label: string }[];
  value: K;
  onChange: (k: K) => void;
  label: string;
}) {
  const c = useTheme();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={label}
      style={[styles.seg, { backgroundColor: c.card, borderColor: c.line }]}>
      {options.map((o) => {
        const on = o.key === value;
        return (
          <Pressable
            key={o.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => {
              if (!on) tap();
              onChange(o.key);
            }}
            style={[styles.segBtn, on && { backgroundColor: c.inverse }]}>
            <T variant="smallStrong" color={on ? c.onInverse : c.text}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

/** iOS-style green switch, consistent on native and web. */
export function BrandSwitch(props: SwitchProps) {
  const c = useTheme();
  return (
    <Switch
      trackColor={{ true: '#34c759', false: c.line }}
      thumbColor="#fff"
      // react-native-web colours the "on" thumb separately
      {...(Platform.OS === 'web' ? { activeThumbColor: '#fff' } : null)}
      {...props}
    />
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <T variant="heading" style={{ marginTop: Spacing.two }}>
      {children}
    </T>
  );
}

export const styles = StyleSheet.create({
  screen: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  screenHead: { gap: Spacing.one, marginBottom: Spacing.one },
  card: { padding: Spacing.three, borderRadius: Radius.md, borderWidth: StyleSheet.hairlineWidth, gap: Spacing.two },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.pill },
  btn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSm: { paddingHorizontal: 12, paddingVertical: 7 },
  seg: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    padding: 3,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.pill },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
});
