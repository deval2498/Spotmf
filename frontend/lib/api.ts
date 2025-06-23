// lib/api.ts - Direct connection to Express backend
import axios, { AxiosError } from 'axios';

// Point directly to your Express backend
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface AuthMessageResponse {
  message: string;
  nonce?: string;
}

export interface AuthVerifyResponse {
  success: boolean;
  token?: string;
  user?: {
    walletAddress: string;
  };
  error?: string;
}

// Create axios instance with default config
const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Helper function for error handling
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Request failed';
    throw new Error(errorMessage);
  }
  throw new Error('Unknown error occurred');
};

export const fetchAuthMessage = async (walletAddress: string) => {
  try {
    const response = await apiInstance.post('/auth/challenge', { walletAddress });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const verifySignature = async (
  signature: string,
  message: string,
  walletAddress: string
) => {
  try {
    const response = await apiInstance.post('/auth/verify', {
      signature,
      message,
      walletAddress,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const authenticatedRequest = async (
    endpoint: string,
    data?: any,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'
  ): Promise<any> => {
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await apiInstance.request({
        url: endpoint,
        method,
        data,
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  };
