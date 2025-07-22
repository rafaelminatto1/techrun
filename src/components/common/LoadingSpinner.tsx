import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import {theme} from '@utils/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = theme.colors.primary,
  text,
  overlay = false,
  style,
  testID,
}) => {
  const containerStyle = overlay ? styles.overlay : styles.container;

  return (
    <View style={[containerStyle, style]} testID={testID}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.large,
  },

  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },

  text: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.medium,
    marginTop: theme.spacing.medium,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
