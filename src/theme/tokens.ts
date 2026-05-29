export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
} as const;

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 13,
    sm: 15,
    md: 18,
    lg: 22,
    xl: 28,
    '2xl': 40,
  },
  lineHeight: {
    xs: 18,
    sm: 22,
    md: 24,
    lg: 30,
    xl: 34,
    '2xl': 46,
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

export const shadows = {
  card: {
    shadowColor: '#020912',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 10,
  },
  floating: {
    shadowColor: '#000814',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.34,
    shadowRadius: 30,
    elevation: 16,
  },
} as const;
