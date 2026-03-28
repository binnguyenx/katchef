export const colors = {
  primary: '#FF7A59',
  primaryDark: '#E85B33',
  secondary: '#67B86B',
  secondaryDark: '#489553',
  accent: '#F4C95D',
  background: '#FFF8F1',
  backgroundAlt: '#FFF1E3',
  surface: '#FFFFFF',
  surfaceMuted: '#FFF6EE',
  text: '#2F241F',
  textMuted: '#7B6B63',
  border: '#F0E0D2',
  danger: '#D95A5A',
  success: '#2E9E63',
  overlay: 'rgba(47, 36, 31, 0.14)',
  white: '#FFFFFF',
  black: '#000000',
  shadow: 'rgba(74, 49, 37, 0.12)',
} as const;

export type ColorToken = keyof typeof colors;
