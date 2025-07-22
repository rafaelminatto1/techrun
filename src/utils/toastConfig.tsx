import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {BaseToast, ErrorToast, ToastConfig} from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {theme} from './theme';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  closeButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  container: {
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    elevation: 5,
    flexDirection: 'row',
    marginHorizontal: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: width - 32,
  },
  errorContainer: {
    backgroundColor: theme.colors.error,
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  infoContainer: {
    backgroundColor: theme.colors.info,
  },
  message: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    opacity: 0.9,
  },
  successContainer: {
    backgroundColor: theme.colors.success,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginBottom: 2,
  },
  warningContainer: {
    backgroundColor: theme.colors.warning,
  },
});

interface CustomToastProps {
  text1?: string;
  text2?: string;
  onPress?: () => void;
  hide?: () => void;
}

const CustomToast: React.FC<{
  props: CustomToastProps;
  containerStyle: any;
  iconName: string;
}> = ({props, containerStyle, iconName}) => {
  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      onPress={props.onPress}
      activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Icon name={iconName} size={24} color={theme.colors.white} />
      </View>
      <View style={styles.textContainer}>
        {props.text1 && <Text style={styles.title}>{props.text1}</Text>}
        {props.text2 && <Text style={styles.message}>{props.text2}</Text>}
      </View>
      {props.hide && (
        <TouchableOpacity style={styles.closeButton} onPress={props.hide}>
          <Icon name='close' size={20} color={theme.colors.white} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export const toastConfig: ToastConfig = {
  success: props => (
    <CustomToast
      props={props}
      containerStyle={styles.successContainer}
      iconName='check-circle'
    />
  ),
  error: props => (
    <CustomToast
      props={props}
      containerStyle={styles.errorContainer}
      iconName='error'
    />
  ),
  warning: props => (
    <CustomToast
      props={props}
      containerStyle={styles.warningContainer}
      iconName='warning'
    />
  ),
  info: props => (
    <CustomToast
      props={props}
      containerStyle={styles.infoContainer}
      iconName='info'
    />
  ),
  // Toast customizado para análise completa
  analysisComplete: props => (
    <CustomToast
      props={props}
      containerStyle={[
        styles.successContainer,
        {backgroundColor: theme.colors.primary},
      ]}
      iconName='analytics'
    />
  ),
  // Toast customizado para upload de vídeo
  videoUpload: props => (
    <CustomToast
      props={props}
      containerStyle={[
        styles.infoContainer,
        {backgroundColor: theme.colors.secondary},
      ]}
      iconName='cloud-upload'
    />
  ),
  // Toast customizado para dicas de exercício
  exerciseTip: props => (
    <CustomToast
      props={props}
      containerStyle={[
        styles.infoContainer,
        {backgroundColor: theme.colors.accent},
      ]}
      iconName='lightbulb'
    />
  ),
};

// Funções utilitárias para mostrar toasts
export const showToast = {
  success: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;

    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      visibilityTime: 3000,
    });
  },
  error: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;

    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      visibilityTime: 4000,
    });
  },
  warning: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;

    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      visibilityTime: 3500,
    });
  },
  info: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;

    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      visibilityTime: 3000,
    });
  },
  analysisComplete: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;

    Toast.show({
      type: 'analysisComplete',
      text1: title,
      text2: message,
      visibilityTime: 4000,
    });
  },
  videoUpload: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;

    Toast.show({
      type: 'videoUpload',
      text1: title,
      text2: message,
      visibilityTime: 3000,
    });
  },
  exerciseTip: (title: string, message?: string) => {
    const Toast = require('react-native-toast-message').default;

    Toast.show({
      type: 'exerciseTip',
      text1: title,
      text2: message,
      visibilityTime: 5000,
    });
  },
};
