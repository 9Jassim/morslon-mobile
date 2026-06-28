import { create } from 'zustand';

import { fetchWishlistIds, toggleWishlist } from './account-api';

type WishlistState = {
  ids: Set<string>;
  has: (id: string) => boolean;
  load: () => Promise<void>;
  clear: () => void;
  /** Optimistically toggle, then sync with the server (reverts on failure). */
  toggle: (id: string) => Promise<void>;
};

export const useWishlist = create<WishlistState>((set, get) => ({
  ids: new Set(),
  has: (id) => get().ids.has(id),

  load: async () => {
    try {
      const ids = await fetchWishlistIds();
      set({ ids: new Set(ids) });
    } catch {
      /* not logged in / offline */
    }
  },

  clear: () => set({ ids: new Set() }),

  toggle: async (id) => {
    const next = new Set(get().ids);
    const wasIn = next.has(id);
    if (wasIn) next.delete(id);
    else next.add(id);
    set({ ids: next });
    try {
      const added = await toggleWishlist(id);
      // Reconcile with server truth.
      set((s) => {
        const synced = new Set(s.ids);
        if (added) synced.add(id);
        else synced.delete(id);
        return { ids: synced };
      });
    } catch {
      // revert
      set((s) => {
        const reverted = new Set(s.ids);
        if (wasIn) reverted.add(id);
        else reverted.delete(id);
        return { ids: reverted };
      });
    }
  },
}));
