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
import {register} from '@store/slices/authSlice';
import {RootState, AppDispatch} from '@store/index';
import type {AuthStackParamList} from '@types/index';

type RegisterScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  'Register'
>;

const RegisterScreen: React.FC<RegisterScreenProps> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading, error} = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    // Validar nome
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 8) {
      errors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
        'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número';
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    if (!acceptedTerms) {
      // Mostrar erro sobre termos
      return;
    }

    try {
      await dispatch(
        register({
          name: formData.name.trim(),
          email: formData.email,
          password: formData.password,
        }),
      ).unwrap();

      // Navegação será tratada automaticamente pelo AuthNavigator
    } catch (error) {
      // Erro já tratado pelo slice
      console.error('Register error:', error);
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

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const getPasswordStrength = (): {
    strength: number;
    text: string;
    color: string;
  } => {
    const password = formData.password;
    let strength = 0;

    if (password.length >= 8) {
      strength++;
    }
    if (/[a-z]/.test(password)) {
      strength++;
    }
    if (/[A-Z]/.test(password)) {
      strength++;
    }
    if (/\d/.test(password)) {
      strength++;
    }
    if (/[^\w\s]/.test(password)) {
      strength++;
    }

    const strengthMap = {
      0: {text: 'Muito fraca', color: theme.colors.error},
      1: {text: 'Fraca', color: theme.colors.warning},
      2: {text: 'Regular', color: theme.colors.warning},
      3: {text: 'Boa', color: theme.colors.info},
      4: {text: 'Forte', color: theme.colors.success},
      5: {text: 'Muito forte', color: theme.colors.success},
    };

    return {
      strength,
      ...strengthMap[strength as keyof typeof strengthMap],
    };
  };

  if (loading) {
    return <LoadingSpinner text="Criando conta..." overlay />;
  }

  const passwordStrength = getPasswordStrength();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Header
        title="Criar Conta"
        leftIcon={<Text style={styles.backIcon}>←</Text>}
        onLeftPress={() => navigation.goBack()}
        testID="register-header"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          {/* Register Form */}
          <Card style={styles.formCard} padding="large">
            <Text style={styles.formTitle}>Crie sua conta</Text>
            <Text style={styles.formSubtitle}>
              Junte-se a milhares de usuários que já melhoraram seus treinos
            </Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Nome completo"
              placeholder="Digite seu nome"
              value={formData.name}
              onChangeText={handleInputChange('name')}
              error={formErrors.name}
              autoCapitalize="words"
              testID="register-name-input"
            />

            <Input
              label="Email"
              placeholder="Digite seu email"
              value={formData.email}
              onChangeText={handleInputChange('email')}
              error={formErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="register-email-input"
            />

            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={formData.password}
              onChangeText={handleInputChange('password')}
              error={formErrors.password}
              secureTextEntry
              testID="register-password-input"
            />

            {formData.password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthBar}>
                  <View
                    style={[
                      styles.strengthFill,
                      {
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    {color: passwordStrength.color},
                  ]}>
                  {passwordStrength.text}
                </Text>
              </View>
            )}

            <Input
              label="Confirmar senha"
              placeholder="Digite sua senha novamente"
              value={formData.confirmPassword}
              onChangeText={handleInputChange('confirmPassword')}
              error={formErrors.confirmPassword}
              secureTextEntry
              testID="register-confirm-password-input"
            />

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Button
                title={acceptedTerms ? '☑️' : '☐'}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
                variant="ghost"
                style={styles.checkboxButton}
                testID="terms-checkbox"
              />
              <Text style={styles.termsText}>
                Eu aceito os <Text style={styles.termsLink}>Termos de Uso</Text>{' '}
                e a{' '}
                <Text style={styles.termsLink}>Política de Privacidade</Text>
              </Text>
            </View>

            <Button
              title="Criar conta"
              onPress={handleRegister}
              loading={loading}
              disabled={loading || !acceptedTerms}
              fullWidth
              style={styles.registerButton}
              testID="register-submit-button"
            />
          </Card>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta?</Text>
            <Button
              title="Fazer login"
              onPress={navigateToLogin}
              variant="ghost"
              testID="login-button"
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backIcon: {
    color: theme.colors.textPrimary,
    fontSize: 24,
  },

  checkboxButton: {
    marginRight: theme.spacing.small,
    minHeight: 30,
    minWidth: 30,
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

  formCard: {
    marginBottom: theme.spacing.large,
  },

  formSubtitle: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.medium,
    marginBottom: theme.spacing.large,
    textAlign: 'center',
  },

  formTitle: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.xlarge,
    marginBottom: theme.spacing.small,
    textAlign: 'center',
  },

  loginContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.small,
    justifyContent: 'center',
  },

  loginText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.medium,
  },

  passwordStrength: {
    marginBottom: theme.spacing.medium,
    marginTop: -theme.spacing.small,
  },

  registerButton: {
    marginTop: theme.spacing.medium,
  },

  scrollContent: {
    flexGrow: 1,
  },

  strengthBar: {
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    height: 4,
    marginBottom: theme.spacing.xsmall,
  },

  strengthFill: {
    borderRadius: 2,
    height: '100%',
  },

  strengthText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.small,
  },

  termsContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: theme.spacing.medium,
  },

  termsLink: {
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },

  termsText: {
    color: theme.colors.textSecondary,
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.small,
    lineHeight: theme.typography.lineHeight.small,
  },
});

export default RegisterScreen;
