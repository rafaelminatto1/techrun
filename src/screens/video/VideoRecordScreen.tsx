import React, {useState, useRef, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
  CameraPermissionStatus,
} from 'react-native-vision-camera';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useAppDispatch, useAppSelector} from '@store/index';
import {videoActions} from '@store/index';
import {useVideo} from '@hooks/useVideo';
import {poseAnalysisService, ExerciseMetrics} from '@services/poseAnalysis';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// Components
import {Header, LoadingSpinner, Button} from '@components/index';

// Utils
import {theme} from '@utils/theme';

const {width, height} = Dimensions.get('window');

interface VideoRecordScreenProps {}

const VideoRecordScreen: React.FC<VideoRecordScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const dispatch = useAppDispatch();

  const {uploading} = useAppSelector(state => state.video);
  const {analyzeVideo} = useVideo();

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraPermission, setCameraPermission] =
    useState<CameraPermissionStatus>('not-determined');
  const [microphonePermission, setMicrophonePermission] =
    useState<CameraPermissionStatus>('not-determined');
  const [selectedExercise, setSelectedExercise] = useState('general');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.back;

  const recordButtonScale = useSharedValue(1);
  const recordButtonOpacity = useSharedValue(1);

  // Timer para gravação
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkPermissions();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const checkPermissions = async () => {
    const cameraPermissionStatus = await Camera.getCameraPermissionStatus();
    const microphonePermissionStatus =
      await Camera.getMicrophonePermissionStatus();

    setCameraPermission(cameraPermissionStatus);
    setMicrophonePermission(microphonePermissionStatus);

    if (cameraPermissionStatus !== 'authorized') {
      const newCameraPermission = await Camera.requestCameraPermission();

      setCameraPermission(newCameraPermission);
    }

    if (microphonePermissionStatus !== 'authorized') {
      const newMicrophonePermission =
        await Camera.requestMicrophonePermission();

      setMicrophonePermission(newMicrophonePermission);
    }
  };

  const startRecording = useCallback(async () => {
    if (!camera.current || !device) {
      return;
    }

    try {
      setIsRecording(true);
      setRecordingTime(0);

      // Animação do botão
      recordButtonScale.value = withSpring(1.2);
      recordButtonOpacity.value = withTiming(0.8);

      // Iniciar timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      await camera.current.startRecording({
        flash: 'off',
        onRecordingFinished: video => {
          console.log('Video recorded:', video);
          handleVideoRecorded(video.path);
        },
        onRecordingError: error => {
          console.error('Recording error:', error);
          Alert.alert('Erro', 'Falha ao gravar vídeo');
          stopRecording();
        },
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a gravação');
      setIsRecording(false);
    }
  }, [device]);

  const stopRecording = useCallback(async () => {
    if (!camera.current) {
      return;
    }

    try {
      await camera.current.stopRecording();
      setIsRecording(false);

      // Parar timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Resetar animação do botão
      recordButtonScale.value = withSpring(1);
      recordButtonOpacity.value = withTiming(1);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }, []);

  const handleVideoRecorded = async (videoPath: string) => {
    try {
      console.log('Video path:', videoPath);

      Alert.alert(
        'Vídeo Gravado',
        'Vídeo gravado com sucesso! Deseja analisar agora?',
        [
          {text: 'Cancelar', style: 'cancel'},
          {
            text: 'Analisar',
            onPress: () => handleAnalyzeVideo(videoPath),
          },
          {
            text: 'Salvar',
            onPress: () => saveVideo(videoPath),
          },
        ],
      );
    } catch (error) {
      console.error('Error handling recorded video:', error);
      Alert.alert('Erro', 'Falha ao processar vídeo gravado');
    }
  };

  const handleAnalyzeVideo = async (videoPath: string) => {
    try {
      setIsAnalyzing(true);
      const metrics = await analyzeVideo(videoPath, selectedExercise);

      Alert.alert(
        'Análise Concluída',
        `Repetições: ${metrics.repetitions}\nPontuação: ${metrics.form_score}/100\nDuração: ${metrics.duration}s\nCalorias: ${metrics.calories_burned}`,
        [
          {
            text: 'Salvar Resultado',
            onPress: () => saveVideo(videoPath, metrics),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ],
      );
    } catch (error) {
      console.error('Error analyzing video:', error);
      Alert.alert('Erro', 'Falha ao analisar o vídeo');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveVideo = async (
    videoPath: string,
    analysisMetrics?: ExerciseMetrics,
  ) => {
    try {
      const videoData = {
        uri: videoPath,
        exerciseType: selectedExercise as const,
        metadata: {
          duration: recordingTime,
          timestamp: new Date().toISOString(),
          analysis: analysisMetrics,
        },
      };

      await dispatch(videoActions.uploadVideo(videoData));
      navigation.goBack();
    } catch (error) {
      console.error('Save video failed:', error);
      Alert.alert('Erro', 'Não foi possível salvar o vídeo.');
    }
  };

  const recordButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: recordButtonScale.value}],
      opacity: recordButtonOpacity.value,
    };
  });

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  if (
    cameraPermission !== 'authorized' ||
    microphonePermission !== 'authorized'
  ) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Permissões Necessárias</Text>
        <Text style={styles.permissionText}>
          Para gravar vídeos, precisamos de acesso à câmera e microfone.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={checkPermissions}>
          <Text style={styles.permissionButtonText}>Conceder Permissões</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Câmera não disponível</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      <Camera
        ref={camera}
        style={styles.camera}
        device={device}
        isActive={true}
        video={true}
        audio={true}
        enableZoomGesture={true}
      />

      {/* Overlay com informações */}
      <View style={styles.overlay}>
        {/* Header com timer */}
        <View style={styles.header}>
          <View style={styles.timerContainer}>
            <View
              style={[
                styles.recordingDot,
                isRecording && styles.recordingDotActive,
              ]}
            />
            <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
          </View>
        </View>

        {/* Guias de posicionamento */}
        <View style={styles.guidesContainer}>
          <View style={styles.centerGuide} />
          <Text style={styles.guideText}>Posicione-se no centro da tela</Text>
        </View>

        {/* Seletor de exercício */}
        <View style={styles.exerciseSelector}>
          <Text style={styles.exerciseLabel}>Tipo de Exercício:</Text>
          <View style={styles.exerciseButtons}>
            {['general', 'squat', 'pushup', 'plank'].map(exercise => (
              <TouchableOpacity
                key={exercise}
                style={[
                  styles.exerciseButton,
                  selectedExercise === exercise && styles.exerciseButtonActive,
                ]}
                onPress={() => setSelectedExercise(exercise)}>
                <Text
                  style={[
                    styles.exerciseButtonText,
                    selectedExercise === exercise &&
                      styles.exerciseButtonTextActive,
                  ]}>
                  {exercise === 'general'
                    ? 'Geral'
                    : exercise === 'squat'
                    ? 'Agachamento'
                    : exercise === 'pushup'
                    ? 'Flexão'
                    : 'Prancha'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Controles de gravação */}
        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            <View style={styles.placeholder} />

            <Animated.View style={recordButtonAnimatedStyle}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.8}>
                <View
                  style={[
                    styles.recordButtonInner,
                    isRecording && styles.recordButtonInnerActive,
                  ]}
                />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.placeholder} />
          </View>
        </View>
      </View>

      {(uploading || isAnalyzing) && (
        <View style={styles.uploadingOverlay}>
          <LoadingSpinner />
          <Text style={styles.uploadingText}>
            {isAnalyzing ? 'Analisando vídeo...' : 'Salvando vídeo...'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  camera: {
    flex: 1,
  },
  centerGuide: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 2,
    height: 300,
    width: 200,
  },
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  controls: {
    paddingBottom: 50,
    paddingHorizontal: theme.spacing.lg,
  },
  controlsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: theme.colors.status.error,
    fontSize: theme.typography.sizes.lg,
    textAlign: 'center',
  },
  exerciseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    borderWidth: 1,
    marginHorizontal: 2,
    marginVertical: 2,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  exerciseButtonActive: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
  exerciseButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.medium,
    textAlign: 'center',
  },
  exerciseButtonTextActive: {
    fontWeight: theme.typography.weights.bold,
  },
  exerciseButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  exerciseLabel: {
    color: 'white',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  exerciseSelector: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    marginHorizontal: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  guideText: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    color: 'white',
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    textAlign: 'center',
  },
  guidesContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 60,
  },
  overlay: {
    bottom: 0,
    justifyContent: 'space-between',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  permissionContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  permissionText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.sizes.md,
    lineHeight: theme.typography.lineHeights.relaxed,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  permissionTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  placeholder: {
    width: 60,
  },
  recordButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'white',
    borderRadius: 40,
    borderWidth: 4,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255, 68, 68, 0.3)',
    borderColor: '#ff4444',
  },
  recordButtonInner: {
    backgroundColor: 'white',
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  recordButtonInnerActive: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    height: 30,
    width: 30,
  },
  recordingDot: {
    backgroundColor: 'gray',
    borderRadius: 4,
    height: 8,
    marginRight: theme.spacing.sm,
    width: 8,
  },
  recordingDotActive: {
    backgroundColor: '#ff4444',
  },
  timerContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  timerText: {
    color: 'white',
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  uploadingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  uploadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: theme.spacing.md,
  },
});

export default VideoRecordScreen;
