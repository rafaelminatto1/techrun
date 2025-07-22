import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {LineChart, BarChart} from 'react-native-chart-kit';

import {RootState} from '@store/index';
import {fetchAnalysisById, deleteAnalysis} from '@store/slices/analysisSlice';
import {Button, Card} from '@components/base';
import {LoadingSpinner, Header} from '@components/common';
import {theme} from '@utils/theme';
import {AnalysisDetailScreenProps} from '@types/index';

const {width} = Dimensions.get('window');
const CHART_WIDTH = width - theme.spacing.lg * 2;

const AnalysisDetailScreen: React.FC<AnalysisDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const {analysisId} = route.params;
  const dispatch = useDispatch();
  const {currentAnalysis, loading} = useSelector(
    (state: RootState) => state.analysis,
  );
  const [activeTab, setActiveTab] = useState<
    'overview' | 'metrics' | 'recommendations'
  >('overview');

  useFocusEffect(
    useCallback(() => {
      loadAnalysisData();
    }, [analysisId]),
  );

  const loadAnalysisData = async () => {
    try {
      await dispatch(fetchAnalysisById(analysisId)).unwrap();
    } catch (error) {
      console.error('Erro ao carregar análise:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Análise',
      'Tem certeza que deseja excluir esta análise? Esta ação não pode ser desfeita.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteAnalysis(analysisId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a análise');
            }
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    if (!currentAnalysis) {
      return;
    }

    try {
      const shareContent = `Análise de Exercício - Pontuação: ${currentAnalysis.overallScore}/100\n\n${currentAnalysis.feedback}`;

      await Share.share({
        message: shareContent,
        title: 'Análise FitAnalyzer Pro',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
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

  const getScoreGrade = (score: number) => {
    if (score >= 90) {
      return 'A+';
    }
    if (score >= 80) {
      return 'A';
    }
    if (score >= 70) {
      return 'B';
    }
    if (score >= 60) {
      return 'C';
    }

    return 'D';
  };

  const renderTabButtons = () => {
    const tabs = [
      {key: 'overview', label: 'Visão Geral', icon: 'dashboard'},
      {key: 'metrics', label: 'Métricas', icon: 'analytics'},
      {key: 'recommendations', label: 'Dicas', icon: 'lightbulb'},
    ];

    return (
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.key as any)}>
            <Icon
              name={tab.icon}
              size={20}
              color={
                activeTab === tab.key
                  ? theme.colors.primary
                  : theme.colors.text.secondary
              }
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.activeTabButtonText,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderOverviewTab = () => {
    if (!currentAnalysis) {
      return null;
    }

    return (
      <View style={styles.tabContent}>
        {/* Score Card */}
        <Card style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreTitle}>Pontuação Geral</Text>
            <View style={styles.scoreContainer}>
              <Text
                style={[
                  styles.scoreValue,
                  {color: getScoreColor(currentAnalysis.overallScore)},
                ]}>
                {currentAnalysis.overallScore}
              </Text>
              <Text style={styles.scoreMax}>/100</Text>
              <View style={styles.gradeContainer}>
                <Text
                  style={[
                    styles.gradeText,
                    {color: getScoreColor(currentAnalysis.overallScore)},
                  ]}>
                  {getScoreGrade(currentAnalysis.overallScore)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${currentAnalysis.overallScore}%`,
                    backgroundColor: getScoreColor(
                      currentAnalysis.overallScore,
                    ),
                  },
                ]}
              />
            </View>
          </View>
        </Card>

        {/* Feedback Card */}
        {currentAnalysis.feedback && (
          <Card style={styles.feedbackCard}>
            <View style={styles.cardHeader}>
              <Icon name="feedback" size={24} color={theme.colors.primary} />
              <Text style={styles.cardTitle}>Feedback da Análise</Text>
            </View>
            <Text style={styles.feedbackText}>{currentAnalysis.feedback}</Text>
          </Card>
        )}

        {/* Quick Metrics */}
        {currentAnalysis.metrics && (
          <Card style={styles.quickMetricsCard}>
            <Text style={styles.cardTitle}>Métricas Principais</Text>
            <View style={styles.metricsGrid}>
              {Object.entries(currentAnalysis.metrics)
                .slice(0, 4)
                .map(([key, value]) => (
                  <View key={key} style={styles.metricItem}>
                    <Text style={styles.metricValue}>{value}</Text>
                    <Text style={styles.metricLabel}>{key}</Text>
                  </View>
                ))}
            </View>
          </Card>
        )}

        {/* Analysis Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>Informações da Análise</Text>

          <View style={styles.infoRow}>
            <Icon
              name="videocam"
              size={16}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.infoLabel}>Vídeo:</Text>
            <Text style={styles.infoValue}>
              {currentAnalysis.videoTitle || 'Sem título'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon
              name="schedule"
              size={16}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.infoLabel}>Analisado em:</Text>
            <Text style={styles.infoValue}>
              {new Date(currentAnalysis.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="timer" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.infoLabel}>Duração:</Text>
            <Text style={styles.infoValue}>
              {currentAnalysis.processingTime
                ? `${currentAnalysis.processingTime}s`
                : 'N/A'}
            </Text>
          </View>
        </Card>
      </View>
    );
  };

  const renderMetricsTab = () => {
    if (!currentAnalysis?.metrics) {
      return null;
    }

    const metricsData = Object.entries(currentAnalysis.metrics);

    // Prepare chart data
    const chartData = {
      labels: metricsData.slice(0, 6).map(([key]) => key.substring(0, 8)),
      datasets: [
        {
          data: metricsData
            .slice(0, 6)
            .map(([, value]) => parseFloat(value.toString()) || 0),
          color: (opacity = 1) =>
            `rgba(${theme.colors.primary
              .replace('#', '')
              .match(/.{2}/g)
              ?.map(x => parseInt(x, 16))
              .join(', ')}, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };

    const barChartData = {
      labels: metricsData.slice(0, 5).map(([key]) => key.substring(0, 6)),
      datasets: [
        {
          data: metricsData
            .slice(0, 5)
            .map(([, value]) => parseFloat(value.toString()) || 0),
        },
      ],
    };

    return (
      <View style={styles.tabContent}>
        {/* Metrics Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Gráfico de Métricas</Text>
          <LineChart
            data={chartData}
            width={CHART_WIDTH - 32}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.background.primary,
              backgroundGradientFrom: theme.colors.background.primary,
              backgroundGradientTo: theme.colors.background.secondary,
              decimalPlaces: 1,
              color: (opacity = 1) =>
                `rgba(${theme.colors.primary
                  .replace('#', '')
                  .match(/.{2}/g)
                  ?.map(x => parseInt(x, 16))
                  .join(', ')}, ${opacity})`,
              labelColor: (opacity = 1) =>
                `rgba(${theme.colors.text.primary
                  .replace('#', '')
                  .match(/.{2}/g)
                  ?.map(x => parseInt(x, 16))
                  .join(', ')}, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            bezier
            style={styles.chart}
          />
        </Card>

        {/* Bar Chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.cardTitle}>Comparativo de Métricas</Text>
          <BarChart
            data={barChartData}
            width={CHART_WIDTH - 32}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.background.primary,
              backgroundGradientFrom: theme.colors.background.primary,
              backgroundGradientTo: theme.colors.background.secondary,
              decimalPlaces: 1,
              color: (opacity = 1) =>
                `rgba(${theme.colors.primary
                  .replace('#', '')
                  .match(/.{2}/g)
                  ?.map(x => parseInt(x, 16))
                  .join(', ')}, ${opacity})`,
              labelColor: (opacity = 1) =>
                `rgba(${theme.colors.text.primary
                  .replace('#', '')
                  .match(/.{2}/g)
                  ?.map(x => parseInt(x, 16))
                  .join(', ')}, ${opacity})`,
            }}
            style={styles.chart}
          />
        </Card>

        {/* Detailed Metrics */}
        <Card style={styles.detailedMetricsCard}>
          <Text style={styles.cardTitle}>Todas as Métricas</Text>
          {metricsData.map(([key, value]) => (
            <View key={key} style={styles.metricRow}>
              <Text style={styles.metricKey}>{key}</Text>
              <Text style={styles.metricRowValue}>{value}</Text>
            </View>
          ))}
        </Card>
      </View>
    );
  };

  const renderRecommendationsTab = () => {
    if (!currentAnalysis?.recommendations) {
      return null;
    }

    return (
      <View style={styles.tabContent}>
        {currentAnalysis.recommendations.map((recommendation, index) => (
          <Card key={index} style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <Icon
                name={
                  recommendation.priority === 'high'
                    ? 'priority-high'
                    : recommendation.priority === 'medium'
                    ? 'remove'
                    : 'low-priority'
                }
                size={20}
                color={
                  recommendation.priority === 'high'
                    ? theme.colors.error
                    : recommendation.priority === 'medium'
                    ? theme.colors.warning
                    : theme.colors.success
                }
              />
              <Text style={styles.recommendationTitle}>
                {recommendation.title}
              </Text>
            </View>

            <Text style={styles.recommendationDescription}>
              {recommendation.description}
            </Text>

            {recommendation.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {recommendation.category}
                </Text>
              </View>
            )}
          </Card>
        ))}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'metrics':
        return renderMetricsTab();
      case 'recommendations':
        return renderRecommendationsTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading || !currentAnalysis) {
    return (
      <View style={styles.container}>
        <Header
          title="Carregando..."
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
        />
        <LoadingSpinner size="large" text="Carregando análise..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Detalhes da Análise"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon="share"
        onRightPress={handleShare}
      />

      {renderTabButtons()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          title="Excluir Análise"
          variant="danger"
          size="small"
          onPress={handleDelete}
          style={styles.deleteButton}
        />

        <Button
          title="Ver Vídeo"
          variant="primary"
          size="small"
          onPress={() =>
            navigation.navigate('VideoDetail', {
              videoId: currentAnalysis.videoId,
            })
          }
          style={styles.videoButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activeTabButton: {
    borderBottomColor: theme.colors.primary,
  },
  activeTabButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  bottomActions: {
    backgroundColor: theme.colors.background.secondary,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: theme.spacing.md,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    marginLeft: theme.spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${theme.colors.primary}20`,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  categoryText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: 'bold',
  },
  chart: {
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.sm,
  },
  chartCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  detailedMetricsCard: {
    marginBottom: theme.spacing.md,
  },
  feedbackCard: {
    marginBottom: theme.spacing.md,
  },
  feedbackText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 22,
  },
  gradeContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    marginLeft: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  gradeText: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
  },
  infoCard: {
    marginBottom: theme.spacing.md,
  },
  infoLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    minWidth: 80,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  infoValue: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: theme.typography.body2.fontSize,
  },
  metricItem: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    width: '48%',
  },
  metricKey: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: theme.typography.body2.fontSize,
  },
  metricLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  metricRow: {
    alignItems: 'center',
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  metricRowValue: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 'bold',
  },
  metricValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  progressBar: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 4,
    height: 8,
    overflow: 'hidden',
  },
  progressBarContainer: {
    width: '100%',
  },
  progressFill: {
    borderRadius: 4,
    height: '100%',
  },
  quickMetricsCard: {
    marginBottom: theme.spacing.md,
  },
  recommendationCard: {
    marginBottom: theme.spacing.md,
  },
  recommendationDescription: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  recommendationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  recommendationTitle: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    marginLeft: theme.spacing.sm,
  },
  scoreCard: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scoreContainer: {
    alignItems: 'baseline',
    flexDirection: 'row',
  },
  scoreHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scoreMax: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.h3.fontSize,
    marginLeft: theme.spacing.xs,
  },
  scoreTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
    marginBottom: theme.spacing.sm,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  tabButton: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  tabButtonText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    marginLeft: theme.spacing.xs,
  },
  tabContainer: {
    backgroundColor: theme.colors.background.secondary,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
  },
  tabContent: {
    padding: theme.spacing.md,
  },
  videoButton: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
});

export default AnalysisDetailScreen;
