import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from '@reduxjs/toolkit';

// Importar slices
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import videoSlice from './slices/videoSlice';
import analysisSlice from './slices/analysisSlice';
import appSlice from './slices/appSlice';

// Configuração de persistência
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'user', 'app'], // Apenas estes slices serão persistidos
  blacklist: ['video', 'analysis'], // Estes não serão persistidos
};

// Configuração específica para auth
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['isAuthenticated', 'user', 'accessToken', 'refreshToken'],
};

// Configuração específica para app
const appPersistConfig = {
  key: 'app',
  storage: AsyncStorage,
  whitelist: ['isOnboarded', 'theme', 'language'],
};

// Combinar reducers
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authSlice),
  user: userSlice,
  video: videoSlice,
  analysis: analysisSlice,
  app: persistReducer(appPersistConfig, appSlice),
});

// Reducer persistido
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configurar store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER',
        ],
      },
    }),
  devTools: __DEV__,
});

// Configurar persistor
export const persistor = persistStore(store);

// Tipos
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Hooks tipados
import {useDispatch, useSelector, TypedUseSelectorHook} from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Seletores úteis
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.user;
export const selectVideo = (state: RootState) => state.video;
export const selectAnalysis = (state: RootState) => state.analysis;
export const selectApp = (state: RootState) => state.app;

// Seletores específicos
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectIsOnboarded = (state: RootState) => state.app.isOnboarded;
export const selectTheme = (state: RootState) => state.app.theme;
export const selectLanguage = (state: RootState) => state.app.language;
export const selectNetworkStatus = (state: RootState) =>
  state.app.networkStatus;

// Actions exportadas para uso direto
export {authActions} from './slices/authSlice';
export {userActions} from './slices/userSlice';
export {videoActions} from './slices/videoSlice';
export {analysisActions} from './slices/analysisSlice';
export {appActions} from './slices/appSlice';
