// Jest setup after environment
import '@testing-library/jest-native/extend-expect';

// Custom matchers for better testing
expect.extend({
  toBeValidVideoFormat(received) {
    const validFormats = ['mp4', 'mov', 'avi', 'webm'];
    const pass = validFormats.includes(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid video format`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be a valid video format (${validFormats.join(
            ', ',
          )})`,
        pass: false,
      };
    }
  },

  toBeValidExerciseType(received) {
    const validTypes = ['squat', 'pushup', 'plank', 'general'];
    const pass = validTypes.includes(received);

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid exercise type`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be a valid exercise type (${validTypes.join(
            ', ',
          )})`,
        pass: false,
      };
    }
  },

  toBeValidScore(received) {
    const pass =
      typeof received === 'number' && received >= 0 && received <= 100;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid score`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid score (0-100)`,
        pass: false,
      };
    }
  },

  toBeValidPoseResult(received) {
    const hasRequiredFields =
      received &&
      typeof received === 'object' &&
      Array.isArray(received.landmarks) &&
      typeof received.confidence === 'number' &&
      typeof received.timestamp === 'number' &&
      Array.isArray(received.feedback);

    if (hasRequiredFields) {
      return {
        message: () => 'expected pose result to be invalid',
        pass: true,
      };
    } else {
      return {
        message: () =>
          'expected pose result to have required fields (landmarks, confidence, timestamp, feedback)',
        pass: false,
      };
    }
  },

  toHaveValidVideoMetrics(received) {
    const hasValidMetrics =
      received &&
      typeof received === 'object' &&
      typeof received.repetitions === 'number' &&
      received.repetitions >= 0 &&
      typeof received.form_score === 'number' &&
      received.form_score >= 0 &&
      received.form_score <= 100 &&
      typeof received.duration === 'number' &&
      received.duration >= 0 &&
      typeof received.calories_burned === 'number' &&
      received.calories_burned >= 0 &&
      Array.isArray(received.feedback);

    if (hasValidMetrics) {
      return {
        message: () => 'expected video metrics to be invalid',
        pass: true,
      };
    } else {
      return {
        message: () =>
          'expected video metrics to have valid fields (repetitions >= 0, form_score 0-100, duration >= 0, calories_burned >= 0, feedback array)',
        pass: false,
      };
    }
  },
});

// Global test utilities
global.createMockVideoFile = (options = {}) => ({
  uri: options.uri || 'file://test-video.mp4',
  type: options.type || 'video/mp4',
  name: options.name || 'test-video.mp4',
  size: options.size || 1024 * 1024, // 1MB
});

global.createMockPoseLandmarks = (count = 33) => {
  return Array.from({length: count}, (_, i) => ({
    x: Math.random() * 640,
    y: Math.random() * 480,
    confidence: 0.7 + Math.random() * 0.3,
  }));
};

global.createMockAnalysisResult = (exerciseType = 'general') => ({
  landmarks: Array.from({length: 33}, (_, i) => ({
    type: `landmark_${i}`,
    position: {
      x: Math.random() * 640,
      y: Math.random() * 480,
      confidence: 0.7 + Math.random() * 0.3,
    },
  })),
  confidence: 0.8 + Math.random() * 0.2,
  timestamp: Date.now(),
  exerciseType,
  feedback: ['Good form', 'Keep it up'],
  score: Math.floor(Math.random() * 30) + 70, // 70-100
});

global.createMockVideoMetrics = (exerciseType = 'general') => ({
  repetitions: Math.floor(Math.random() * 15) + 5, // 5-20
  form_score: Math.floor(Math.random() * 30) + 70, // 70-100
  duration: Math.floor(Math.random() * 120) + 30, // 30-150 seconds
  calories_burned: Math.floor(Math.random() * 50) + 10, // 10-60
  feedback: [
    'Great workout!',
    'Keep maintaining good form',
    'Focus on breathing',
  ],
});

global.waitForAsync = (fn, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = async () => {
      try {
        const result = await fn();

        if (result) {
          resolve(result);
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 100);
        }
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(error);
        } else {
          setTimeout(check, 100);
        }
      }
    };

    check();
  });
};

// Mock timers setup
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;
const originalClearTimeout = global.clearTimeout;
const originalClearInterval = global.clearInterval;

beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();
  jest.clearAllTimers();

  // Reset fetch mock
  if (global.fetch) {
    global.fetch.mockClear();
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      blob: () => Promise.resolve(new Blob()),
    });
  }
});

afterEach(() => {
  // Cleanup any pending timers
  jest.runOnlyPendingTimers();
  jest.useRealTimers();

  // Restore original timer functions
  global.setTimeout = originalSetTimeout;
  global.setInterval = originalSetInterval;
  global.clearTimeout = originalClearTimeout;
  global.clearInterval = originalClearInterval;
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Suppress specific warnings
const originalWarn = console.warn;

console.warn = (...args) => {
  // Suppress specific React Native warnings that are expected in test environment
  if (
    args[0]?.includes?.('Warning: React.createElement') ||
    args[0]?.includes?.('Warning: componentWillReceiveProps') ||
    args[0]?.includes?.('VirtualizedLists should never be nested')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};
