import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {theme} from '@utils/theme';
import type {CardProps} from '@types/index';

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  onPress,
  variant = 'default',
  padding = 'medium',
  shadow = true,
  borderRadius = 'medium',
  style,
  contentStyle,
  headerStyle,
  testID,
  ...props
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle = styles.card;
    const variantStyle = styles[variant];
    const paddingStyle =
      styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`];
    const shadowStyle = shadow ? styles.shadow : {};
    const radiusStyle =
      styles[
        `radius${borderRadius.charAt(0).toUpperCase() + borderRadius.slice(1)}`
      ];

    return {
      ...baseStyle,
      ...variantStyle,
      ...paddingStyle,
      ...shadowStyle,
      ...radiusStyle,
    };
  };

  const renderHeader = () => {
    if (!title && !subtitle) {
      return null;
    }

    return (
      <View style={[styles.header, headerStyle]}>
        {title && (
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text style={styles.subtitle} numberOfLines={3}>
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  const renderContent = () => {
    return (
      <View style={[styles.content, contentStyle]}>
        {renderHeader()}
        {children}
      </View>
    );
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        activeOpacity={0.8}
        testID={testID}
        {...props}>
        {renderContent()}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]} testID={testID} {...props}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Variants
  default: {
    backgroundColor: theme.colors.surface,
  },
  elevated: {
    backgroundColor: theme.colors.surface,
    elevation: 4,
  },
  outlined: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  filled: {
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 0,
  },
  primary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },

  // Padding variants
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: theme.spacing.small,
  },
  paddingMedium: {
    padding: theme.spacing.medium,
  },
  paddingLarge: {
    padding: theme.spacing.large,
  },

  // Border radius variants
  radiusNone: {
    borderRadius: 0,
  },
  radiusSmall: {
    borderRadius: theme.borderRadius.small,
  },
  radiusMedium: {
    borderRadius: theme.borderRadius.medium,
  },
  radiusLarge: {
    borderRadius: theme.borderRadius.large,
  },
  radiusXlarge: {
    borderRadius: theme.borderRadius.xlarge,
  },

  // Shadow
  shadow: {
    ...theme.shadows.small,
  },

  content: {
    flex: 1,
  },

  header: {
    marginBottom: theme.spacing.small,
  },

  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.large,
    marginBottom: theme.spacing.xsmall,
  },

  subtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.medium,
    lineHeight: theme.typography.lineHeight.medium,
  },
});

export default Card;
