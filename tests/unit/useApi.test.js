/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../src/hooks/useApi';
import { tokenStorage, authAPI } from '../../src/utils/api';

// Mock the API and token storage
jest.mock('../../src/utils/api', () => ({
   tokenStorage: {
      getUser: jest.fn(),
      setToken: jest.fn(),
      setUser: jest.fn(),
      clearToken: jest.fn(),
      clearUser: jest.fn(),
   },
   authAPI: {
      login: jest.fn(),
      register: jest.fn(),
      updateProfile: jest.fn(),
   },
}));

describe('useAuth hook', () => {
   beforeEach(() => {
      jest.clearAllMocks();
   });

   test('should initialize with user from tokenStorage', () => {
      const mockUser = { id: 1, name: 'Test User' };
      tokenStorage.getUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
   });

   test('login should update user state and storage on success', async () => {
      tokenStorage.getUser.mockReturnValue(null);
      const mockResponse = {
         token: 'fake-token',
         user: { id: 1, email: 'test@example.com' },
      };
      authAPI.login.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth());

      let loginPromise;
      act(() => {
         loginPromise = result.current.login('test@example.com', 'password');
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
         await loginPromise;
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.user).toEqual(mockResponse.user);
      expect(tokenStorage.setToken).toHaveBeenCalledWith(mockResponse.token);
      expect(tokenStorage.setUser).toHaveBeenCalledWith(mockResponse.user);
   });

   test('login should set error on failure', async () => {
      tokenStorage.getUser.mockReturnValue(null);
      authAPI.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
         try {
            await result.current.login('test@example.com', 'wrong');
         } catch (e) {
            // catch expected error
         }
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.user).toBeNull();
   });

   test('logout should clear state and storage', () => {
      const mockUser = { id: 1, name: 'Test User' };
      tokenStorage.getUser.mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth());

      act(() => {
         result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(tokenStorage.clearToken).toHaveBeenCalled();
      expect(tokenStorage.clearUser).toHaveBeenCalled();
   });
});
