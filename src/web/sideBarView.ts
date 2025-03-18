import * as vscode from "vscode";
import { join } from "path";
import { readFileSync } from "fs";
import { modifyHtml } from "html-modifier";

export default class webViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly viewType: string
  ) {
    const view = vscode.window.registerWebviewViewProvider(this.viewType, this);
    context.subscriptions.push(view);
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }
  public convertToLocalPaths(html: string, webview: vscode.Webview) {
    // 使用正则表达式来匹配 href 和 src 中的路径
    const pathRegex = /(href|src)=[\'\"]([^\'\"]+)[\'\"]/g;

    // 替换逻辑
    const updatedHtml = html.replace(pathRegex, (match, p1, p2) => {
      // 如果路径是以 '/' 开头的，表示是绝对路径
      if (p2.startsWith("/")) {
        // 拼接 basePath 和相对路径
        const newPath = webview.asWebviewUri(
          vscode.Uri.joinPath(this.context.extensionUri, "webView/dist", p2)
        );
        return `${p1}="${newPath}"`;
      }
      // 如果路径不是以 '/' 开头，保持原样
      return match;
    });

    return updatedHtml;
  }
  private _getHtmlForWebview(webview: vscode.Webview) {
    const indexPath = "webView/dist/index.html";
    const htmlPath = join(this.context.extensionPath, indexPath);
    const htmlText = readFileSync(htmlPath).toString();

    const res = this.convertToLocalPaths(htmlText, webview);
    console.log(res, "ssss");
    return res;
  }
}
