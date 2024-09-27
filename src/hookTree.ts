import * as vscode from "vscode";
const path = require("path");
import { pathToFileURL } from "url";
import * as fs from "fs/promises";
import { getExportInfo } from "exportinfo";
export default class hookTreeProvide
  implements vscode.TreeDataProvider<number>
{
  private editor: vscode.TextEditor | undefined;
  private hooksPath: string | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<number | undefined> =
    new vscode.EventEmitter<number | undefined>();
  readonly onDidChangeTreeData: vscode.Event<number | undefined> =
    this._onDidChangeTreeData.event;

  rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.editor = vscode.window.activeTextEditor;
    const hooksConfigurePath = vscode.workspace
      .getConfiguration("speedImport")
      .get("hooksPath");
    this.hooksPath = path.join(this.rootPath, hooksConfigurePath);
    const view = vscode.window.createTreeView("hooks", {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: true,
    });
    context.subscriptions.push(view);
    this.context = context;
  }
  getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  async getChildren(
    element?: number | undefined
  ): Promise<vscode.ProviderResult<number[]>> {
    if (!this.rootPath) {
      return Promise.resolve([]);
    }
    if (!element) {
      const fileArr = await getFilesAndExtensions(this.hooksPath);
      fileArr.forEach((item) => {
        item.collapsibleState = 1;
        item.iconPath =
          item.type === "dir" ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File;
      });
      return fileArr;
    } else {
      if (element.type === "dir") {
        const fileArr = await getFilesAndExtensions(element.fullPath);
        fileArr.forEach((item) => {
          item.collapsibleState = 1;
          item.iconPath =
            item.type === "dir"
              ? vscode.ThemeIcon.Folder
              : vscode.ThemeIcon.File;
        });
        return fileArr;
      } else {
        const code = await fs.readFile(element.fullPath, "utf-8");
        const exportInfo = getExportInfo(code, element.label);
        console.log(exportInfo, "exportInfo");
        exportInfo.forEach((item) => {
          item.label = item.name;
          item.tooltip = item.comment;
          item.collapsibleState = item.returnData.length === 0 ? 0 : 1;
          item.iconPath = new vscode.ThemeIcon(
            item.type.includes("Function") ? "symbol-function" : "symbol-field"
          );
        });
        return exportInfo;
      }
    }
  }
}

async function getFilesAndExtensions(
  dirPath: string | undefined
): Promise<any[]> {
  const fileArr: any[] = [];

  try {
    // 读取目录
    const files = await fs.readdir(dirPath!);

    // 遍历文件和目录
    for (const file of files) {
      const filePath = path.join(dirPath!, file); // 完整的文件路径
      const stats = await fs.stat(filePath); // 获取文件的状态信息

      // 判断是否为文件
      if (stats.isFile()) {
        const fileName = path.basename(file, path.extname(file)); // 获取文件名（不带路径）
        const fileExt = path.extname(file).slice(1); // 获取文件后缀
        fileArr.push({
          fullPath: filePath,
          type: "file",
          label: fileName,
          fileExt,
        });
      } else {
        fileArr.push({ fullPath: filePath, type: "dir", label: file });
      }
    }
  } catch (err) {
    console.error("读取目录或文件状态失败:", err);
  }

  return fileArr; // 返回文件数组
}
