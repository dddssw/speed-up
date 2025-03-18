import { convertToLocalPaths } from "@/tools";
import * as vscode from "vscode";
import { join } from "path";
import {readFileSync} from 'fs';
import contextStore from "@/store/context";
let context = contextStore.getState().context

vscode.commands.registerCommand("speed-up.login", () => {
  // Create and show a new webview
  const panel = vscode.window.createWebviewPanel(
    "speedUpWebview", // Identifies the type of the webview. Used internally
    "speed up", // Title of the panel displayed to the user
    vscode.ViewColumn.Beside, // Editor column to show the new webview panel in.
    {
      //   localResourceRoots: [vscode.Uri.joinPath(context.extensionUri)],
      enableScripts:true,
    } // Webview options. More on these later.
  );
  panel.webview.html = getWebviewContent(panel.webview);
});

function getWebviewContent(webview: vscode.Webview) {
  const indexPath = "webView/dist/index.html";
  const htmlPath = join(context.extensionPath, indexPath);
  const htmlText = readFileSync(htmlPath).toString();

  const res = convertToLocalPaths(htmlText, webview, context.extensionUri);
  console.log(res, "ssss");
  return res;
}
