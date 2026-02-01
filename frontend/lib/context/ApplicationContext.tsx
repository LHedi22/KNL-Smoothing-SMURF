'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type {
  Application,
  AssessmentStatus,
  AssessmentResult,
  ApplicationContextType,
} from '@/lib/types';

type Action =
  | { type: 'SET_APPLICATION'; payload: Application | null }
  | { type: 'SET_ASSESSMENT'; payload: AssessmentStatus | null }
  | { type: 'SET_RESULT'; payload: AssessmentResult | null }
  | { type: 'SET_USER_ROLE'; payload: 'applicant' | 'analyst' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };

interface State {
  currentApplication: Application | null;
  currentAssessment: AssessmentStatus | null;
  currentResult: AssessmentResult | null;
  userRole: 'applicant' | 'analyst';
  isLoading: boolean;
  error: string | null;
}

const initialState: State = {
  currentApplication: null,
  currentAssessment: null,
  currentResult: null,
  userRole: 'applicant',
  isLoading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_APPLICATION':
      return { ...state, currentApplication: action.payload };
    case 'SET_ASSESSMENT':
      return { ...state, currentAssessment: action.payload };
    case 'SET_RESULT':
      return { ...state, currentResult: action.payload };
    case 'SET_USER_ROLE':
      return { ...state, userRole: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value: ApplicationContextType = {
    currentApplication: state.currentApplication,
    currentAssessment: state.currentAssessment,
    currentResult: state.currentResult,
    userRole: state.userRole,
    isLoading: state.isLoading,
    error: state.error,
    setCurrentApplication: (app) => dispatch({ type: 'SET_APPLICATION', payload: app }),
    setCurrentAssessment: (assessment) =>
      dispatch({ type: 'SET_ASSESSMENT', payload: assessment }),
    setCurrentResult: (result) => dispatch({ type: 'SET_RESULT', payload: result }),
    setUserRole: (role) => dispatch({ type: 'SET_USER_ROLE', payload: role }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
  };

  return (
    <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>
  );
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within ApplicationProvider');
  }
  return context;
}
