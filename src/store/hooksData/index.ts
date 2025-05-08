import { createStore } from "zustand/vanilla";

const store = createStore<{ hooksData: any, save: (newCacheData: any) => void; }>((set) => ({
    hooksData: undefined,
    save: (newCacheData: any) => set(() => ({ hooksData: newCacheData })),
}));

export default store;