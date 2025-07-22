import React, {memo, useMemo, useCallback} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {theme} from '@utils/theme';
import type {ButtonProps} from '@types/index';

const Button: React.FC<ButtonProps> = memo(
  ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle,
    testID,
    ...props
  }) => {
    // Memoizar estilos para evitar recálculos desnecessários
    const buttonStyle = useMemo((): ViewStyle => {
      const baseStyle = styles.button;
      const variantStyle = styles[variant];
      const sizeStyle = styles[size];
      const disabledStyle = disabled ? styles.disabled : {};
      const fullWidthStyle = fullWidth ? styles.fullWidth : {};

      return {
        ...baseStyle,
        ...variantStyle,
        ...sizeStyle,
        ...disabledStyle,
        ...fullWidthStyle,
      };
    }, [variant, size, disabled, fullWidth]);

    const textStyleMemo = useMemo((): TextStyle => {
      const baseTextStyle = styles.text;
      const variantTextStyle = styles[`${variant}Text`];
      const sizeTextStyle = styles[`${size}Text`];
      const disabledTextStyle = disabled ? styles.disabledText : {};

      return {
        ...baseTextStyle,
        ...variantTextStyle,
        ...sizeTextStyle,
        ...disabledTextStyle,
      };
    }, [variant, size, disabled]);

    // Memoizar cor do ActivityIndicator
    const indicatorColor = useMemo(() => {
      return variant === 'primary' ? theme.colors.white : theme.colors.primary;
    }, [variant]);

    // Memoizar tamanho do ActivityIndicator
    const indicatorSize = useMemo(() => {
      return size === 'small' ? ('small' as const) : ('small' as const);
    }, [size]);

    // Callback estável para onPress
    const handlePress = useCallback(() => {
      if (!disabled && !loading && onPress) {
        onPress();
      }
    }, [disabled, loading, onPress]);

    // Memoizar conteúdo do botão
    const content = useMemo(() => {
      if (loading) {
        return (
          <ActivityIndicator size={indicatorSize} color={indicatorColor} />
        );
      }

      const textElement = (
        <Text style={[textStyleMemo, textStyle]} numberOfLines={1}>
          {title}
        </Text>
      );

      if (icon) {
        return (
          <>
            {iconPosition === 'left' && icon}
            {textElement}
            {iconPosition === 'right' && icon}
          </>
        );
      }

      return textElement;
    }, [
      loading,
      indicatorSize,
      indicatorColor,
      textStyleMemo,
      textStyle,
      title,
      icon,
      iconPosition,
    ]);

    return (
      <TouchableOpacity
        style={[buttonStyle, style]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.7}
        testID={testID}
        {...props}>
        {content}
      </TouchableOpacity>
    );
  },
);

// Adicionar displayName para melhor debugging
Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.medium,
    flexDirection: 'row',
    gap: theme.spacing.xsmall,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderWidth: 0,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  danger: {
    backgroundColor: theme.colors.error,
    borderWidth: 0,
  },
  success: {
    backgroundColor: theme.colors.success,
    borderWidth: 0,
  },

  // Sizes
  small: {
    minHeight: 32,
    paddingHorizontal: theme.spacing.small,
    paddingVertical: theme.spacing.xsmall,
  },
  medium: {
    minHeight: 44,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
  },
  large: {
    minHeight: 52,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
  },

  // States
  disabled: {
    backgroundColor: theme.colors.disabled,
    borderColor: theme.colors.disabled,
  },
  fullWidth: {
    width: '100%',
  },

  // Text styles
  text: {
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  },

  // Variant text styles
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.white,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  ghostText: {
    color: theme.colors.primary,
  },
  dangerText: {
    color: theme.colors.white,
  },
  successText: {
    color: theme.colors.white,
  },

  // Size text styles
  smallText: {
    fontSize: theme.typography.fontSize.small,
    lineHeight: theme.typography.lineHeight.small,
  },
  mediumText: {
    fontSize: theme.typography.fontSize.medium,
    lineHeight: theme.typography.lineHeight.medium,
  },
  largeText: {
    fontSize: theme.typography.fontSize.large,
    lineHeight: theme.typography.lineHeight.large,
  },

  disabledText: {
    color: theme.colors.textSecondary,
  },
});

export default Button;
