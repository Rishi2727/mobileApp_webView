import { create } from 'zustand';

interface LoaderState {
  isLoading: boolean;
  text: string | null;
  setLoading: (isLoading: boolean, text?: string | null) => void;
  startLoading: (text?: string | null) => void;
  stopLoading: () => void;
}

const useLoaderStore = create<LoaderState>((set) => ({
  isLoading: false,
  text: "Loading...",
  setLoading: (isLoading, text = "Loading...") => set({ isLoading, text }),
  startLoading: (text = "Loading...") => set({ isLoading: true, text }),
  stopLoading: () => set({ isLoading: false, text: "Loading..." }),
}));

export default useLoaderStore;