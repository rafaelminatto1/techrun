import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {
  AuthState,
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from '@types/index';
import {authService} from '@services/authService';
import {showToast} from '@utils/toastConfig';

// Estado inicial
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, {rejectWithValue}) => {
    try {
      const response = await authService.login(credentials);

      showToast.success('Login realizado com sucesso!', 'Bem-vindo de volta!');

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';

      showToast.error('Erro no login', message);

      return rejectWithValue(message);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, {rejectWithValue}) => {
    try {
      const response = await authService.register(userData);

      showToast.success(
        'Conta criada com sucesso!',
        'Bem-vindo ao FitAnalyzer Pro!',
      );

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta';

      showToast.error('Erro no registro', message);

      return rejectWithValue(message);
    }
  },
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, {getState, rejectWithValue}) => {
    try {
      const state = getState() as {auth: AuthState};
      const {refreshToken} = state.auth;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authService.refreshToken(refreshToken);

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao renovar token';

      return rejectWithValue(message);
    }
  },
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, {getState, rejectWithValue}) => {
    try {
      const state = getState() as {auth: AuthState};
      const {refreshToken} = state.auth;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      showToast.info('Logout realizado', 'Até logo!');

      return;
    } catch (error: any) {
      // Mesmo com erro, fazemos logout local
      showToast.info('Logout realizado', 'Até logo!');

      return;
    }
  },
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, {getState, rejectWithValue}) => {
    try {
      const state = getState() as {auth: AuthState};
      const {accessToken} = state.auth;

      if (!accessToken) {
        throw new Error('No access token available');
      }

      const response = await authService.verifyToken(accessToken);

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Token inválido';

      return rejectWithValue(message);
    }
  },
);

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, {rejectWithValue}) => {
    try {
      await authService.forgotPassword(email);
      showToast.success(
        'Email enviado!',
        'Verifique sua caixa de entrada para redefinir a senha.',
      );

      return;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao enviar email';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (
    {token, password}: {token: string; password: string},
    {rejectWithValue},
  ) => {
    try {
      await authService.resetPassword(token, password);
      showToast.success(
        'Senha redefinida!',
        'Sua senha foi alterada com sucesso.',
      );

      return;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao redefinir senha';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, {rejectWithValue}) => {
    try {
      const response = await authService.updateProfile(userData);

      showToast.success('Perfil atualizado!', 'Suas informações foram salvas.');

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao atualizar perfil';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (
    {
      currentPassword,
      newPassword,
    }: {currentPassword: string; newPassword: string},
    {rejectWithValue},
  ) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      showToast.success(
        'Senha alterada!',
        'Sua senha foi atualizada com sucesso.',
      );

      return;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao alterar senha';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const deleteAccount = createAsyncThunk(
  'auth/deleteAccount',
  async (password: string, {rejectWithValue}) => {
    try {
      await authService.deleteAccount(password);
      showToast.info('Conta excluída', 'Sua conta foi removida com sucesso.');

      return;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao excluir conta';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = {...state.user, ...action.payload};
      }
    },
    clearAuth: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: builder => {
    builder
      // Login
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.error = null;
        },
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Register
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.error = null;
        },
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

      // Refresh Token
      .addCase(
        refreshToken.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.user;
        },
      )
      .addCase(refreshToken.rejected, state => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })

      // Logout
      .addCase(logoutUser.fulfilled, state => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        state.loading = false;
      })

      // Verify Token
      .addCase(verifyToken.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyToken.rejected, state => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Reset Password
      .addCase(resetPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Profile
      .addCase(
        updateProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.user = action.payload;
        },

      // Delete Account
      .addCase(deleteAccount.fulfilled, state => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        state.loading = false;
      });
  },
});

export const authActions = {
  ...authSlice.actions,
  loginUser,
  registerUser,
  refreshToken,
  logoutUser,
  verifyToken,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  deleteAccount,
};

export default authSlice.reducer;
