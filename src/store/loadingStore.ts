import { create } from 'zustand';

interface LoadingState {
    count : number;
    show  : () => void;
    hide  : () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
    count : 0,
    show  : () => set(state => ({ count: state.count + 1 })),
    hide  : () => set(state => ({ count: Math.max(0, state.count - 1) })),
}));
