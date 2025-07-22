import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '@store/index';
import {appActions} from '@store/index';

// Components
import {Header, Card, Button} from '@components/index';

// Utils
import {theme} from '@utils/theme';

interface SettingsScreenProps {}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const {
    theme: currentTheme,
    language,
    notifications,
    permissions,
  } = useAppSelector(state => state.app);

  const [localSettings, setLocalSettings] = useState({
    darkMode: currentTheme === 'dark',
    notifications: notifications.enabled,
    pushNotifications: notifications.push,
    emailNotifications: notifications.email,
    soundEnabled: notifications.sound,
    vibrationEnabled: notifications.vibration,
    autoAnalysis: true,
    saveToGallery: true,
    highQualityRecording: false,
    dataUsage: 'wifi', // 'wifi' | 'cellular' | 'both'
  });

  const handleToggle = (
    setting: keyof typeof localSettings,
    value: boolean,
  ) => {
    setLocalSettings(prev => ({...prev, [setting]: value}));

    // Update Redux store based on setting
    switch (setting) {
      case 'darkMode':
        dispatch(appActions.setTheme(value ? 'dark' : 'light'));
        break;
      case 'notifications':
        dispatch(appActions.updateNotificationSettings({enabled: value}));
        break;
      case 'pushNotifications':
        dispatch(appActions.updateNotificationSettings({push: value}));
        break;
      case 'emailNotifications':
        dispatch(appActions.updateNotificationSettings({email: value}));
        break;
      case 'soundEnabled':
        dispatch(appActions.updateNotificationSettings({sound: value}));
        break;
      case 'vibrationEnabled':
        dispatch(appActions.updateNotificationSettings({vibration: value}));
        break;
    }
  };

  const handleDataUsageChange = () => {
    const options = [
      {label: 'Apenas Wi-Fi', value: 'wifi'},
      {label: 'Apenas Dados Móveis', value: 'cellular'},
      {label: 'Wi-Fi e Dados Móveis', value: 'both'},
    ];

    Alert.alert(
      'Uso de Dados',
      'Escolha quando permitir upload e análise de vídeos:',
      [
        ...options.map(option => ({
          text: option.label,
          onPress: () =>
            setLocalSettings(prev => ({
              ...prev,
              dataUsage: option.value as any,
            })),
        })),
        {text: 'Cancelar', style: 'cancel'},
      ],
    );
  };

  const handleLanguageChange = () => {
    const languages = [
      {label: 'Português', value: 'pt'},
      {label: 'English', value: 'en'},
      {label: 'Español', value: 'es'},
    ];

    Alert.alert('Idioma', 'Escolha o idioma do aplicativo:', [
      ...languages.map(lang => ({
        text: lang.label,
        onPress: () => dispatch(appActions.setLanguage(lang.value)),
      })),
      {text: 'Cancelar', style: 'cancel'},
    ]);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Limpar Cache',
      'Isso irá remover todos os dados temporários. Continuar?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            dispatch(appActions.clearCache());
            Alert.alert('Sucesso', 'Cache limpo com sucesso!');
          },
        },
      ],
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Redefinir Configurações',
      'Isso irá restaurar todas as configurações para os valores padrão. Continuar?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Redefinir',
          style: 'destructive',
          onPress: () => {
            dispatch(appActions.resetSettings());
            setLocalSettings({
              darkMode: false,
              notifications: true,
              pushNotifications: true,
              emailNotifications: false,
              soundEnabled: true,
              vibrationEnabled: true,
              autoAnalysis: true,
              saveToGallery: true,
              highQualityRecording: false,
              dataUsage: 'wifi',
            });
            Alert.alert('Sucesso', 'Configurações redefinidas!');
          },
        },
      ],
    );
  };

  const getDataUsageLabel = () => {
    switch (localSettings.dataUsage) {
      case 'wifi':
        return 'Apenas Wi-Fi';
      case 'cellular':
        return 'Apenas Dados Móveis';
      case 'both':
        return 'Wi-Fi e Dados Móveis';
      default:
        return 'Apenas Wi-Fi';
    }
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'pt':
        return 'Português';
      case 'en':
        return 'English';
      case 'es':
        return 'Español';
      default:
        return 'Português';
    }
  };

  const SettingRow: React.FC<{
    title: string;
    subtitle?: string;
    value?: boolean;
    onToggle?: (value: boolean) => void;
    onPress?: () => void;
    rightText?: string;
    showArrow?: boolean;
  }> = ({
    title,
    subtitle,
    value,
    onToggle,
    onPress,
    rightText,
    showArrow = false,
  }) => (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress && !onToggle}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.settingRight}>
        {rightText && <Text style={styles.settingRightText}>{rightText}</Text>}
        {onToggle && value !== undefined && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor={
              value ? theme.colors.background : theme.colors.textSecondary
            }
          />
        )}
        {showArrow && <Text style={styles.arrow}>›</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Header
        title="Configurações"
        leftIcon="arrow-left"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Aparência */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>

          <SettingRow
            title="Modo Escuro"
            subtitle="Usar tema escuro no aplicativo"
            value={localSettings.darkMode}
            onToggle={value => handleToggle('darkMode', value)}
          />

          <SettingRow
            title="Idioma"
            subtitle="Idioma do aplicativo"
            rightText={getLanguageLabel()}
            onPress={handleLanguageChange}
            showArrow
          />
        </Card>

        {/* Notificações */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>

          <SettingRow
            title="Notificações"
            subtitle="Receber notificações do aplicativo"
            value={localSettings.notifications}
            onToggle={value => handleToggle('notifications', value)}
          />

          <SettingRow
            title="Notificações Push"
            subtitle="Receber notificações push"
            value={localSettings.pushNotifications}
            onToggle={value => handleToggle('pushNotifications', value)}
          />

          <SettingRow
            title="Notificações por Email"
            subtitle="Receber notificações por email"
            value={localSettings.emailNotifications}
            onToggle={value => handleToggle('emailNotifications', value)}
          />

          <SettingRow
            title="Som"
            subtitle="Reproduzir som nas notificações"
            value={localSettings.soundEnabled}
            onToggle={value => handleToggle('soundEnabled', value)}
          />

          <SettingRow
            title="Vibração"
            subtitle="Vibrar ao receber notificações"
            value={localSettings.vibrationEnabled}
            onToggle={value => handleToggle('vibrationEnabled', value)}
          />
        </Card>

        {/* Vídeo e Análise */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Vídeo e Análise</Text>

          <SettingRow
            title="Análise Automática"
            subtitle="Iniciar análise automaticamente após gravação"
            value={localSettings.autoAnalysis}
            onToggle={value => handleToggle('autoAnalysis', value)}
          />

          <SettingRow
            title="Salvar na Galeria"
            subtitle="Salvar vídeos na galeria do dispositivo"
            value={localSettings.saveToGallery}
            onToggle={value => handleToggle('saveToGallery', value)}
          />

          <SettingRow
            title="Gravação em Alta Qualidade"
            subtitle="Usar qualidade máxima (usa mais espaço)"
            value={localSettings.highQualityRecording}
            onToggle={value => handleToggle('highQualityRecording', value)}
          />
        </Card>

        {/* Dados e Armazenamento */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Dados e Armazenamento</Text>

          <SettingRow
            title="Uso de Dados"
            subtitle="Quando permitir upload e análise"
            rightText={getDataUsageLabel()}
            onPress={handleDataUsageChange}
            showArrow
          />

          <SettingRow
            title="Limpar Cache"
            subtitle="Remover dados temporários"
            onPress={handleClearCache}
            showArrow
          />
        </Card>

        {/* Ações */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>

          <SettingRow
            title="Redefinir Configurações"
            subtitle="Restaurar configurações padrão"
            onPress={handleResetSettings}
            showArrow
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TechRun v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Desenvolvido com ❤️ para atletas
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  arrow: {
    color: theme.colors.textSecondary,
    fontSize: 20,
    marginLeft: theme.spacing.sm,
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  footerSubtext: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.md,
    padding: 0,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingRight: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  settingRightText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginRight: theme.spacing.sm,
  },
  settingRow: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  settingSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  settingTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
});

export default SettingsScreen;
