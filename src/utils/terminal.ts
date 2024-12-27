import vscode from 'vscode';
export function createTerminal(terminalName:string) {
  const terminal = vscode.window.createTerminal({
    name: terminalName, // 给终端命名
    cwd: vscode.workspace.workspaceFolders
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined, // 设置终端工作目录为当前工作区的根目录
  });

  return terminal;
}