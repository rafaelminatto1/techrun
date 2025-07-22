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
import {login} from '@store/slices/authSlice';
import {RootState, AppDispatch} from '@store/index';
import type {AuthStackParamList} from '@types/index';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    // Validar email
    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(
        login({
          email: formData.email,
          password: formData.password,
        }),
      ).unwrap();

      // Navegação será tratada automaticamente pelo AuthNavigator
    } catch (error) {
      // Erro já tratado pelo slice
      console.error('Login error:', error);
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) => (value: string) => {
      setFormData(prev => ({...prev, [field]: value}));

      // Limpar erro do campo quando usuário começar a digitar
      if (formErrors[field]) {
        setFormErrors(prev => ({...prev, [field]: undefined}));
      }
    };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  if (loading) {
    return <LoadingSpinner text="Fazendo login..." overlay />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header title="Login" transparent testID="login-header" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Logo/Brand */}
          <View style={styles.brandContainer}>
            <Text style={styles.brandIcon}>🏋️‍♂️</Text>
            <Text style={styles.brandTitle}>FitAnalyzer Pro</Text>
            <Text style={styles.brandSubtitle}>
              Analise seus exercícios com IA
            </Text>
          </View>

          {/* Login Form */}
          <Card style={styles.formCard} padding="large">
            <Text style={styles.formTitle}>Entre na sua conta</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Email"
              placeholder="Digite seu email"
              value={formData.email}
              onChangeText={handleInputChange('email')}
              error={formErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="login-email-input"
            />

            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={formData.password}
              onChangeText={handleInputChange('password')}
              error={formErrors.password}
              secureTextEntry
              testID="login-password-input"
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              fullWidth
              style={styles.loginButton}
              testID="login-submit-button"
            />

            <Button
              title="Esqueci minha senha"
              onPress={navigateToForgotPassword}
              variant="ghost"
              fullWidth
              style={styles.forgotButton}
              testID="forgot-password-button"
            />
          </Card>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Não tem uma conta?</Text>
            <Button
              title="Criar conta"
              onPress={navigateToRegister}
              variant="ghost"
              testID="register-button"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  brandContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xlarge,
  },

  brandIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.medium,
  },

  brandSubtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.medium,
    textAlign: 'center',
  },

  brandTitle: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xxlarge,
    marginBottom: theme.spacing.small,
  },

  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.large,
  },

  errorContainer: {
    backgroundColor: theme.colors.errorBackground,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
    padding: theme.spacing.medium,
  },

  errorText: {
    color: theme.colors.error,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.medium,
    textAlign: 'center',
  },

  forgotButton: {
    marginTop: theme.spacing.small,
  },

  formCard: {
    marginBottom: theme.spacing.large,
  },

  formTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.xlarge,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },

  loginButton: {
    marginTop: theme.spacing.medium,
  },

  registerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
    justifyContent: 'center',
  },

  registerText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.medium,
  },

  scrollContent: {
    flexGrow: 1,
  },
});

export default LoginScreen;
