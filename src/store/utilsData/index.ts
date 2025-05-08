import { createStore } from "zustand/vanilla";

const store = createStore<{ utilsData: any, save: (newCacheData: any) => void; }>((set) => ({
    utilsData: undefined,
    save: (newCacheData: any) => set(() => ({ utilsData: newCacheData })),
}));

export default store;