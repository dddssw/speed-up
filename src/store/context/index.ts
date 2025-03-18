import { createStore } from "zustand/vanilla";
import * as vscode from "vscode";
interface templateState {
  context: vscode.ExtensionContext;
  save: (template: any) => void;
}
const store = createStore<templateState>((set) => ({
  context: {} as vscode.ExtensionContext,
  save: (newTemplate: any) => set(() => ({ context: newTemplate })),
}));

export default store;