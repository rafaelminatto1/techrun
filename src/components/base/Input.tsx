import React, {useState, forwardRef} from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {theme} from '@utils/theme';
import type {InputProps} from '@types/index';

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      error,
      helperText,
      disabled = false,
      required = false,
      secureTextEntry = false,
      multiline = false,
      numberOfLines = 1,
      maxLength,
      keyboardType = 'default',
      autoCapitalize = 'sentences',
      autoCorrect = true,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputStyle,
      labelStyle,
      errorStyle,
      helperStyle,
      testID,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecureVisible, setIsSecureVisible] = useState(false);

    const getContainerStyle = (): ViewStyle => {
      const baseStyle = styles.container;
      const focusedStyle = isFocused ? styles.focused : {};
      const errorStyle = error ? styles.errorContainer : {};
      const disabledStyle = disabled ? styles.disabledContainer : {};

      return {
        ...baseStyle,
        ...focusedStyle,
        ...errorStyle,
        ...disabledStyle,
      };
    };

    const getInputStyle = (): TextStyle => {
      const baseStyle = styles.input;
      const multilineStyle = multiline ? styles.multilineInput : {};
      const disabledStyle = disabled ? styles.disabledInput : {};

      return {
        ...baseStyle,
        ...multilineStyle,
        ...disabledStyle,
      };
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const toggleSecureEntry = () => {
      setIsSecureVisible(!isSecureVisible);
    };

    const renderLabel = () => {
      if (!label) {
        return null;
      }

      return (
        <Text style={[styles.label, labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      );
    };

    const renderError = () => {
      if (!error) {
        return null;
      }

      return <Text style={[styles.errorText, errorStyle]}>{error}</Text>;
    };

    const renderHelperText = () => {
      if (!helperText || error) {
        return null;
      }

      return <Text style={[styles.helperText, helperStyle]}>{helperText}</Text>;
    };

    const renderRightIcon = () => {
      if (secureTextEntry) {
        return (
          <TouchableOpacity
            onPress={toggleSecureEntry}
            style={styles.iconContainer}
            testID={`${testID}-secure-toggle`}>
            <Text style={styles.secureIcon}>
              {isSecureVisible ? '👁️' : '🙈'}
            </Text>
          </TouchableOpacity>
        );
      }

      if (rightIcon) {
        return (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.iconContainer}
            disabled={!onRightIconPress}
            testID={`${testID}-right-icon`}>
            {rightIcon}
          </TouchableOpacity>
        );
      }

      return null;
    };

    return (
      <View style={[styles.wrapper, containerStyle]}>
        {renderLabel()}

        <View style={getContainerStyle()}>
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

          <TextInput
            ref={ref}
            style={[getInputStyle(), inputStyle]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            secureTextEntry={secureTextEntry && !isSecureVisible}
            multiline={multiline}
            numberOfLines={numberOfLines}
            maxLength={maxLength}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            testID={testID}
            {...props}
          />

          {renderRightIcon()}
        </View>

        {renderError()}
        {renderHelperText()}

        {maxLength && (
          <Text style={styles.characterCount}>
            {value?.length || 0}/{maxLength}
          </Text>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  characterCount: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.small,
    marginTop: theme.spacing.xsmall,
    textAlign: 'right',
  },

  container: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 44,
    paddingHorizontal: theme.spacing.medium,
  },

  disabledContainer: {
    backgroundColor: theme.colors.disabled,
    borderColor: theme.colors.border,
  },

  disabledInput: {
    color: theme.colors.textSecondary,
  },

  errorContainer: {
    borderColor: theme.colors.error,
  },

  errorText: {
    color: theme.colors.error,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.small,
    marginTop: theme.spacing.xsmall,
  },

  focused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },

  helperText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.small,
    marginTop: theme.spacing.xsmall,
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xsmall,
  },

  input: {
    color: theme.colors.textPrimary,
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.medium,
    paddingVertical: theme.spacing.small,
  },

  label: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.medium,
    marginBottom: theme.spacing.xsmall,
  },

  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  required: {
    color: theme.colors.error,
  },

  secureIcon: {
    fontSize: 18,
  },

  wrapper: {
    marginBottom: theme.spacing.medium,
  },
});

Input.displayName = 'Input';

export default Input;
