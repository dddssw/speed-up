import { convertToLocalPaths } from "@/tools";
import * as vscode from "vscode";
import { join } from "path";
import { readFileSync } from "fs";
import contextStore from "@/store/context";
let context = contextStore.getState().context;
let panel: any;

vscode.commands.registerCommand("speed-up.login", () => {
  // Create and show a new webview
  panel = vscode.window.createWebviewPanel(
    "speedUpWebview", // Identifies the type of the webview. Used internally
    "speed up", // Title of the panel displayed to the user
    vscode.ViewColumn.One, // Editor column to show the new webview panel in.
    {
      //   localResourceRoots: [vscode.Uri.joinPath(context.extensionUri)],
      enableScripts: true,
      retainContextWhenHidden: true,
    } // Webview options. More on these later.
  );
  vscode.commands.executeCommand("setContext", "speed-up.speepUpWebview", true);
  panel.webview.html = getWebviewContent(panel.webview);
  panel.webview.onDidReceiveMessage(
    (message: any) => {
      switch (message.command) {
        case "setToken":
          context.globalState.update("token", message.token);
          return;
        case "getToken":
          const token = context.globalState.get("token");
          panel.webview.postMessage({
            command: "sendToken",
            token,
          });
          return;
      }
    },
    undefined,
    context.subscriptions
  );
  panel.onDidDispose(() => {
    vscode.commands.executeCommand(
      "setContext",
      "speed-up.speepUpWebview",
      false
    );
  });
});
vscode.commands.registerCommand("speed-up.logout", () => {
  context.globalState.update("token", "");
  console.log(context.globalState.get("token"), "kkk");
  vscode.window.showInformationMessage("退出成功!");
  if (panel) {
    panel.webview.postMessage({
      command: "logout",
    });
  }
});
function getWebviewContent(webview: vscode.Webview) {
  const indexPath = "webViewDist/index.html";
  const htmlPath = join(context.extensionPath, indexPath);
  const htmlText = readFileSync(htmlPath).toString();
  //转化vscode要求的路径
  const res = convertToLocalPaths(htmlText, webview, context.extensionUri);
  return res;
}
