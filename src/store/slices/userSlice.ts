import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {UserState, User, UserPreferences, UserStats} from '@types/index';
import {userService} from '@services/userService';
import {showToast} from '@utils/toastConfig';

// Estado inicial
const initialState: UserState = {
  profile: null,
  preferences: null,
  stats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, {rejectWithValue}) => {
    try {
      const response = await userService.getProfile();

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao carregar perfil';

      return rejectWithValue(message);
    }
  },
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData: Partial<User>, {rejectWithValue}) => {
    try {
      const response = await userService.updateProfile(userData);

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

export const fetchUserPreferences = createAsyncThunk(
  'user/fetchPreferences',
  async (_, {rejectWithValue}) => {
    try {
      const response = await userService.getPreferences();

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao carregar preferências';

      return rejectWithValue(message);
    }
  },
);

export const updateUserPreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences: Partial<UserPreferences>, {rejectWithValue}) => {
    try {
      const response = await userService.updatePreferences(preferences);

      showToast.success(
        'Preferências salvas!',
        'Suas configurações foram atualizadas.',
      );

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao salvar preferências';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async (_, {rejectWithValue}) => {
    try {
      const response = await userService.getStats();

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao carregar estatísticas';

      return rejectWithValue(message);
    }
  },
);

export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (imageUri: string, {rejectWithValue}) => {
    try {
      const response = await userService.uploadAvatar(imageUri);

      showToast.success(
        'Avatar atualizado!',
        'Sua foto de perfil foi alterada.',
      );

      return response;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao fazer upload da imagem';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const deleteAvatar = createAsyncThunk(
  'user/deleteAvatar',
  async (_, {rejectWithValue}) => {
    try {
      await userService.deleteAvatar();
      showToast.success('Avatar removido!', 'Sua foto de perfil foi removida.');

      return;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao remover avatar';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const exportUserData = createAsyncThunk(
  'user/exportData',
  async (_, {rejectWithValue}) => {
    try {
      const response = await userService.exportData();

      showToast.success(
        'Dados exportados!',
        'Seus dados foram preparados para download.',
      );

      return response;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao exportar dados';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

export const requestDataDeletion = createAsyncThunk(
  'user/requestDataDeletion',
  async (_, {rejectWithValue}) => {
    try {
      await userService.requestDataDeletion();
      showToast.info(
        'Solicitação enviada',
        'Sua solicitação de exclusão de dados foi registrada.',
      );

      return;
    } catch (error: any) {
      const message =
        error.response?.data?.message || 'Erro ao solicitar exclusão';

      showToast.error('Erro', message);

      return rejectWithValue(message);
    }
  },
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateLocalProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.profile) {
        state.profile = {...state.profile, ...action.payload};
      }
    },
    updateLocalPreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences>>,
    ) => {
      if (state.preferences) {
        state.preferences = {...state.preferences, ...action.payload};
      }
    },
    updateLocalStats: (state, action: PayloadAction<Partial<UserStats>>) => {
      if (state.stats) {
        state.stats = {...state.stats, ...action.payload};
      }
    },
    clearUserData: state => {
      state.profile = null;
      state.preferences = null;
      state.stats = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.profile = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Profile
      .addCase(updateUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateUserProfile.fulfilled,
        (state, action: PayloadAction<User>) => {
          state.loading = false;
          state.profile = action.payload;
          state.error = null;
        },
      )
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Preferences
      .addCase(fetchUserPreferences.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserPreferences.fulfilled,
        (state, action: PayloadAction<UserPreferences>) => {
          state.loading = false;
          state.preferences = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Preferences
      .addCase(updateUserPreferences.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateUserPreferences.fulfilled,
        (state, action: PayloadAction<UserPreferences>) => {
          state.loading = false;
          state.preferences = action.payload;
          state.error = null;
        },
      )
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Stats
      .addCase(fetchUserStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserStats.fulfilled,
        (state, action: PayloadAction<UserStats>) => {
          state.loading = false;
          state.stats = action.payload;
          state.error = null;
        },
      )
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Upload Avatar
      .addCase(uploadAvatar.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        uploadAvatar.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          if (state.profile) {
            state.profile.avatar = action.payload;
          }
          state.error = null;
        },
      )
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Avatar
      .addCase(deleteAvatar.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAvatar.fulfilled, state => {
        state.loading = false;
        if (state.profile) {
          state.profile.avatar = undefined;
        }
        state.error = null;
      })
      .addCase(deleteAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Export Data
      .addCase(exportUserData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportUserData.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(exportUserData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Request Data Deletion
      .addCase(requestDataDeletion.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestDataDeletion.fulfilled, state => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestDataDeletion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const userActions = {
  ...userSlice.actions,
  fetchUserProfile,
  updateUserProfile,
  fetchUserPreferences,
  updateUserPreferences,
  fetchUserStats,
  uploadAvatar,
  deleteAvatar,
  exportUserData,
  requestDataDeletion,
};

export default userSlice.reducer;
