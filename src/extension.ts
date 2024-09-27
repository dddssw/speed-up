
import * as vscode from 'vscode';
import hookTreeProvide from "./hookTree";
// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
new hookTreeProvide(context);
}

export function deactivate() {}
