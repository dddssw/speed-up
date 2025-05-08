import * as vscode from "vscode";
const path = require("path");
import * as fs from "fs/promises";
import { isInside, findCacheNode } from "@/tools";
import { getExportInfo } from "exportinfo";
import store from "@/store/utilsData";
export default class utilTreeProvide implements vscode.TreeDataProvider<number> {
  private editor: vscode.TextEditor | undefined;
  private utilsPath: string | undefined;
  private watcher: vscode.FileSystemWatcher;
  private _onDidChangeTreeData: vscode.EventEmitter<number | undefined> =
    new vscode.EventEmitter<number | undefined>();
  readonly onDidChangeTreeData: vscode.Event<number | undefined> =
    this._onDidChangeTreeData.event;
  dropMimeTypes = ["application/vnd.code.tree.utils"];
  dragMimeTypes = ["application/vnd.code.tree.utils"];
  rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;
  private context: vscode.ExtensionContext;
  async refresh() {
    await this.context.workspaceState.update("utilsData", undefined);
    store.getState().save(undefined)
    const utilsConfigurePath = vscode.workspace
      .getConfiguration("speedImport")
      .get("utilsPath");
    this.utilsPath = path.join(this.rootPath, utilsConfigurePath);
    this._onDidChangeTreeData.fire(undefined); //通知订阅更新
  }
  constructor(context: vscode.ExtensionContext) {
    vscode.workspace.onDidSaveTextDocument((doc) =>
      this.onDocumentChanged(doc)
    );
    vscode.commands.registerCommand("speed-up.refreshUtils", () =>
      this.refresh()
    );

    this.context = context;
    this.editor = vscode.window.activeTextEditor;
    const utilsConfigurePath = vscode.workspace
      .getConfiguration("speedImport")
      .get("utilsPath");
    this.utilsPath = path.join(this.rootPath, utilsConfigurePath);
    this.createFileWatch();
    const view = vscode.window.createTreeView("utils", {
      treeDataProvider: this,
      dragAndDropController: this,
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
      store.getState().utilsData;
    console.log(cache, "cache");
    //根
    if (!element) {
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
      const fileArr = await getFilesAndExtensions(this.utilsPath);
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
      store.getState().save(fileArr)
      await this.context.workspaceState.update("utilsData", fileArr); //缓存
      return fileArr;
    } else {
      console.log(element.children,"cache1");
      if (element.children) {
        element.children.forEach((item: any) => {
          item.iconPath = new vscode.ThemeIcon(item.iconPath.id);
          item.command.arguments[0] = vscode.Uri.file(element.fullPath);
        });
        return element.children;
      }
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
        await this.context.workspaceState.update("utilsData", cache);
        return fileArr;
      } else {
        const code = await fs.readFile(element.fullPath, "utf-8");
        const exportInfo = getExportInfo(code, element.label);
        console.log(exportInfo, "exportInfo");
        exportInfo.forEach((item: any) => {
          item.fullPath = element.fullPath;
          item.label = item.name;
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
          item.contextValue = "utilsImport";
        });
        element.children = exportInfo; //缓存
        await this.context.workspaceState.update("utilsData", cache);
        return exportInfo;
      }
    }
  }
  private async onDocumentChanged(doc: vscode.TextDocument) {
    const shouldUpdate = isInside(doc.uri.fsPath, this.utilsPath);
    if (shouldUpdate) {
      const tree: any[] | undefined =
        store.getState().utilsData;
      if (!tree) {
        return;
      }
      const node = findCacheNode(tree, doc.uri.fsPath);
      //@ts-ignore
      node.children = undefined;

      // node.iconPath = new vscode.ThemeIcon(node.iconPath.id);
      // node.command.arguments[0] = vscode.Uri.file(node.fullPath);

      await this.context.workspaceState.update("utilsData", tree);
      this._onDidChangeTreeData.fire(node);
      console.log("changeEvent", node);
    }
  }
  //监听文件管理器更新对应树视图
  private dealFile(uri: vscode.Uri) {
    const tree: any[] | undefined =
      store.getState().utilsData;
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
  public createFileWatch() {
    // this.watcher?.dispose();
    const globPath = new vscode.RelativePattern(
      this.utilsPath as string,
      "**/*"
    );
    this.watcher = vscode.workspace.createFileSystemWatcher(
      globPath,
      false,
      true,
      false
    );
    // 文件创建事件
    this.watcher.onDidCreate(async (uri: vscode.Uri) => {
      this.dealFile(uri);
    });

    // 文件删除事件
    this.watcher.onDidDelete((uri) => {
      this.dealFile(uri);
    });
  }
  public async handleDrag(
    source:any,
    treeDataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
    if (source[0].type !== 'file' && source[0].type !== 'dir'){
      treeDataTransfer.set(
        "application/vnd.code.tree.utils",
        new vscode.DataTransferItem(source)
      );
    }else{
      vscode.window.showWarningMessage('该类型不支持拖拽!')
    }
  }
  public async handleDrop(
    target: undefined,
    sources: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
  
    const transferItem = sources.get("application/vnd.code.tree.utils");
    console.log(transferItem, "transferItem");
    if (!transferItem) {
      return;
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
