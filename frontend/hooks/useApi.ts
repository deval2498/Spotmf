"use client"
import {useState, useEffect} from "react"
import axios from "axios"
import { error } from "console"

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    timeout: 5000,
    headers: {
        'Content-Type' : 'application/json',
    }
})

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
},
(err) => Promise.reject(err))

export function useApi<T = unknown>(url : string, method: 'post' | 'get' | 'put' | 'delete', body: any) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<T | null>(null);

    const bodyString = JSON.stringify(body);

    useEffect(() => {
        if(!url) return;
        const controller = new AbortController();
        async function callApi() {
            try {
                setLoading(true);
                const config = {
                    url,
                    method,
                    signal: controller.signal,
                    data: body
                }
                const response = await instance.request<T>(config)
                setData(response.data)
                setError(null)
            } catch (error: any) {
                if( error.name !== 'Canceled Error') {
                    setError(error.message || 'Something went wrong')
                }
            }
            finally {
                setLoading(false)
            }
        }
        callApi()
        return () => controller.abort()
    }, [url, method, bodyString, body]) 
    return { data, loading, error };
}