import * as vscode from "vscode";
export function registerDropEvent() {
  class MyDropProvider implements vscode.DocumentDropEditProvider {
    async provideDocumentDropEdits(
      document: vscode.TextDocument,
      position: vscode.Position,
      dataTransfer: vscode.DataTransfer,
      token: vscode.CancellationToken
    ): Promise<vscode.DocumentDropEdit | undefined> {
      // Step1: Get data from dataTransfer (e.g., dragged item from TreeView)
      const draggedUtilsItem = await dataTransfer
        .get("application/vnd.code.tree.utils")
      const draggedHooksItem = await dataTransfer
        .get("application/vnd.code.tree.hooks")
      if (draggedUtilsItem && JSON.parse(draggedUtilsItem.value)[0]) {
        vscode.commands.executeCommand("speed-up.importUtil", JSON.parse(draggedUtilsItem.value)[0], position);
      }
      if (draggedHooksItem && JSON.parse(draggedHooksItem.value)[0]) {
        vscode.commands.executeCommand("speed-up.importHook", JSON.parse(draggedHooksItem.value)[0], position);
      }
      return undefined
      // Step2: Customize content based on dragged item (e.g., transform it into text)
      //const customContent = `Custom Content: ${draggedItem}`;
      // Step3: Return a DocumentDropEdit with the custom content to insert into editor at position.
      //return new vscode.DocumentDropEdit(customContent);
    }
  }

  // Register provider for all document types using '*'
  vscode.languages.registerDocumentDropEditProvider("*", new MyDropProvider());
}
