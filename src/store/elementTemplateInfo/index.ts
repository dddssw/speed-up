import { createStore } from 'zustand/vanilla';
interface templateState {
  "element-plus-template": any;
  save: (template: any) => void;
  clear: () => void;
}
const store = createStore<templateState>((set) => ({
  "element-plus-template": {},
  save: (newTemplate: any) =>
    set(() => ({ "element-plus-template": newTemplate })),
  clear: () => set(() => ({ "element-plus-template": {} })),
}));


export default store;
