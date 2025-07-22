// Hooks personalizados
export {useAuth, default as useAuthDefault} from './useAuth';
export {useVideo, default as useVideoDefault} from './useVideo';
export {useAnalysis, default as useAnalysisDefault} from './useAnalysis';
export {
  useBackendConnection,
  default as useBackendConnectionDefault,
} from './useBackendConnection';

// Re-exportar hooks do Redux para conveniência
export {useAppDispatch, useAppSelector} from '@store/index';
