import * as vscode from "vscode";
const path = require("path");
import * as fs from "fs/promises";
import { isInside, findCacheNode } from "@/tools";
import { getExportInfo } from "exportinfo";
import { resolve } from "path";
export default class hookTreeProvide implements vscode.TreeDataProvider<number> {
  private editor: vscode.TextEditor | undefined;
  private hooksPath: string | undefined;
  private watcher: vscode.FileSystemWatcher;

  private _onDidChangeTreeData: vscode.EventEmitter<number | undefined> =
    new vscode.EventEmitter<number | undefined>();
  readonly onDidChangeTreeData: vscode.Event<number | undefined> =
    this._onDidChangeTreeData.event;

  async refresh() {
    await this.context.workspaceState.update("hooksData", undefined);
    const hooksConfigurePath = vscode.workspace
      .getConfiguration("speedImport")
      .get("hooksPath");
    this.hooksPath = path.join(this.rootPath, hooksConfigurePath);
    this._onDidChangeTreeData.fire(); //通知订阅更新
  }
  rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    vscode.workspace.onDidSaveTextDocument((doc) =>
      this.onDocumentChanged(doc)
    );
    vscode.commands.registerCommand("speed-up.refreshHooks", () =>
      this.refresh()
    );

    this.editor = vscode.window.activeTextEditor;
    const hooksConfigurePath = vscode.workspace
      .getConfiguration("speedImport")
      .get("hooksPath");
    this.hooksPath = path.join(this.rootPath, hooksConfigurePath);
    this.createFileWatch(this.hooksPath);

    const view = vscode.window.createTreeView("hooks", {
      treeDataProvider: this,
      showCollapseAll: true,
      canSelectMany: true,
    });
    context.subscriptions.push(view);
  }
  getTreeItem(element: any): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
  async getChildren(element?: any): Promise<vscode.ProviderResult<any[]>> {
    if (!this.rootPath) {
      return Promise.resolve([]);
    }
    const cache: any[] | undefined =
      this.context.workspaceState.get("hooksData");
    console.log(cache, "cache");
    if (!element) {
      //根
      if (cache) {
        cache.forEach((item) => {
          item.iconPath =
            item.type === "dir"
              ? vscode.ThemeIcon.Folder
              : vscode.ThemeIcon.File;
          item.command.arguments[0] = vscode.Uri.file(item.fullPath);
        });
        return cache;
      }
      const fileArr = await getFilesAndExtensions(this.hooksPath);
      fileArr.forEach((item) => {
        item.collapsibleState = 1;
        item.iconPath =
          item.type === "dir" ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File;
        item.command = {
          command: "speed-up.openFile",
          title: "Open File",
          arguments: [vscode.Uri.file(item.fullPath)],
        };
      });
      await this.context.workspaceState.update("hooksData", fileArr); //缓存
      return fileArr;
    } else {
      console.log("cache1", element.children);
      if (element.children) {
        element.children.forEach((item: any) => {
          item.iconPath = new vscode.ThemeIcon(item.iconPath.id);
          if (item.command) {
            item.command.arguments[0] = vscode.Uri.file(element.fullPath);
          }
        });
        return element.children;
      }
      //这是目录
      if (element.type === "dir") {
        const fileArr = await getFilesAndExtensions(element.fullPath);
        fileArr.forEach((item) => {
          item.collapsibleState = 1;
          item.iconPath =
            item.type === "dir"
              ? vscode.ThemeIcon.Folder
              : vscode.ThemeIcon.File;
        });
        element.children = fileArr; //缓存
        await this.context.workspaceState.update("hooksData", cache);
        return fileArr;
      }
      //hook函数return的内容
      else if (element.returnData && element.returnData.length > 0) {
        element.returnData.forEach((item: any) => {
          item.label = item.returnName;
          item.tooltip = item.comment;
          item.collapsibleState = 0;
          item.iconPath = new vscode.ThemeIcon(
            item.type.includes("Function") ? "symbol-function" : "symbol-field"
          );
          item.command = {
            command: "speed-up.openFileAndScroll",
            title: "Open File",
            arguments: [vscode.Uri.file(element.fullPath), item.loc],
          };
        });
        return element.returnData;
      }
      //文件导出的函数
      else {
        const code = await fs.readFile(element.fullPath, "utf-8");
        const exportInfo = getExportInfo(code, element.label);
        console.log(exportInfo, "exportInfo");
        exportInfo.forEach((item: any) => {
          item.fullPath = element.fullPath;
          item.label = item.name;
          item.tooltip = item.comment;
          item.collapsibleState = !item.returnData
            ? 0
            : item.returnData?.length === 0
            ? 0
            : 1;
          item.iconPath = new vscode.ThemeIcon(
            item.type.includes("Function") ? "symbol-function" : "symbol-field"
          );
          item.command = {
            command: "speed-up.openFileAndScroll",
            title: "Open File",
            arguments: [vscode.Uri.file(element.fullPath), item.loc],
          };
          item.contextValue = "hooksImport";
        });
        element.children = exportInfo; //缓存
        await this.context.workspaceState.update("hooksData", cache);
        return exportInfo;
      }
    }
  }
  private dealFile(uri: vscode.Uri) {
    const tree: any[] | undefined =
      this.context.workspaceState.get("utilsData");
    if (!tree) {
      return;
    }
    const node = findCacheNode(tree, path.dirname(uri.fsPath));
    if (node) {
      //@ts-ignore
      node.children = undefined;
    }
    node ? this._onDidChangeTreeData.fire(node) : this.refresh();
    //await this.context.workspaceState.update("utilsData", tree);
  }
  private async onDocumentChanged(doc: vscode.TextDocument) {
    const shouldUpdate = isInside(doc.uri.fsPath, this.hooksPath);
    if (shouldUpdate) {
      const tree: any[] | undefined =
        this.context.workspaceState.get("hooksData");
      if (!tree) {
        return;
      }
      const node = findCacheNode(tree, doc.uri.fsPath);
      //@ts-ignore
      node.children = undefined;
      //await this.context.workspaceState.update("hooksData", tree);
      this._onDidChangeTreeData.fire(node);
      console.log("changeEvent", node);
    }
  }
  public createFileWatch(folderPath: any) {
    this.watcher?.dispose();
    const globPath = path.join(folderPath, "**/*");
    this.watcher = vscode.workspace.createFileSystemWatcher(
      globPath,
      false,
      true,
      false
    );
    // 文件创建事件
    this.watcher.onDidCreate(async (uri) => {
      this.dealFile(uri);
    });

    // 文件删除事件
    this.watcher.onDidDelete((uri) => {
      this.dealFile(uri);
    });
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
