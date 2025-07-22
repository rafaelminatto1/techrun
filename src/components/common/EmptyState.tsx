import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {theme} from '@utils/theme';
import {Button} from '@components/base';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
  testID?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionText,
  onAction,
  style,
  testID,
}) => {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.content}>
        <Text style={styles.icon}>{icon}</Text>

        <Text style={styles.title}>{title}</Text>

        {description && <Text style={styles.description}>{description}</Text>}

        {actionText && onAction && (
          <View style={styles.actionContainer}>
            <Button
              title={actionText}
              onPress={onAction}
              variant="primary"
              testID={`${testID}-action`}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    width: '100%',
  },

  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.large,
  },

  content: {
    alignItems: 'center',
    maxWidth: 300,
  },

  description: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.medium,
    lineHeight: theme.typography.lineHeight.medium,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },

  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },

  title: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.large,
    marginBottom: theme.spacing.medium,
    textAlign: 'center',
  },
});

export default EmptyState;
