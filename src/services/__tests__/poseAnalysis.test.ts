// Testes para PoseAnalysisService
import {poseAnalysisService, PoseAnalysisService} from '../poseAnalysis';
import {ExerciseMetrics, PoseAnalysisResult} from '@types/index';

// Mock do FilesetResolver e PoseLandmarker
jest.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: {
    forVisionTasks: jest.fn().mockResolvedValue({}),
  },
  PoseLandmarker: {
    createFromOptions: jest.fn().mockResolvedValue({
      detectForVideo: jest.fn().mockReturnValue({
        landmarks: [
          [
            {x: 100, y: 200, visibility: 0.9},
            {x: 150, y: 220, visibility: 0.8},
            {x: 180, y: 250, visibility: 0.85},
          ],
        ],
        worldLandmarks: [[]],
      }),
    }),
  },
}));

// Mock do global Image
global.Image = jest.fn().mockImplementation(() => ({
  onload: null,
  onerror: null,
  src: '',
  width: 640,
  height: 480,
}));

// Mock do performance.now
global.performance = {
  now: jest.fn(() => Date.now()),
} as any;

describe('PoseAnalysisService', () => {
  let service: PoseAnalysisService;

  beforeEach(() => {
    service = new PoseAnalysisService();
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize MediaPipe successfully', async () => {
      await service.initialize();

      expect(service.isInitialized).toBe(true);
      expect(service.useSimulation).toBe(false);
    });

    it('should fallback to simulation when MediaPipe fails', async () => {
      const {FilesetResolver} = require('@mediapipe/tasks-vision');

      FilesetResolver.forVisionTasks.mockRejectedValueOnce(
        new Error('Network error'),
      );

      await service.initialize();

      expect(service.isInitialized).toBe(true);
      expect(service.useSimulation).toBe(true);
    });
  });

  describe('Frame Analysis', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should analyze frame successfully with MediaPipe', async () => {
      const mockImageUri = 'file://test.jpg';
      const exerciseType = 'squat';

      const result = await service.analyzeFrame(mockImageUri, exerciseType);

      expect(result).not.toBeNull();
      expect(result?.exerciseType).toBe(exerciseType);
      expect(result?.landmarks).toBeDefined();
      expect(result?.confidence).toBeGreaterThan(0);
      expect(result?.score).toBeGreaterThan(0);
      expect(result?.feedback).toBeDefined();
    });

    it('should use simulation when MediaPipe is not available', async () => {
      service.useSimulation = true;

      const mockImageUri = 'file://test.jpg';
      const result = await service.analyzeFrame(mockImageUri, 'pushup');

      expect(result).not.toBeNull();
      expect(result?.landmarks).toBeDefined();
      expect(result?.confidence).toBe(0.8); // Simulation default
    });

    it('should handle invalid image URI gracefully', async () => {
      const result = await service.analyzeFrame('', 'general');

      // Should not throw, but might return null
      expect(result).toBeNull();
    });

    it('should cache analysis results', async () => {
      const mockImageUri = 'file://test.jpg';

      const result1 = await service.analyzeFrame(mockImageUri, 'squat');
      const result2 = await service.analyzeFrame(mockImageUri, 'squat');

      expect(result1).toEqual(result2);
    });

    it('should throttle frame processing', async () => {
      const mockImageUri = 'file://test.jpg';

      const promise1 = service.analyzeFrame(mockImageUri, 'squat');
      const promise2 = service.analyzeFrame(`${mockImageUri  }2`, 'squat');

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).not.toBeNull();
      // Second should be throttled and return null
      expect(result2).toBeNull();
    });
  });

  describe('Exercise-specific Analysis', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should provide squat-specific feedback', async () => {
      const mockImageUri = 'file://test.jpg';
      const result = await service.analyzeFrame(mockImageUri, 'squat');

      expect(result?.exerciseType).toBe('squat');
      expect(result?.feedback).toBeDefined();

      // Should have feedback related to squat form
      const feedbackText = result?.feedback?.join(' ') || '';

      expect(
        feedbackText.includes('joelho') ||
        feedbackText.includes('quadril') ||
          feedbackText.includes('agachamento') ||
          feedbackText.includes('postura'),
      ).toBe(true);
    });

    it('should provide pushup-specific feedback', async () => {
      const mockImageUri = 'file://test.jpg';
      const result = await service.analyzeFrame(mockImageUri, 'pushup');

      expect(result?.exerciseType).toBe('pushup');
      expect(result?.feedback).toBeDefined();

      const feedbackText = result?.feedback?.join(' ') || '';

      expect(
        feedbackText.includes('corpo') ||
        feedbackText.includes('cotovelo') ||
        feedbackText.includes('ombro') ||
          feedbackText.includes('alinhado'),
      ).toBe(true);
    });

    it('should provide plank-specific feedback', async () => {
      const mockImageUri = 'file://test.jpg';
      const result = await service.analyzeFrame(mockImageUri, 'plank');

      expect(result?.exerciseType).toBe('plank');
      expect(result?.feedback).toBeDefined();

      const feedbackText = result?.feedback?.join(' ') || '';

      expect(
        feedbackText.includes('linha') ||
          feedbackText.includes('corpo') ||
          feedbackText.includes('reta') ||
          feedbackText.includes('alinhamento'),
      ).toBe(true);
    });
  });

  describe('Video Analysis', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should analyze video and return metrics', async () => {
      const mockVideoUri = 'file://test-video.mp4';
      const exerciseType = 'squat';

      const metrics = await service.analyzeVideo(mockVideoUri, exerciseType);

      expect(metrics).toBeDefined();
      expect(metrics.repetitions).toBeGreaterThan(0);
      expect(metrics.form_score).toBeGreaterThanOrEqual(0);
      expect(metrics.form_score).toBeLessThanOrEqual(100);
      expect(metrics.duration).toBeGreaterThan(0);
      expect(metrics.calories_burned).toBeGreaterThanOrEqual(0);
      expect(metrics.feedback).toBeDefined();
      expect(Array.isArray(metrics.feedback)).toBe(true);
    });

    it('should detect repetitions correctly for squat', async () => {
      const mockVideoUri = 'file://squat-video.mp4';
      const metrics = await service.analyzeVideo(mockVideoUri, 'squat');

      expect(metrics.repetitions).toBeGreaterThan(0);
      expect(metrics.repetitions).toBeLessThan(50); // Reasonable upper bound
    });

    it('should detect repetitions correctly for pushup', async () => {
      const mockVideoUri = 'file://pushup-video.mp4';
      const metrics = await service.analyzeVideo(mockVideoUri, 'pushup');

      expect(metrics.repetitions).toBeGreaterThan(0);
      expect(metrics.repetitions).toBeLessThan(50);
    });

    it('should return 1 repetition for plank (isometric)', async () => {
      const mockVideoUri = 'file://plank-video.mp4';
      const metrics = await service.analyzeVideo(mockVideoUri, 'plank');

      expect(metrics.repetitions).toBe(1);
    });

    it('should calculate calories based on exercise type', async () => {
      const mockVideoUri = 'file://test-video.mp4';

      const squatMetrics = await service.analyzeVideo(mockVideoUri, 'squat');
      const pushupMetrics = await service.analyzeVideo(mockVideoUri, 'pushup');
      const plankMetrics = await service.analyzeVideo(mockVideoUri, 'plank');

      expect(squatMetrics.calories_burned).toBeGreaterThan(0);
      expect(pushupMetrics.calories_burned).toBeGreaterThan(0);
      expect(plankMetrics.calories_burned).toBeGreaterThan(0);

      // Squat should burn more calories than pushup (higher MET value)
      expect(squatMetrics.calories_burned).toBeGreaterThanOrEqual(
        pushupMetrics.calories_burned,
      );
    });

    it('should handle video analysis errors gracefully', async () => {
      // Mock error in frame analysis
      jest
        .spyOn(service, 'analyzeFrame')
        .mockRejectedValueOnce(new Error('Frame analysis failed'));

      const metrics = await service.analyzeVideo(
        'file://bad-video.mp4',
        'general',

      // Should return fallback metrics
      expect(metrics).toBeDefined();
      expect(metrics.feedback).toContain(
        'Análise processada com método alternativo',
      );
    });
  });

  describe('Utility Methods', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return analysis history', async () => {
      const mockImageUri = 'file://test.jpg';

      await service.analyzeFrame(mockImageUri, 'squat');
      await service.analyzeFrame(`${mockImageUri  }2`, 'pushup');

      const history = service.getAnalysisHistory();

      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should clear history', async () => {
      const mockImageUri = 'file://test.jpg';

      await service.analyzeFrame(mockImageUri, 'squat');
      service.clearHistory();

      const history = service.getAnalysisHistory();

      expect(history.length).toBe(0);
    });

    it('should return supported exercises', () => {
      const supported = service.getSupportedExercises();

      expect(supported).toContain('squat');
      expect(supported).toContain('pushup');
      expect(supported).toContain('plank');
      expect(supported).toContain('general');
    });
  });

  describe('Performance and Edge Cases', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle rapid consecutive calls', async () => {
      const promises = Array.from({length: 10}, (_, i) =>
        service.analyzeFrame(`file://test${i}.jpg`, 'general'),
      );

      const results = await Promise.all(promises);

      // Some should be throttled and return null
      const validResults = results.filter(r => r !== null);

      expect(validResults.length).toBeLessThan(results.length);
    });

    it('should maintain performance with large number of analyses', async () => {
      const start = Date.now();

      const promises = Array.from({length: 5}, (_, i) =>
        service.analyzeFrame(`file://perf-test${i}.jpg`, 'squat'),
      );

      await Promise.all(promises);

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle memory cleanup properly', async () => {
      // Fill up the cache
      const promises = Array.from({length: 15}, (_, i) =>
        service.analyzeFrame(`file://cache-test${i}.jpg`, 'squat'),
      );

      await Promise.all(promises);

      // Cache should be limited to 10 items
      const cacheSize = service.analysisCache.size;

      expect(cacheSize).toBeLessThanOrEqual(10);
    });
  });
});

describe('PoseAnalysisService Integration', () => {
  it('should work with singleton instance', async () => {
    await poseAnalysisService.initialize();

    const result = await poseAnalysisService.analyzeFrame(
      'file://test.jpg',
      'general',

    expect(result).not.toBeNull();
    expect(poseAnalysisService.getSupportedExercises().length).toBeGreaterThan(
      0,
    );
  });
});
