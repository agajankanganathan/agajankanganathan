import '@/global.css';

import { Platform } from 'react-native';

/** Sero brand palette. */
export const Brand = {
  black: '#010001',
  linen: '#FFF5EB',
  mahogany: '#2B0504',
  chocolate: '#A34C00',
  amber: '#D27A2C',
} as const;

// Dark is Sero's signature look (mahogany); light uses linen.
export const Colors = {
  light: {
    text: Brand.mahogany,
    textSecondary: 'rgba(43,5,4,0.66)',
    background: Brand.linen,
    card: '#F7E9DC',
    cardSelected: '#EFD9C5',
    line: 'rgba(43,5,4,0.14)',
    accent: Brand.chocolate,
    accentSoft: 'rgba(163,76,0,0.14)',
    onAccent: Brand.linen,
    inverse: Brand.mahogany,
    onInverse: Brand.linen,
    good: '#1d7f45',
    bad: '#b3261e',
    star: '#d98e14',
  },
  dark: {
    text: Brand.linen,
    textSecondary: 'rgba(255,245,235,0.68)',
    background: Brand.mahogany,
    card: '#3A0F0C',
    cardSelected: '#4C1A14',
    line: 'rgba(255,245,235,0.14)',
    accent: Brand.amber,
    accentSoft: 'rgba(210,122,44,0.2)',
    onAccent: Brand.linen,
    inverse: Brand.linen,
    onInverse: Brand.mahogany,
    good: '#7fd69b',
    bad: '#ff9a8a',
    star: '#f4b545',
  },
} as const;

export type Palette = { [K in keyof typeof Colors.light]: string };

/** Inter Tight stands in for Articulat CF until the font is licensed. */
export const Fonts = {
  regular: 'InterTight_400Regular',
  medium: 'InterTight_500Medium',
  semibold: 'InterTight_600SemiBold',
  bold: 'InterTight_700Bold',
  italicBold: 'InterTight_700Bold_Italic',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;

export const MaxContentWidth = 720;

export const isWeb = Platform.OS === 'web';
