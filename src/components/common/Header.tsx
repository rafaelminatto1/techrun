import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  ViewStyle,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {theme} from '@utils/theme';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  showBorder?: boolean;
  transparent?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  backgroundColor = theme.colors.surface,
  textColor = theme.colors.textPrimary,
  showBorder = true,
  transparent = false,
  style,
  testID,
}) => {
  const insets = useSafeAreaInsets();

  const headerStyle = {
    paddingTop: insets.top,
    backgroundColor: transparent ? 'transparent' : backgroundColor,
    borderBottomWidth: showBorder ? 1 : 0,
  };

  return (
    <>
      <StatusBar
        backgroundColor={transparent ? 'transparent' : backgroundColor}
        barStyle={transparent ? 'light-content' : 'dark-content'}
        translucent={transparent}
      />

      <View style={[styles.container, headerStyle, style]} testID={testID}>
        <View style={styles.content}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {leftIcon && (
              <TouchableOpacity
                onPress={onLeftPress}
                style={styles.iconButton}
                testID={`${testID}-left-button`}>
                {leftIcon}
              </TouchableOpacity>
            )}
          </View>

          {/* Center Section */}
          <View style={styles.centerSection}>
            {title && (
              <Text
                style={[styles.title, {color: textColor}]}
                numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={[styles.subtitle, {color: textColor}]}
                numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightIcon && (
              <TouchableOpacity
                onPress={onRightPress}
                style={styles.iconButton}
                testID={`${testID}-right-button`}>
                {rightIcon}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  centerSection: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: theme.spacing.small,
  },

  container: {
    borderBottomColor: theme.colors.border,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  content: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: theme.spacing.medium,
  },

  iconButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },

  leftSection: {
    alignItems: 'flex-start',
    width: 40,
  },

  rightSection: {
    alignItems: 'flex-end',
    width: 40,
  },

  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.small,
    marginTop: 2,
    opacity: 0.7,
    textAlign: 'center',
  },

  title: {
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.large,
    textAlign: 'center',
  },
});

export default Header;
