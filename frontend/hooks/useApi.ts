"use client"
import {useState, useEffect, useRef, useCallback} from "react"
import axios, { AxiosRequestConfig } from "axios"

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    timeout: 5000,
    headers: {
        'Content-Type' : 'application/json',
    }
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt');
    if(token) {
        config.headers.Authorization = token
    }
    return config
},
(err) => Promise.reject(err))

export function useApi<T = unknown>() {
    const [data,    setData]    = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState<string | null>(null);
  
    // Track the latest AbortController so we can cancel if needed
    const controllerRef = useRef<AbortController | null>(null);
  
    const execute = useCallback(
      async (cfg: AxiosRequestConfig): Promise<T | undefined> => {
        // Cancel any in-flight request from the same hook instance
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
  
        setLoading(true);
        setError(null);
  
        try {
          const { data } = await instance.request<T>({
            ...cfg,
            signal: controller.signal,
          });
          setData(data);
          return data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
          if (e.name !== 'CanceledError') {
            setError(e.message ?? 'Something went wrong');
            throw e;                     // let caller handle it too
          }
        } finally {
          setLoading(false);
        }
      },
      [],
    );
  
    // Clean up on unmount
    useEffect(() => () => controllerRef.current?.abort(), []);
  
    return { execute, data, loading, error };
  }