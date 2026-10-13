import { create } from 'zustand';

export interface PinState {
  pinnedIds: string[];
  togglePin: (id: string) => void;
  isPinned: (id: string) => boolean;
  clearPins: () => void;
}

export const usePinStore = create<PinState>((set, get) => ({
  pinnedIds: [],
  togglePin: (id: string) => {
    set((state) => {
      const exists = state.pinnedIds.includes(id);
      return {
        pinnedIds: exists
          ? state.pinnedIds.filter((pinnedId) => pinnedId !== id)
          : [id, ...state.pinnedIds]
      };
    });
  },
  isPinned: (id: string) => {
    return get().pinnedIds.includes(id);
  },
  clearPins: () => {
    set({ pinnedIds: [] });
  }
}));
