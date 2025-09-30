import { useState, useCallback, useEffect } from 'react';
import axios, { type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios';
import { storage } from '@/lib/storage';

export interface DefaultResponseTemplate<T> {
    success: boolean;
    data: T;
    error: string;
    message: string;
}

export interface ActionCallbacks<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
    onLoadingStart: () => void;
    onLoadingStop: () => void;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiOptions<T, R = DefaultResponseTemplate<T>> extends AxiosRequestConfig {
    actionCallbacks?: ActionCallbacks<T>;
    responseTransformer?: (response: R) => T | null;
    includePrivateHeaders?: boolean;
}

export interface UseApiResult<T, R = DefaultResponseTemplate<T>> {
    data: T | null;
    loading: boolean;
    error: string | null;
    get: (url: string, options?: ApiOptions<T, R>) => Promise<R | null>;
    post: <D = unknown>(url: string, postData: D, options?: ApiOptions<T, R>) => Promise<R | null>;
    put: <D = unknown>(url: string, putData: D, options?: ApiOptions<T, R>) => Promise<R | null>;
    patch: <D = unknown>(url: string, patchData: D, options?: ApiOptions<T, R>) => Promise<R | null>;
    delete: (url: string, options?: ApiOptions<T, R>) => Promise<R | null>;
    execute: <D = unknown>(
        method: HttpMethod,
        url: string,
        data?: D,
        options?: ApiOptions<T, R>
    ) => Promise<R | null>;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
    reset: () => void;
}

export const getPrivateHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? storage.get('AUTH_TOKEN') : null;

    if (token && typeof token === 'string') {
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    return {};
};

const createApiHook = (defaultIncludePrivateHeaders: boolean = false) => {
    return <T = unknown, R = DefaultResponseTemplate<T>>(
        initialUrl?: string,
        initialMethod: HttpMethod = 'GET',
        initialOptions?: ApiOptions<T, R>
    ): UseApiResult<T, R> => {
        const [data, setData] = useState<T | null>(null);
        const [loading, setLoading] = useState<boolean>(false);
        const [error, setError] = useState<string | null>(null);

        const makeRequest = useCallback(async <D = unknown>(
            method: HttpMethod,
            url: string,
            requestData?: D,
            options?: ApiOptions<T, R>
        ): Promise<R | null> => {
            setLoading(true);
            setError(null);

            const {
                actionCallbacks,
                responseTransformer,
                includePrivateHeaders = defaultIncludePrivateHeaders,
                headers = {},
                ...axiosOptions
            } = options || {};

            actionCallbacks?.onLoadingStart?.();

            const finalHeaders = {
                ...headers,
                ...(includePrivateHeaders ? getPrivateHeaders() : {})
            };

            try {
                let response: AxiosResponse<R>;
                const config = {
                    ...axiosOptions,
                    headers: finalHeaders
                };

                switch (method) {
                    case 'GET':
                        response = await axios.get(url, config);
                        break;
                    case 'POST':
                        response = await axios.post(url, requestData, config);
                        break;
                    case 'PUT':
                        response = await axios.put(url, requestData, config);
                        break;
                    case 'PATCH':
                        response = await axios.patch(url, requestData, config);
                        break;
                    case 'DELETE':
                        response = await axios.delete(url, config);
                        break;
                    default:
                        throw new Error(`Unsupported HTTP method: ${method}`);
                }

                const responseData = response.data;

                let extractedData: T | null = null;

                if (responseTransformer) {
                    extractedData = responseTransformer(responseData);
                } else if (responseData && typeof responseData === 'object' && 'data' in responseData) {
                    const responseWithData = responseData as unknown as { data: T };
                    extractedData = responseWithData.data;
                } else {
                    extractedData = responseData as unknown as T;
                }

                if (extractedData !== null) {
                    setData(extractedData);
                    actionCallbacks?.onSuccess?.(extractedData);
                }

                return responseData;
            } catch (error) {
                const axiosError = error as AxiosError<{ message?: string }>;
                const errorMessage = axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred';
                setError(errorMessage);
                actionCallbacks?.onError?.(errorMessage);
                return null;
            } finally {
                setLoading(false);
                actionCallbacks?.onLoadingStop?.();
            }
        }, [defaultIncludePrivateHeaders]);

        const get = useCallback(async (
            url: string,
            options?: ApiOptions<T, R>
        ): Promise<R | null> => {
            return makeRequest('GET', url, undefined, options);
        }, [makeRequest]);

        const post = useCallback(async <D = unknown>(
            url: string,
            postData: D,
            options?: ApiOptions<T, R>
        ): Promise<R | null> => {
            return makeRequest('POST', url, postData, options);
        }, [makeRequest]);

        const put = useCallback(async <D = unknown>(
            url: string,
            putData: D,
            options?: ApiOptions<T, R>
        ): Promise<R | null> => {
            return makeRequest('PUT', url, putData, options);
        }, [makeRequest]);

        const patch = useCallback(async <D = unknown>(
            url: string,
            patchData: D,
            options?: ApiOptions<T, R>
        ): Promise<R | null> => {
            return makeRequest('PATCH', url, patchData, options);
        }, [makeRequest]);

        const deleteMethod = useCallback(async (
            url: string,
            options?: ApiOptions<T, R>
        ): Promise<R | null> => {
            return makeRequest('DELETE', url, undefined, options);
        }, [makeRequest]);

        // Generic execute function
        const execute = useCallback(async <D = unknown>(
            method: HttpMethod,
            url: string,
            requestData?: D,
            options?: ApiOptions<T, R>
        ): Promise<R | null> => {
            return makeRequest(method, url, requestData, options);
        }, [makeRequest]);

        // Reset function to clear state
        const reset = useCallback(() => {
            setData(null);
            setError(null);
            setLoading(false);
        }, []);

        useEffect(() => {
            if (initialUrl) {
                makeRequest(initialMethod, initialUrl, undefined, initialOptions);
            }
        }, [initialUrl, initialMethod, makeRequest]);

        return {
            data,
            loading,
            error,
            get,
            post,
            put,
            patch,
            delete: deleteMethod,
            execute,
            setData,
            reset
        };
    };
};

export const useApi = createApiHook(false);
export const usePrivateApi = createApiHook(true);

export default useApi;

export const useGetApi = <T = unknown, R = DefaultResponseTemplate<T>>(
    initialUrl?: string,
    initialOptions?: ApiOptions<T, R>
) => {
    const api = useApi<T, R>(initialUrl, 'GET', initialOptions);
    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        fetch: api.get,
        setData: api.setData
    };
};

export const usePostApi = <T = unknown>() => {
    const api = useApi<T>();
    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        postData: api.post
    };
};

export const usePutApi = <T = unknown>() => {
    const api = useApi<T>();
    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        putData: api.put
    };
};

export const usePatchApi = <T = unknown>() => {
    const api = useApi<T>();
    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        patchData: api.patch
    };
};

export const useDeleteApi = <T = unknown>() => {
    const api = useApi<T>();
    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        deleteData: api.delete
    };
};

// Private versions of individual hooks
export const usePrivateGetApi = <T = unknown, R = DefaultResponseTemplate<T>>(
    initialUrl?: string,
    initialOptions?: ApiOptions<T, R>
) => {
    const api = usePrivateApi<T, R>(initialUrl, 'GET', initialOptions);
    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        fetch: api.get,
        setData: api.setData
    };
};

export const usePrivatePostApi = <T = unknown>() => {
    const api = usePrivateApi<T>();
    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        postData: api.post
    };
};

export const usePrivatePutApi = <T = unknown>() => {
    const api = usePrivateApi<T>();
    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        putData: api.put
    };
};

export const usePrivatePatchApi = <T = unknown>() => {
    const api = usePrivateApi<T>();
    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        patchData: api.patch
    };
};

export const usePrivateDeleteApi = <T = unknown>() => {
    const api = usePrivateApi<T>();
    return {
        data: api.data,
        loading: api.loading,
        error: api.error,
        deleteData: api.delete
    };
};
