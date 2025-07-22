import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '@store/index';
import {selectCurrentUser, selectAuth} from '@store/index';
import {authActions} from '@store/index';

// Components
import {Header, LoadingSpinner, Button, Card} from '@components/index';

// Utils
import {theme} from '@utils/theme';

interface ProfileScreenProps {}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const user = useAppSelector(selectCurrentUser);
  const {loading} = useAppSelector(selectAuth);

  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          dispatch(authActions.logout());
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Navigate to edit profile');
  };

  const handleSettings = () => {
    // Navigate to settings screen
    console.log('Navigate to settings');
  };

  const handleStats = () => {
    // Navigate to stats screen
    console.log('Navigate to stats');
  };

  const handleSubscription = () => {
    // Navigate to subscription screen
    console.log('Navigate to subscription');
  };

  const handleSupport = () => {
    // Navigate to support screen
    console.log('Navigate to support');
  };

  const handleAbout = () => {
    // Navigate to about screen
    console.log('Navigate to about');
  };

  if (loading) {
    return (
      <View style={[styles.container, {paddingTop: insets.top}]}>
        <Header title="Perfil" />
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Header title="Perfil" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              {user?.avatar ? (
                <Image source={{uri: user.avatar}} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
              <Text style={styles.userEmail}>
                {user?.email || 'email@exemplo.com'}
              </Text>
              <Text style={styles.userPlan}>
                {user?.subscription?.plan || 'Plano Gratuito'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfile}>
              <Text style={styles.editButtonText}>Editar</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.stats?.totalVideos || 0}
              </Text>
              <Text style={styles.statLabel}>Vídeos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.stats?.totalAnalyses || 0}
              </Text>
              <Text style={styles.statLabel}>Análises</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.stats?.averageScore || 0}
              </Text>
              <Text style={styles.statLabel}>Pontuação Média</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.viewStatsButton}
            onPress={handleStats}>
            <Text style={styles.viewStatsText}>Ver Estatísticas Completas</Text>
          </TouchableOpacity>
        </Card>

        {/* Menu Options */}
        <Card style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSubscription}>
            <Text style={styles.menuItemText}>Assinatura</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <Text style={styles.menuItemText}>Configurações</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleSupport}>
            <Text style={styles.menuItemText}>Suporte</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleAbout}>
            <Text style={styles.menuItemText}>Sobre o App</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Sair da Conta"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 32,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  editButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    borderColor: theme.colors.error,
    marginTop: theme.spacing.md,
  },
  logoutButtonText: {
    color: theme.colors.error,
  },
  menuCard: {
    marginBottom: theme.spacing.md,
  },
  menuDivider: {
    backgroundColor: theme.colors.border,
    height: 1,
  },
  menuItem: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  menuItemArrow: {
    color: theme.colors.textSecondary,
    fontSize: 20,
  },
  menuItemText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  statValue: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsCard: {
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  userCard: {
    marginBottom: theme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userEmail: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  userInfo: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  userName: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userPlan: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  viewStatsButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  viewStatsText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProfileScreen;
