import {create} from "zustand";

const useStore = create((set) => ({
  hooks: [],
  utils: [],
  setHooks: (data) => set(() => ({ hooks: data })),
  setUtils: (data) => set(() => ({ utils: data })),
  clearHooks: () => set(() => ({ hooks: [] })),
  clearUtils: () => set(() => ({ utils: [] })),
}));



export { useStore };
