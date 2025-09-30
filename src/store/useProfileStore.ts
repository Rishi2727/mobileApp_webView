import type { User } from '@/types/models';
import { create } from 'zustand';

interface ProfileState {
    user: User | null;
    getUser: () => User | null;
    setUser: (user: User | null) => void;
}

const useProfileStore = create<ProfileState>((set, get) => ({
    user: null,
    getUser: () => get().user,
    setUser: (user) => set({ user }),
}));

export default useProfileStore;