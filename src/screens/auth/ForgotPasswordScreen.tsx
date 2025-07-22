import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Input, Card} from '@components/base';
import {LoadingSpinner, Header} from '@components/common';
import {theme} from '@utils/theme';
import {forgotPassword} from '@store/slices/authSlice';
import {RootState, AppDispatch} from '@store/index';
import type {AuthStackParamList} from '@types/index';

type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'ForgotPassword'
>;

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (): boolean => {
    if (!email) {
      setEmailError('Email é obrigatório');

      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Email inválido');

      return false;
    }

    setEmailError(undefined);

    return true;
  };

  const handleForgotPassword = async () => {
    if (!validateEmail()) {return;}

    try {
      await dispatch(forgotPassword({email})).unwrap();
      setEmailSent(true);
    } catch (error) {
      // Erro já tratado pelo slice
      console.error('Forgot password error:', error);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    // Limpar erro quando usuário começar a digitar
    if (emailError) {
      setEmailError(undefined);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    handleForgotPassword();
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  if (loading) {
    return <LoadingSpinner text='Enviando email...' overlay />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header
        title='Recuperar Senha'
        leftIcon={<Text style={styles.backIcon}>←</Text>}
        onLeftPress={() => navigation.goBack()}
        testID='forgot-password-header'
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'>
        <View style={styles.content}>
          {!emailSent ? (
            <>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🔐</Text>
              </View>

              {/* Form */}
              <Card style={styles.formCard} padding='large'>
                <Text style={styles.formTitle}>Esqueceu sua senha?</Text>
                <Text style={styles.formSubtitle}>
                  Digite seu email e enviaremos um link para redefinir sua
                  senha.
                </Text>

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <Input
                  label='Email'
                  placeholder='Digite seu email'
                  value={email}
                  onChangeText={handleEmailChange}
                  error={emailError}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoCorrect={false}
                  testID='forgot-password-email-input'
                />

                <Button
                  title='Enviar link de recuperação'
                  onPress={handleForgotPassword}
                  loading={loading}
                  disabled={loading}
                  fullWidth
                  style={styles.submitButton}
                  testID='forgot-password-submit-button'
                />
              </Card>
            </>
          ) : (
            <>
              {/* Success Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📧</Text>
              </View>

              {/* Success Message */}
              <Card style={styles.formCard} padding='large'>
                <Text style={styles.formTitle}>Email enviado!</Text>
                <Text style={styles.formSubtitle}>
                  Enviamos um link de recuperação para{' '}
                  <Text style={styles.emailText}>{email}</Text>. Verifique sua
                  caixa de entrada e spam.
                </Text>

                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsTitle}>Próximos passos:</Text>
                  <Text style={styles.instructionItem}>
                    1. Abra o email que enviamos
                  </Text>
                  <Text style={styles.instructionItem}>
                    2. Clique no link de recuperação
                  </Text>
                  <Text style={styles.instructionItem}>
                    3. Crie uma nova senha
                  </Text>

                <Button
                  title='Reenviar email'
                  onPress={handleResendEmail}
                  variant='outline'
                  fullWidth
                  style={styles.resendButton}
                  testID='resend-email-button'
                />
              </Card>
            </>
          )}

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Lembrou da senha?</Text>
            <Button
              title='Voltar ao login'
              onPress={navigateToLogin}
              variant='ghost'
              testID='back-to-login-button'
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backIcon: {
    fontSize: 24,
    color: theme.colors.textPrimary,
  },
  
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  content: {
    flex: 1,
    padding: theme.spacing.large,
    justifyContent: 'center',
  },
  
  emailText: {
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.primary,
  },
  
  errorContainer: {
    backgroundColor: theme.colors.errorBackground,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
  },
  
  errorText: {
    fontSize: theme.typography.fontSize.medium,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.error,
    textAlign: 'center',
  },
  
  formCard: {
    marginBottom: theme.spacing.large,
  },
  
  formSubtitle: {
    fontSize: theme.typography.fontSize.medium,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.medium,
    marginBottom: theme.spacing.large,
  },
  
  formTitle: {
    fontSize: theme.typography.fontSize.xlarge,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.small,
  },
  
  icon: {
    fontSize: 64,
  },
  
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xlarge,
  },
  
  instructionItem: {
    fontSize: theme.typography.fontSize.medium,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xsmall,
  },
  
  instructionsContainer: {
    backgroundColor: theme.colors.surfaceVariant,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.large,
  },
  
  instructionsTitle: {
    fontSize: theme.typography.fontSize.medium,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
  },
  
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.small,
  },
  
  loginText: {
    fontSize: theme.typography.fontSize.medium,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
  },
  
  resendButton: {
    marginTop: theme.spacing.medium,
  },
  
  scrollContent: {
    flexGrow: 1,
  },
  
  submitButton: {
    marginTop: theme.spacing.medium,
  },
});

export default ForgotPasswordScreen;
