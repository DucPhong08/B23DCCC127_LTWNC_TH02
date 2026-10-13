import { create } from 'zustand';

export interface PinState {
  pinnedIds: string[];
  togglePin: (id: string) => void;
  isPinned: (id: string) => boolean;
  clearPins: () => void;
}

export const usePinStore = create<PinState>((set, get) => ({
  pinnedIds: [],
  togglePin: (id) =>
    set((state) => ({
      pinnedIds: state.pinnedIds.includes(id)
        ? state.pinnedIds.filter((pinnedId) => pinnedId !== id)
        : [id, ...state.pinnedIds]
    })),
  isPinned: (id) => get().pinnedIds.includes(id),
  clearPins: () => set({ pinnedIds: [] })
}));
