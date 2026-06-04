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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 30,
  pill: 999,
} as const;

export const gray = {
  0: '#FFFFFF',
  25: '#FCFCFD',
  50: '#F9FAFB',
  100: '#F2F4F7',
  200: '#EAECF0',
  300: '#D0D5DD',
  400: '#98A2B3',
  500: '#667085',
  600: '#475467',
  700: '#344054',
  800: '#182230',
  900: '#101828',
  1000: '#07101F',
} as const;

export const brand = {
  blue: '#004FFB',
  bluePressed: '#003ECC',
  green: '#9BFF2A',
  greenPressed: '#84E51D',
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
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  floating: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.14,
    shadowRadius: 32,
    elevation: 10,
  },
} as const;
