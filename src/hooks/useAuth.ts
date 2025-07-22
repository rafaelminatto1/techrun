import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '@store/index';
import {authActions} from '@store/index';
import {LoginCredentials, RegisterData} from '@types/index';

/**
 * Hook personalizado para gerenciar autenticação
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const {isAuthenticated, user, loading, error, accessToken, refreshToken} =
    useAppSelector(state => state.auth);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        const result = await dispatch(authActions.loginUser(credentials));

        return result;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const result = await dispatch(authActions.registerUser(data));

        return result;
      } catch (error) {
        console.error('Register error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    try {
      await dispatch(authActions.logout());
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }, [dispatch]);

  const forgotPassword = useCallback(
    async (email: string) => {
      try {
        const result = await dispatch(authActions.forgotPassword(email));

        return result;
      } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string) => {
      try {
        const result = await dispatch(
          authActions.resetPassword({token, newPassword}),
        );

        return result;
      } catch (error) {
        console.error('Reset password error:', error);
        throw error;
      }
    },
    [dispatch],
  );

  const clearError = useCallback(() => {
    dispatch(authActions.clearError());
  }, [dispatch]);

  const refreshAccessToken = useCallback(async () => {
    try {
      const result = await dispatch(authActions.refreshToken());

      return result;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }, [dispatch]);

  return {
    // Estado
    isAuthenticated,
    user,
    loading,
    error,
    accessToken,
    refreshToken,

    // Ações
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
    refreshAccessToken,
  };
};

export default useAuth;
