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
import Video from 'react-native-video';

import {RootState} from '@store/index';
import {fetchVideoById, deleteVideo} from '@store/slices/videoSlice';
import {fetchAnalysisByVideoId} from '@store/slices/analysisSlice';
import {Button, Card} from '@components/base';
import {LoadingSpinner, Header} from '@components/common';
import {theme} from '@utils/theme';
import {VideoDetailScreenProps} from '@types/index';

const {width, height} = Dimensions.get('window');
const VIDEO_HEIGHT = height * 0.3;

const VideoDetailScreen: React.FC<VideoDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const {videoId} = route.params;
  const dispatch = useDispatch();
  const {currentVideo, loading} = useSelector(
    (state: RootState) => state.video,
  );
  const {analyses} = useSelector((state: RootState) => state.analysis);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const videoAnalysis = analyses.find(analysis => analysis.videoId === videoId);

  useFocusEffect(
    useCallback(() => {
      loadVideoData();
    }, [videoId]),
  );

  const loadVideoData = async () => {
    try {
      await dispatch(fetchVideoById(videoId)).unwrap();
      await dispatch(fetchAnalysisByVideoId(videoId)).unwrap();
    } catch (error) {
      console.error('Erro ao carregar dados do vídeo:', error);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Vídeo',
      'Tem certeza que deseja excluir este vídeo? Esta ação não pode ser desfeita.',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteVideo(videoId)).unwrap();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o vídeo');
            }
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    if (!currentVideo) {
      return;
    }

    try {
      await Share.share({
        message: `Confira meu vídeo de treino: ${currentVideo.title}`,
        url: currentVideo.fileUrl,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const handleAnalyze = () => {
    navigation.navigate('VideoAnalysis', {videoId});
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);

    return `${mb.toFixed(1)} MB`;
  };

  const getAnalysisStatusColor = (status: string) => {
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

  const getAnalysisStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Análise Concluída';
      case 'processing':
        return 'Processando...';
      case 'failed':
        return 'Falha na Análise';
      default:
        return 'Não Analisado';
    }
  };

  const renderVideoPlayer = () => {
    if (!currentVideo) {
      return null;
    }

    return (
      <View style={styles.videoContainer}>
        <TouchableOpacity
          style={styles.videoWrapper}
          onPress={() => setShowControls(!showControls)}
          activeOpacity={1}>
          <Video
            source={{uri: currentVideo.fileUrl}}
            style={styles.video}
            paused={!isPlaying}
            onLoad={data => setDuration(data.duration)}
            onProgress={data => setCurrentTime(data.currentTime)}
            onEnd={() => setIsPlaying(false)}
            resizeMode="contain"
          />

          {showControls && (
            <View style={styles.videoControls}>
              <TouchableOpacity
                style={styles.playButton}
                onPress={handlePlayPause}>
                <Icon
                  name={isPlaying ? 'pause' : 'play-arrow'}
                  size={48}
                  color={theme.colors.text.inverse}
                />
              </TouchableOpacity>

              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {width: `${(currentTime / duration) * 100}%`},
                    ]}
                  />
                </View>

                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderVideoInfo = () => {
    if (!currentVideo) {
      return null;
    }

    return (
      <Card style={styles.infoCard}>
        <View style={styles.titleContainer}>
          <Text style={styles.videoTitle}>
            {currentVideo.title || 'Vídeo sem título'}
          </Text>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
              <Icon
                name="share"
                size={24}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
              <Icon name="delete" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {currentVideo.description && (
          <Text style={styles.description}>{currentVideo.description}</Text>
        )}

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Icon
              name="schedule"
              size={16}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.metaText}>
              Duração: {formatTime(currentVideo.duration)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Icon
              name="storage"
              size={16}
              color={theme.colors.text.secondary}
            />
            <Text style={styles.metaText}>
              Tamanho: {formatFileSize(currentVideo.fileSize)}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Icon name="event" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.metaText}>
              Criado em:{' '}
              {new Date(currentVideo.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderAnalysisInfo = () => {
    return (
      <Card style={styles.analysisCard}>
        <View style={styles.analysisHeader}>
          <Text style={styles.sectionTitle}>Análise do Vídeo</Text>

          {currentVideo?.analysisStatus && (
            <View style={styles.statusBadge}>
              <Icon
                name={
                  currentVideo.analysisStatus === 'completed'
                    ? 'check-circle'
                    : currentVideo.analysisStatus === 'processing'
                    ? 'hourglass-empty'
                    : 'error'
                }
                size={16}
                color={getAnalysisStatusColor(currentVideo.analysisStatus)}
              />
              <Text
                style={[
                  styles.statusText,
                  {color: getAnalysisStatusColor(currentVideo.analysisStatus)},
                ]}>
                {getAnalysisStatusText(currentVideo.analysisStatus)}
              </Text>
            </View>
          )}
        </View>

        {videoAnalysis ? (
          <View style={styles.analysisContent}>
            <Text style={styles.analysisScore}>
              Pontuação: {videoAnalysis.overallScore}/100
            </Text>

            {videoAnalysis.feedback && (
              <Text style={styles.analysisFeedback}>
                {videoAnalysis.feedback}
              </Text>
            )}

            <Button
              title="Ver Análise Completa"
              variant="primary"
              onPress={() =>
                navigation.navigate('AnalysisDetail', {
                  analysisId: videoAnalysis.id,
                })
              }
              style={styles.analysisButton}
            />
          </View>
        ) : (
          <View style={styles.noAnalysisContent}>
            <Text style={styles.noAnalysisText}>
              Este vídeo ainda não foi analisado.
            </Text>

            <Button
              title="Iniciar Análise"
              variant="primary"
              onPress={handleAnalyze}
              style={styles.analysisButton}
              disabled={currentVideo?.analysisStatus === 'processing'}
            />
          </View>
        )}
      </Card>
    );
  };

  if (loading || !currentVideo) {
    return (
      <View style={styles.container}>
        <Header
          title="Carregando..."
          leftIcon="arrow-back"
          onLeftPress={() => navigation.goBack()}
        />
        <LoadingSpinner size="large" text="Carregando vídeo..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={currentVideo.title || 'Detalhes do Vídeo'}
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon="more-vert"
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {renderVideoPlayer()}
        {renderVideoInfo()}
        {renderAnalysisInfo()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
  },
  analysisButton: {
    alignSelf: 'stretch',
  },
  analysisCard: {
    margin: theme.spacing.md,
    marginTop: 0,
  },
  analysisContent: {
    alignItems: 'flex-start',
  },
  analysisFeedback: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  analysisHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  analysisScore: {
    color: theme.colors.primary,
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    marginBottom: theme.spacing.md,
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    flex: 1,
  },
  description: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body1.fontSize,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  iconButton: {
    marginLeft: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
  infoCard: {
    margin: theme.spacing.md,
  },
  metaContainer: {
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingTop: theme.spacing.md,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  metaText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body2.fontSize,
    marginLeft: theme.spacing.sm,
  },
  noAnalysisContent: {
    alignItems: 'center',
  },
  noAnalysisText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.body1.fontSize,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  playButton: {
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  progressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    flex: 1,
    height: 4,
    marginRight: theme.spacing.md,
  },
  progressContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  progressFill: {
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.h4.fontSize,
    fontWeight: theme.typography.h4.fontWeight,
  },
  statusBadge: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight,
    marginLeft: theme.spacing.xs,
  },
  timeContainer: {
    minWidth: 80,
  },
  timeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.caption.fontSize,
    textAlign: 'right',
  },
  titleContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  video: {
    flex: 1,
  },
  videoContainer: {
    backgroundColor: theme.colors.background.tertiary,
    height: VIDEO_HEIGHT,
  },
  videoControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    bottom: 0,
    left: 0,
    padding: theme.spacing.md,
    position: 'absolute',
    right: 0,
  },
  videoTitle: {
    color: theme.colors.text.primary,
    flex: 1,
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight,
    marginRight: theme.spacing.md,
  },
  videoWrapper: {
    flex: 1,
    position: 'relative',
  },
});

export default VideoDetailScreen;
