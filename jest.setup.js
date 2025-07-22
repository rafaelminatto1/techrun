// Jest setup file
import 'react-native-gesture-handler/jestSetup';

// Mock react-native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Mock Animated API
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({isConnected: true})),
  addEventListener: jest.fn(() => jest.fn()),
}));

// Mock react-native-device-info
jest.mock('react-native-device-info', () => ({
  getUniqueId: jest.fn(() => Promise.resolve('mock-unique-id')),
  getBrand: jest.fn(() => Promise.resolve('mock-brand')),
  getModel: jest.fn(() => Promise.resolve('mock-model')),
  getSystemVersion: jest.fn(() => Promise.resolve('mock-version')),
  getVersion: jest.fn(() => Promise.resolve('1.0.0')),
  getBuildNumber: jest.fn(() => Promise.resolve('1')),
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve()),
  getInternetCredentials: jest.fn(() =>
    Promise.resolve({password: 'mock-password'}),
  ),
  resetInternetCredentials: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  exists: jest.fn(() => Promise.resolve(true)),
  stat: jest.fn(() => Promise.resolve({size: 1024})),
  readFile: jest.fn(() => Promise.resolve('mock-file-content')),
  writeFile: jest.fn(() => Promise.resolve()),
  unlink: jest.fn(() => Promise.resolve()),
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/caches',
}));

// Mock react-native-permissions
jest.mock('react-native-permissions', () => ({
  request: jest.fn(() => Promise.resolve('granted')),
  check: jest.fn(() => Promise.resolve('granted')),
  requestMultiple: jest.fn(() => Promise.resolve({})),
  checkMultiple: jest.fn(() => Promise.resolve({})),
  PERMISSIONS: {
    ANDROID: {
      CAMERA: 'android.permission.CAMERA',
      RECORD_AUDIO: 'android.permission.RECORD_AUDIO',
    },
    IOS: {
      CAMERA: 'ios.permission.CAMERA',
      MICROPHONE: 'ios.permission.MICROPHONE',
    },
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    BLOCKED: 'blocked',
  },
}));

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: {
    getAvailableCameraDevices: jest.fn(() => Promise.resolve([])),
    requestCameraPermission: jest.fn(() => Promise.resolve('granted')),
    requestMicrophonePermission: jest.fn(() => Promise.resolve('granted')),
  },
  useCameraDevices: jest.fn(() => ({})),
  useCodeScanner: jest.fn(() => ({})),
}));

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
}));

// Mock @mediapipe/tasks-vision
jest.mock('@mediapipe/tasks-vision', () => ({
  FilesetResolver: {
    forVisionTasks: jest.fn(() => Promise.resolve({})),
  },
  PoseLandmarker: {
    createFromOptions: jest.fn(() =>
      Promise.resolve({
        detectForVideo: jest.fn(() => ({
          landmarks: [],
          worldLandmarks: [],
        })),
      }),
    ),
  },
}));

// Mock Flipper
global.__fbBatchedBridge = {
  registerCallableModule: jest.fn(),
  callFunctionReturnFlushedQueue: jest.fn(() => []),
  invokeCallbackAndReturnFlushedQueue: jest.fn(() => []),
  flushedQueue: jest.fn(() => []),
  getCallableModule: jest.fn(),
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock FormData
global.FormData = class FormData {
  constructor() {
    this._data = new Map();
  }

  append(key, value, filename) {
    this._data.set(key, {value, filename});
  }

  get(key) {
    return this._data.get(key)?.value;
  }

  has(key) {
    return this._data.has(key);
  }

  delete(key) {
    this._data.delete(key);
  }

  entries() {
    return this._data.entries();
  }

  keys() {
    return this._data.keys();
  }

  values() {
    return this._data.values();
  }
};

// Mock Blob
global.Blob = class Blob {
  constructor(parts, options) {
    this.parts = parts || [];
    this.type = options?.type || '';
    this.size =
      parts?.reduce((size, part) => size + (part.length || 0), 0) || 0;
  }
};

// Mock URL
global.URL = {
  createObjectURL: jest.fn(() => 'mock-object-url'),
  revokeObjectURL: jest.fn(),
};

// Mock Image constructor
global.Image = class Image {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.src = '';
    this.width = 0;
    this.height = 0;
  }

  set src(value) {
    this._src = value;
    // Simulate successful image load
    setTimeout(() => {
      this.width = 640;
      this.height = 480;
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }

  get src() {
    return this._src;
  }
};

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
};

// Increase timeout for async operations
jest.setTimeout(10000);

// Setup fetch mock
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
  }),
);
