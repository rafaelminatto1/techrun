import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

// Breakpoints para responsividade
export const breakpoints = {
  small: 320,
  medium: 768,
  large: 1024,
};

// Cores do tema
export const colors = {
  // Cores primárias
  primary: '#1E3A8A', // Azul principal
  primaryLight: '#3B82F6',
  primaryDark: '#1E40AF',

  // Cores secundárias
  secondary: '#10B981', // Verde
  secondaryLight: '#34D399',
  secondaryDark: '#059669',

  // Cores de acento
  accent: '#F59E0B', // Laranja/Amarelo
  accentLight: '#FBBF24',
  accentDark: '#D97706',

  // Cores de status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Cores neutras
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Cores de fundo
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',

  // Cores de texto
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Cores de borda
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',

  // Cores específicas do app
  exerciseRunning: '#3B82F6',
  exerciseSquat: '#10B981',
  exerciseJump: '#F59E0B',
  exercisePushup: '#EF4444',
  exerciseDeadlift: '#8B5CF6',
  exercisePlank: '#06B6D4',

  // Gradientes
  gradientPrimary: ['#1E3A8A', '#3B82F6'],
  gradientSecondary: ['#10B981', '#34D399'],
  gradientAccent: ['#F59E0B', '#FBBF24'],
};

// Tipografia
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 42,
    '4xl': 48,
    '5xl': 64,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
};

// Espaçamentos
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Bordas e raios
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Sombras
export const shadows = {
  none: {
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowOffset: {width: 0, height: 20},
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
};

// Dimensões
export const dimensions = {
  window: {
    width,
    height,
  },
  screen: Dimensions.get('screen'),
  isSmallDevice: width < breakpoints.medium,
  isTablet: width >= breakpoints.medium,
};

// Componentes base
export const components = {
  button: {
    height: {
      small: 32,
      medium: 44,
      large: 56,
    },
    padding: {
      small: spacing.sm,
      medium: spacing.md,
      large: spacing.lg,
    },
  },
  input: {
    height: 44,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
  },
};

// Animações
export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// Tema principal
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  dimensions,
  components,
  animations,
  breakpoints,
};

export type Theme = typeof theme;

// Hook para usar o tema
export const useTheme = () => theme;

// Utilitários de tema
export const getColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let result: any = colors;

  for (const key of keys) {
    result = result[key];
    if (result === undefined) {
      console.warn(`Color path '${colorPath}' not found`);

      return colors.primary;
    }
  }

  return result;
};

export const getSpacing = (size: keyof typeof spacing) => spacing[size];

export const getBorderRadius = (size: keyof typeof borderRadius) =>
  borderRadius[size];

export const getShadow = (size: keyof typeof shadows) => shadows[size];

// Tema escuro (para futuro uso)
export const darkTheme = {
  ...theme,
  colors: {
    ...colors,
    background: colors.gray900,
    backgroundSecondary: colors.gray800,
    surface: colors.gray800,
    surfaceSecondary: colors.gray700,
    textPrimary: colors.white,
    textSecondary: colors.gray300,
    textTertiary: colors.gray400,
    border: colors.gray700,
    borderLight: colors.gray600,
    borderDark: colors.gray800,
  },
};
