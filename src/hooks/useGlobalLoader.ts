import useLoaderStore from "@/store/useLoaderStore";

/**
 * A custom hook for managing the global loader state.
 * 
 * @returns An object with methods to control the global loader
 */
const useGlobalLoader = () => {
  const { setLoading, startLoading, stopLoading } = useLoaderStore();

  return {
    setLoading,
    startLoading,
    stopLoading,  
    withLoading: <T extends unknown[], R>(
      fn: (...args: T) => Promise<R>,
      loadingText?: string
    ) => {
      return async (...args: T): Promise<R> => {
        try {
          startLoading(loadingText);
          const result = await fn(...args);
          return result;
        } finally {
          stopLoading();
        }
      };
    }
  };
};

export default useGlobalLoader;