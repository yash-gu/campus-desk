import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

interface User {
  studentId: string;
  name: string;
  email: string;
  role: 'student' | 'librarian' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'AUTH_ERROR'; payload: string };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  authState: AuthState;
  login: (studentId: string, password: string) => Promise<void>;
  register: (userData: {
    studentId: string;
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/users/profile');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: response.data, token },
          });
        } catch (error) {
          dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (studentId: string, password: string, role?: string) => {
    try {
      console.log('AuthContext login attempt:', studentId, 'Role:', role || 'student');
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/users/login', { studentId, password, role });
      console.log('Login response:', response.data);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data,
      });
      
      console.log('Login dispatched, auth state should be updated');
      toast.success(`Welcome back, ${response.data.user.name}!`);
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.message || 'Login failed' });
      toast.error(error.response?.data?.message || 'Login failed');
    }
  }, []);

  const register = useCallback(async (userData: {
    studentId: string;
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await api.post('/users/register', userData);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data,
      });
      
      toast.success(`Welcome to Campus Desk, ${response.data.user.name}!`);
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.message || 'Registration failed' });
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
