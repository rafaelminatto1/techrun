import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {RootState} from '@store/index';
import {fetchVideos, deleteVideo} from '@store/slices/videoSlice';
import {Button, Card} from '@components/base';
import {LoadingSpinner, EmptyState, Header} from '@components/common';
import {theme} from '@utils/theme';
import {Video, VideoListScreenProps} from '@types/index';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - theme.spacing.lg * 3) / 2;

const VideoListScreen: React.FC<VideoListScreenProps> = ({navigation}) => {
  const dispatch = useDispatch();
  const {videos, loading, error} = useSelector(
    (state: RootState) => state.video,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadVideos();
    }, []),
  );

  const loadVideos = async () => {
    try {
      await dispatch(fetchVideos()).unwrap();
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  const handleVideoPress = (video: Video) => {
    if (selectionMode) {
      toggleVideoSelection(video.id);
    } else {
      navigation.navigate('VideoDetail', {videoId: video.id});
    }
  };

  const handleVideoLongPress = (video: Video) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedVideos([video.id]);
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => {
      if (prev.includes(videoId)) {
        const newSelection = prev.filter(id => id !== videoId);

        if (newSelection.length === 0) {
          setSelectionMode(false);
        }

        return newSelection;
      } else {
        return [...prev, videoId];
      }
    });
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Excluir Vídeos',
      `Tem certeza que deseja excluir ${selectedVideos.length} vídeo(s)?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const videoId of selectedVideos) {
                await dispatch(deleteVideo(videoId)).unwrap();
              }
              setSelectedVideos([]);
              setSelectionMode(false);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir os vídeos');
            }
          },
        },
      ],
    );
  };

  const handleAnalyzeSelected = () => {
    if (selectedVideos.length === 1) {
      const videoId = selectedVideos[0];

      navigation.navigate('VideoAnalysis', {videoId});
      setSelectedVideos([]);
      setSelectionMode(false);
    } else {
      Alert.alert('Seleção Inválida', 'Selecione apenas um vídeo para análise');
    }
  };

  const cancelSelection = () => {
    setSelectedVideos([]);
    setSelectionMode(false);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);

    return `${mb.toFixed(1)} MB`;
  };

  const renderVideoCard = ({item: video}: {item: Video}) => {
    const isSelected = selectedVideos.includes(video.id);

    return (
      <TouchableOpacity
        style={[styles.videoCard, isSelected && styles.selectedCard]}
        onPress={() => handleVideoPress(video)}
        onLongPress={() => handleVideoLongPress(video)}
        testID={`video-card-${video.id}`}>
        <Card variant="outlined" style={styles.card}>
          <View style={styles.thumbnailContainer}>
            {video.thumbnailUrl ? (
              <Image
                source={{uri: video.thumbnailUrl}}
                style={styles.thumbnail}
              />
            ) : (
              <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                <Icon
                  name="videocam"
                  size={32}
                  color={theme.colors.text.secondary}
                />
              </View>
            )}

            {selectionMode && (
              <View style={styles.selectionOverlay}>
                <Icon
                  name={isSelected ? 'check-circle' : 'radio-button-unchecked'}
                  size={24}
                  color={
                    isSelected
                      ? theme.colors.primary
                      : theme.colors.text.secondary
                  }
                />
              </View>
            )}

            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>
                {formatDuration(video.duration)}
              </Text>
            </View>
          </View>

          <View style={styles.videoInfo}>
            <Text style={styles.videoTitle} numberOfLines={2}>
              {video.title || 'Vídeo sem título'}
            </Text>

            <View style={styles.videoMeta}>
              <Text style={styles.metaText}>
                {new Date(video.createdAt).toLocaleDateString('pt-BR')}
              </Text>
              <Text style={styles.metaText}>
                {formatFileSize(video.fileSize)}
              </Text>
            </View>

            {video.analysisStatus && (
              <View style={styles.statusContainer}>
                <Icon
                  name={
                    video.analysisStatus === 'completed'
                      ? 'check-circle'
                      : video.analysisStatus === 'processing'
                      ? 'hourglass-empty'
                      : 'error'
                  }
                  size={16}
                  color={
                    video.analysisStatus === 'completed'
                      ? theme.colors.success
                      : video.analysisStatus === 'processing'
                      ? theme.colors.warning
                      : theme.colors.error
                  }
                />
                <Text style={styles.statusText}>
                  {video.analysisStatus === 'completed'
                    ? 'Analisado'
                    : video.analysisStatus === 'processing'
                    ? 'Processando'
                    : 'Erro na análise'}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => {
    if (selectionMode) {
      return (
        <Header
          title={`${selectedVideos.length} selecionado(s)`}
          leftIcon="close"
          onLeftPress={cancelSelection}
          rightIcon="more-vert"
          backgroundColor={theme.colors.primary}
          textColor={theme.colors.text.inverse}
        />
      );
    }

    return (
      <Header
        title="Meus Vídeos"
        subtitle={`${videos.length} vídeo(s)`}
        rightIcon="add"
        onRightPress={() => navigation.navigate('VideoRecord')}
      />
    );
  };

  const renderSelectionActions = () => {
    if (!selectionMode) {
      return null;
    }

    return (
      <View style={styles.selectionActions}>
        <Button
          title="Analisar"
          variant="primary"
          size="small"
          onPress={handleAnalyzeSelected}
          disabled={selectedVideos.length !== 1}
          style={styles.actionButton}
        />
        <Button
          title="Excluir"
          variant="danger"
          size="small"
          onPress={handleDeleteSelected}
          style={styles.actionButton}
        />
      </View>
    );
  };

  if (loading && videos.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <LoadingSpinner size="large" text="Carregando vídeos..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Tentar Novamente"
            variant="outline"
            size="small"
            onPress={loadVideos}
          />
        </View>
      )}

      {videos.length === 0 && !loading ? (
        <EmptyState
          icon="videocam"
          title="Nenhum vídeo encontrado"
          description="Grave seu primeiro vídeo para começar a análise"
          actionText="Gravar Vídeo"
          onAction={() => navigation.navigate('VideoRecord')}
        />
      ) : (
        <FlatList
          data={videos}
          renderItem={renderVideoCard}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {renderSelectionActions()}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  card: {
    overflow: 'hidden',
    padding: 0,
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    flex: 1,
  },
  durationBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.sm,
    bottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    position: 'absolute',
    right: theme.spacing.xs,
  },
  durationText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.caption.fontWeight,
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
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  metaText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.caption.fontSize,
  },
  placeholderThumbnail: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    justifyContent: 'center',
  },
  selectedCard: {
    transform: [{scale: 0.95}],
  },
  selectionActions: {
    backgroundColor: theme.colors.background.secondary,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.md,
  },
  selectionOverlay: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: 12,
    padding: 2,
    position: 'absolute',
    right: theme.spacing.xs,
    top: theme.spacing.xs,
  },
  statusContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  statusText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    marginLeft: theme.spacing.xs,
  },
  thumbnail: {
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
    height: '100%',
    width: '100%',
  },
  thumbnailContainer: {
    height: 120,
    position: 'relative',
    width: '100%',
  },
  videoCard: {
    marginBottom: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    width: CARD_WIDTH,
  },
  videoInfo: {
    padding: theme.spacing.sm,
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  videoTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.body2.fontSize,
    fontWeight: theme.typography.body2.fontWeight,
    marginBottom: theme.spacing.xs,
  },
});

export default VideoListScreen;
