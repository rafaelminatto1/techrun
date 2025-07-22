// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  userType: UserType;
  subscription: SubscriptionPlan;
  createdAt: string;
  updatedAt: string;
  preferences: UserPreferences;
  stats: UserStats;
}

export enum UserType {
  ATHLETE = 'athlete',
  COACH = 'coach',
  PREMIUM = 'premium',
}

export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
  COACH = 'coach',
}

export interface UserPreferences {
  language: string;
  units: 'metric' | 'imperial';
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  theme: 'light' | 'dark' | 'auto';
}

export interface NotificationSettings {
  push: boolean;
  email: boolean;
  analysisComplete: boolean;
  weeklyReport: boolean;
  tips: boolean;
}

export interface PrivacySettings {
  shareData: boolean;
  publicProfile: boolean;
  allowCoaching: boolean;
}

export interface UserStats {
  totalAnalyses: number;
  totalVideos: number;
  averageScore: number;
  improvementRate: number;
  lastActivity: string;
}

// Video Types
export interface VideoData {
  id: string;
  userId: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  size: number;
  resolution: string;
  fps: number;
  exerciseType: ExerciseType;
  createdAt: string;
  status: VideoStatus;
  metadata: VideoMetadata;
}

export enum VideoStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface VideoMetadata {
  deviceInfo: string;
  cameraPosition: 'front' | 'back';
  lighting: 'good' | 'fair' | 'poor';
  stability: number;
  backgroundType: 'indoor' | 'outdoor' | 'gym';
}

// Exercise Types
export enum ExerciseType {
  RUNNING = 'running',
  SQUAT = 'squat',
  JUMP = 'jump',
  PUSHUP = 'pushup',
  DEADLIFT = 'deadlift',
  PLANK = 'plank',
  CUSTOM = 'custom',
}

export interface ExerciseConfig {
  type: ExerciseType;
  name: string;
  description: string;
  instructions: string[];
  keyPoints: string[];
  commonMistakes: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  repetitions?: number;
}

// Analysis Types
export interface AnalysisResult {
  id: string;
  videoId: string;
  userId: string;
  exerciseType: ExerciseType;
  overallScore: number;
  metrics: AnalysisMetrics;
  feedback: Feedback;
  recommendations: Recommendation[];
  keyframes: Keyframe[];
  createdAt: string;
  processingTime: number;
}

export interface AnalysisMetrics {
  form: FormMetrics;
  performance: PerformanceMetrics;
  biomechanics: BiomechanicsMetrics;
}

export interface FormMetrics {
  score: number;
  alignment: number;
  stability: number;
  range_of_motion: number;
  timing: number;
}

export interface PerformanceMetrics {
  speed: number;
  power: number;
  endurance: number;
  efficiency: number;
  consistency: number;
}

export interface BiomechanicsMetrics {
  joint_angles: JointAngle[];
  force_distribution: number[];
  center_of_mass: Point3D[];
  velocity_profile: number[];
  acceleration_profile: number[];
}

export interface JointAngle {
  joint: string;
  angle: number;
  timestamp: number;
  optimal_range: [number, number];
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

export interface Feedback {
  positive: string[];
  improvements: string[];
  warnings: string[];
  tips: string[];
}

export interface Recommendation {
  type: 'exercise' | 'technique' | 'equipment' | 'rest';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number;
}

export interface Keyframe {
  timestamp: number;
  description: string;
  score: number;
  issues: string[];
  pose_landmarks: PoseLandmark[];
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
  landmark_id: number;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {token: string};
};

export type MainTabParamList = {
  Home: undefined;
  Camera: undefined;
  Analysis: undefined;
  Reports: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  ExerciseList: undefined;
  ExerciseDetail: {exerciseType: ExerciseType};
  VideoHistory: undefined;
  VideoDetail: {videoId: string};
};

export type CameraStackParamList = {
  CameraSetup: undefined;
  CameraCapture: {exerciseType: ExerciseType};
  CameraPreview: {videoUri: string; exerciseType: ExerciseType};
};

export type AnalysisStackParamList = {
  AnalysisList: undefined;
  AnalysisDetail: {analysisId: string};
  AnalysisComparison: {analysisIds: string[]};
};

export type ReportsStackParamList = {
  ReportsDashboard: undefined;
  WeeklyReport: undefined;
  MonthlyReport: undefined;
  CustomReport: undefined;
  ProgressChart: {metric: string};
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Subscription: undefined;
  Help: undefined;
  About: undefined;
};

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  userType: UserType;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Store Types
export interface RootState {
  auth: AuthState;
  user: UserState;
  video: VideoState;
  analysis: AnalysisState;
  app: AppState;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface UserState {
  profile: User | null;
  preferences: UserPreferences | null;
  stats: UserStats | null;
  loading: boolean;
  error: string | null;
}

export interface VideoState {
  videos: VideoData[];
  currentVideo: VideoData | null;
  uploading: boolean;
  processing: boolean;
  error: string | null;
}

export interface AnalysisState {
  analyses: AnalysisResult[];
  currentAnalysis: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export interface AppState {
  isOnboarded: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  networkStatus: boolean;
  loading: boolean;
}

// Component Props Types
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export interface CardProps {
  children: React.ReactNode;
  padding?: number;
  margin?: number;
  elevation?: number;
  borderRadius?: number;
  backgroundColor?: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
