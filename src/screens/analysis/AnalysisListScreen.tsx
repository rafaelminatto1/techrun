import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {RootState} from '@store/index';
import {fetchAnalyses, deleteAnalysis} from '@store/slices/analysisSlice';
import {Button, Card} from '@components/base';
import {LoadingSpinner, EmptyState, Header} from '@components/common';
import {theme} from '@utils/theme';
import {Analysis, AnalysisListScreenProps} from '@types/index';

const AnalysisListScreen: React.FC<AnalysisListScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch();
  const {analyses, loading, error} = useSelector(
    (state: RootState) => state.analysis,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<
    'all' | 'completed' | 'processing' | 'failed'
  >('all');

  useFocusEffect(
    useCallback(() => {
      loadAnalyses();
    }, []),
  );

  const loadAnalyses = async () => {
    try {
      await dispatch(fetchAnalyses()).unwrap();
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalyses();
    setRefreshing(false);
  };

  const handleAnalysisPress = (analysis: Analysis) => {
    navigation.navigate('AnalysisDetail', {analysisId: analysis.id});
  };

  const handleDeleteAnalysis = (analysisId: string) => {
    Alert.alert(
      'Excluir Análise',
      'Tem certeza que deseja excluir esta análise?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteAnalysis(analysisId)).unwrap();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a análise');
            }
          },
        },
      ],
    );
  };

  const getFilteredAnalyses = () => {
    if (filter === 'all') {
      return analyses;
    }

    return analyses.filter(analysis => analysis.status === filter);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success;
      case 'processing':
        return theme.colors.warning;
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'processing':
        return 'Processando';
      case 'failed':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) {
      return theme.colors.success;
    }
    if (score >= 60) {
      return theme.colors.warning;
    }

    return theme.colors.error;
  };

  const renderFilterButtons = () => {
    const filters = [
      {key: 'all', label: 'Todas'},
      {key: 'completed', label: 'Concluídas'},
      {key: 'processing', label: 'Processando'},
      {key: 'failed', label: 'Falharam'},
    ];

    return (
      <View style={styles.filterContainer}>
        {filters.map(filterOption => (
          <TouchableOpacity
            key={filterOption.key}
            style={[
              styles.filterButton,
              filter === filterOption.key && styles.activeFilterButton,
            ]}
            onPress={() => setFilter(filterOption.key as any)}>
            <Text
              style={[
                styles.filterButtonText,
                filter === filterOption.key && styles.activeFilterButtonText,
              ]}>
              {filterOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderAnalysisCard = ({item: analysis}: {item: Analysis}) => {
    return (
      <TouchableOpacity
        style={styles.analysisCard}
        onPress={() => handleAnalysisPress(analysis)}
        testID={`analysis-card-${analysis.id}`}>
        <Card variant="outlined" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.analysisTitle} numberOfLines={2}>
                {analysis.videoTitle || 'Análise sem título'}
              </Text>

              <View style={styles.statusContainer}>
                <Icon
                  name={
                    analysis.status === 'completed'
                      ? 'check-circle'
                      : analysis.status === 'processing'
                      ? 'hourglass-empty'
                      : 'error'
                  }
                  size={16}
                  color={getStatusColor(analysis.status)}
                />
                <Text
                  style={[
                    styles.statusText,
                    {color: getStatusColor(analysis.status)},
                  ]}>
                  {getStatusText(analysis.status)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteAnalysis(analysis.id)}>
              <Icon
                name="delete"
                size={20}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {analysis.status === 'completed' && (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>Pontuação Geral:</Text>
              <Text
                style={[
                  styles.scoreValue,
                  {color: getScoreColor(analysis.overallScore)},
                ]}>
                {analysis.overallScore}/100
              </Text>
            </View>
          )}

          {analysis.feedback && (
            <Text style={styles.feedback} numberOfLines={3}>
              {analysis.feedback}
            </Text>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.dateContainer}>
              <Icon
                name="schedule"
                size={14}
                color={theme.colors.text.secondary}
              />
              <Text style={styles.dateText}>
                {new Date(analysis.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </View>

            {analysis.status === 'completed' && (
              <View style={styles.metricsContainer}>
                <Text style={styles.metricsText}>
                  {Object.keys(analysis.metrics || {}).length} métricas
                </Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const filteredAnalyses = getFilteredAnalyses();

  if (loading && analyses.length === 0) {
    return (
      <View style={styles.container}>
        <Header title="Análises" />
        <LoadingSpinner size="large" text="Carregando análises..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Análises"
        subtitle={`${filteredAnalyses.length} análise(s)`}
        rightIcon="analytics"
        onRightPress={() => navigation.navigate('AnalyticsOverview')}
      />

      {renderFilterButtons()}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Tentar Novamente"
            variant="outline"
            size="small"
            onPress={loadAnalyses}
          />
        </View>
      )}

      {filteredAnalyses.length === 0 && !loading ? (
        <EmptyState
          icon="analytics"
          title="Nenhuma análise encontrada"
          description={
            filter === 'all'
              ? 'Grave um vídeo e inicie uma análise para começar'
              : `Nenhuma análise ${getStatusText(
                  filter,
                ).toLowerCase()} encontrada`
          }
          actionText={filter === 'all' ? 'Gravar Vídeo' : 'Ver Todas'}
          onAction={() => {
            if (filter === 'all') {
              navigation.navigate('VideoRecord');
            } else {
              setFilter('all');
            }
          }}
        />
      ) : (
        <FlatList
          data={filteredAnalyses}
          renderItem={renderAnalysisCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  activeFilterButton: {
    backgroundColor: theme.colors.primary,
  },
  activeFilterButtonText: {
    color: theme.colors.text.inverse,
    fontWeight: 'bold',
  },
  analysisCard: {
    marginBottom: theme.spacing.md,
  },
  analysisTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    marginBottom: theme.spacing.xs,
  },
  card: {
    padding: theme.spacing.md,
  },
  cardFooter: {
    alignItems: 'center',
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.sm,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    flex: 1,
  },
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  dateText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    marginLeft: theme.spacing.xs,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  errorContainer: {
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.body2.fontSize,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  feedback: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  filterButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
  },
  filterButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight,
  },
  filterContainer: {
    backgroundColor: theme.colors.background.secondary,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  metricsContainer: {
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  metricsText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
  },
  scoreContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  scoreLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body2.fontSize,
  },
  scoreValue: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
  },
  statusContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statusText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight,
    marginLeft: theme.spacing.xs,
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
});

export default AnalysisListScreen;
