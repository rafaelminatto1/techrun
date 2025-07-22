import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Button, Card} from '@components/base';
import {LoadingSpinner, EmptyState, Header} from '@components/common';
import {theme} from '@utils/theme';
import {fetchUserStats} from '@store/slices/userSlice';
import {fetchRecentVideos} from '@store/slices/videoSlice';
import {fetchRecentAnalyses} from '@store/slices/analysisSlice';
import {RootState, AppDispatch} from '@store/index';
import type {HomeStackParamList} from '@types/index';

type HomeScreenProps = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    user,
    stats,
    loading: userLoading,
  } = useSelector((state: RootState) => state.user);
  const {recentVideos, loading: videoLoading} = useSelector(
    (state: RootState) => state.video,
  );
  const {recentAnalyses, loading: analysisLoading} = useSelector(
    (state: RootState) => state.analysis,

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        dispatch(fetchUserStats()),
        dispatch(fetchRecentVideos({limit: 5})),
        dispatch(fetchRecentAnalyses({limit: 5})),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
    setRefreshing(false);
  };

  const navigateToCamera = () => {
    navigation.navigate('Camera', {screen: 'CameraCapture'});
  };

  const navigateToVideos = () => {
    navigation.navigate('Videos');
  };

  const navigateToAnalyses = () => {
    navigation.navigate('Analysis', {screen: 'AnalysisList'});
  };

  const navigateToReports = () => {
    navigation.navigate('Reports', {screen: 'ReportsList'});
  };

  const renderWelcomeSection = () => {
    const greeting = getGreeting();
    const userName = user?.name?.split(' ')[0] || 'Usuário';

    return (
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.userName}>{userName}! 👋</Text>
        <Text style={styles.welcomeSubtitle}>
          Pronto para analisar seus exercícios hoje?
        </Text>
      </View>
    );
  };

  const renderStatsSection = () => {
    if (userLoading || !stats) {
      return <LoadingSpinner size='small' />;
    }

    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Suas Estatísticas</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard} padding='medium'>
            <Text style={styles.statNumber}>{stats.totalVideos}</Text>
            <Text style={styles.statLabel}>Vídeos</Text>
          </Card>

          <Card style={styles.statCard} padding='medium'>
            <Text style={styles.statNumber}>{stats.totalAnalyses}</Text>
            <Text style={styles.statLabel}>Análises</Text>
          </Card>

          <Card style={styles.statCard} padding='medium'>
            <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Treinos</Text>
          </Card>

          <Card style={styles.statCard} padding='medium'>
            <Text style={styles.statNumber}>
              {stats.averageScore?.toFixed(1) || '0.0'}
            </Text>
            <Text style={styles.statLabel}>Pontuação</Text>
          </Card>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => {
    return (
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToCamera}
            testID='quick-action-camera'>
            <Text style={styles.actionIcon}>📹</Text>
            <Text style={styles.actionTitle}>Gravar Vídeo</Text>
            <Text style={styles.actionSubtitle}>Capture seu exercício</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToVideos}
            testID='quick-action-videos'>
            <Text style={styles.actionIcon}>🎬</Text>
            <Text style={styles.actionTitle}>Meus Vídeos</Text>
            <Text style={styles.actionSubtitle}>Ver biblioteca</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToAnalyses}
            testID='quick-action-analyses'>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionTitle}>Análises</Text>
            <Text style={styles.actionSubtitle}>Ver resultados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={navigateToReports}
            testID='quick-action-reports'>
            <Text style={styles.actionIcon}>📈</Text>
            <Text style={styles.actionTitle}>Relatórios</Text>
            <Text style={styles.actionSubtitle}>Acompanhar progresso</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRecentActivity = () => {
    const hasRecentVideos = recentVideos && recentVideos.length > 0;
    const hasRecentAnalyses = recentAnalyses && recentAnalyses.length > 0;

    if (!hasRecentVideos && !hasRecentAnalyses) {
      return (
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <EmptyState
            icon='🎯'
            title='Nenhuma atividade ainda'
            description='Comece gravando seu primeiro vídeo de exercício!'
            actionText='Gravar Vídeo'
            onAction={navigateToCamera}
          />
        </View>
      );
    }

    return (
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <Button
            title='Ver tudo'
            variant='ghost'
            onPress={navigateToVideos}
            testID='view-all-activity'
          />
        </View>

        {hasRecentVideos && (
          <View style={styles.recentVideos}>
            <Text style={styles.subsectionTitle}>Vídeos Recentes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentVideos.map(video => (
                <Card
                  key={video.id}
                  style={styles.recentVideoCard}
                  padding='medium'
                  onPress={() =>
                    navigation.navigate('VideoDetails', {videoId: video.id})
                  }>
                  <View style={styles.videoThumbnail}>
                    <Text style={styles.videoIcon}>🎬</Text>
                  </View>
                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {video.metadata?.title || 'Vídeo sem título'}
                  </Text>
                  <Text style={styles.videoDate}>
                    {new Date(video.createdAt).toLocaleDateString('pt-BR')}
                  </Text>
                </Card>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) {return 'Bom dia';}
    if (hour < 18) {return 'Boa tarde';}
    return 'Boa noite';
  };

  const isLoading = userLoading || videoLoading || analysisLoading;

  return (
    <View style={styles.container}>
      <Header
        title='FitAnalyzer Pro'
        rightIcon={<Text style={styles.profileIcon}>👤</Text>}
        onRightPress={() =>
          navigation.navigate('Profile', {screen: 'ProfileMain'})
        }
        testID='home-header'
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        testID='home-scroll-view'>
        {renderWelcomeSection()}
        {renderStatsSection()}
        {renderQuickActions()}
        {renderRecentActivity()}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToCamera}
        testID='fab-camera'>
        <Text style={styles.fabIcon}>📹</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  actionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.small,
  },
  
  actionSubtitle: {
    fontSize: theme.typography.fontSize.small,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  actionTitle: {
    fontSize: theme.typography.fontSize.medium,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xsmall,
    textAlign: 'center',
  },
  
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.medium,
  },
  
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  fab: {
    position: 'absolute',
    bottom: theme.spacing.large,
    right: theme.spacing.large,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  
  fabIcon: {
    fontSize: 24,
  },
  
  greeting: {
    fontSize: theme.typography.fontSize.large,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.white,
  },
  
  profileIcon: {
    fontSize: 24,
  },
  
  quickActionsSection: {
    padding: theme.spacing.large,
    paddingTop: 0,
  },
  
  recentSection: {
    padding: theme.spacing.large,
    paddingTop: 0,
  },
  
  recentVideoCard: {
    width: 150,
    marginRight: theme.spacing.medium,
  },
  
  recentVideos: {
    marginBottom: theme.spacing.large,
  },
  
  scrollContent: {
    paddingBottom: 100, // Space for FAB
  },
  
  scrollView: {
    flex: 1,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  
  sectionTitle: {
    fontSize: theme.typography.fontSize.large,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium,
  },
  
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  
  statLabel: {
    fontSize: theme.typography.fontSize.small,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  statNumber: {
    fontSize: theme.typography.fontSize.xlarge,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xsmall,
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.medium,
  },
  
  statsSection: {
    padding: theme.spacing.large,
  },
  
  subsectionTitle: {
    fontSize: theme.typography.fontSize.medium,
    fontFamily: theme.typography.fontFamily.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small,
  },
  
  userName: {
    fontSize: theme.typography.fontSize.xxlarge,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.small,
  },
  
  videoDate: {
    fontSize: theme.typography.fontSize.xsmall,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
  },
  
  videoIcon: {
    fontSize: 24,
  },
  
  videoThumbnail: {
    height: 80,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.borderRadius.small,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  
  videoTitle: {
    fontSize: theme.typography.fontSize.small,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xsmall,
  },
  
  welcomeSection: {
    padding: theme.spacing.large,
    backgroundColor: theme.colors.primary,
  },
  
  welcomeSubtitle: {
    fontSize: theme.typography.fontSize.medium,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.white,
    opacity: 0.9,
  },
});

export default HomeScreen;
