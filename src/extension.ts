import * as vscode from "vscode";
import path from "path";
import * as fs from "fs/promises";
import { AddImport } from "exportinfo";
import hookTreeProvide from "./hookTree";
import utilTreeProvide from "./utilTree";
import { createTerminal } from "@/utils/terminal";
import { insertResponseDataPosition } from "@/utils/insertPosition";
import webViewProvider from "@/web/sideBarView";
import store from "@/store/elementTemplateInfo";
import contextStore from "@/store/context";
import {
  isExistDefault,
  isExistName,
  findScriptArea,
  findLastImportLine,
} from "./tools.ts";
const { getState } = store;
export function activate(context: vscode.ExtensionContext) {
  contextStore.getState().save(context);
  vscode.window.onDidEndTerminalShellExecution(async (event) => {
    // event 变量包含终端执行完成时的详细信息
    const terminal = event.terminal;
    const exitCode = event.exitCode;
    if (terminal.name === "element-plus") {
      if (exitCode === undefined) {
        console.log("Command finished but exit code is unknown");
      } else if (exitCode === 0) {
        vscode.window.showInformationMessage(`代码已生成`);
        const workspaceFolder = vscode.workspace.workspaceFolders
          ? vscode.workspace.workspaceFolders[0].uri.fsPath
          : null;

        if (workspaceFolder) {
          const filePath = path.join(workspaceFolder, "tempTemplateData.js");
          const data = await fs.readFile(filePath, "utf-8");
          const parsedData = JSON.parse(data);
          fs.unlink(filePath);
          getState().save(parsedData);
          console.log(getState()["element-plus-template"]);
          terminal.sendText("gen el", false);
        } else {
          vscode.window.showInformationMessage(`No workspace folder open.`);
        }
      } else {
        console.log("Command failed");
      }
    }
  });
  const rootPath =
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri.fsPath
      : undefined;
  vscode.commands.registerCommand("speed-up.insert-element-plus", () => {
    const editor = vscode.window.activeTextEditor;
    console.log(editor, "editor");
    if (!editor) {
      vscode.window.showInformationMessage("No editor is active");
      return;
    }
    if (editor?.document.languageId !== "vue") {
      vscode.window.showInformationMessage("应当是一个.vue文件");
      return;
    }
    const componentInfo = getState()["element-plus-template"];
    const position = editor.selection.active;
    const nextLinePosition = new vscode.Position(position.line + 1, 0);
    const { template, modelValue, functionValue } = componentInfo;
    const line = insertResponseDataPosition();
    const insertRefOrReactivePosition = new vscode.Position(line + 1, 0);
    //插入代码到光标位置
    editor
      .edit((editBuilder) => {
        // 在当前光标位置插入代码
        editBuilder.insert(nextLinePosition, template + "\n");
        editBuilder.insert(
          insertRefOrReactivePosition,
          modelValue.join("\n") + functionValue.join("\n") + "\n"
        );
      })
      .then(() => {
        vscode.commands.executeCommand("editor.action.formatDocument");
      });
  });
  vscode.commands.registerCommand("speed-up.element-plus", () => {
    const terminals = vscode.window.terminals;
    const elementPlusTerminal = terminals.find((terminal) =>
      terminal.name.includes("element-plus")
    );

    if (elementPlusTerminal) {
      vscode.window.showInformationMessage(
        `element-plus组件生成终端已存在，请前往`
      );
      // 你可以在这里进行其他的操作，比如发送命令到该终端
      elementPlusTerminal.show();
    } else {
      const elementPlusTerminal = createTerminal("element-plus");
      elementPlusTerminal.shellIntegration;
      elementPlusTerminal.show();
      elementPlusTerminal.sendText("gen el");
    }
  });
  vscode.commands.registerCommand("speed-up.openFile", (resource) =>
    openResource(resource)
  );
  vscode.commands.registerCommand(
    "speed-up.openFileAndScroll",
    (resource, loc) =>
      vscode.window.showTextDocument(resource).then((editor) => {
        const start = new vscode.Position(loc.start.line - 1, loc.start.column);
        const end = new vscode.Position(loc.end.line - 1, loc.end.column);
        // 移动光标到指定位置
        editor.selection = new vscode.Selection(start, end);
        // 滚动到指定位置
        editor.revealRange(
          new vscode.Range(start, end),
          vscode.TextEditorRevealType.InCenter
        );
      })
  );
  vscode.commands.registerCommand(
    "speed-up.replaceEditContent",
    async (range, content) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await editor.edit(async (editBuilder) => {
          editBuilder.replace(range, content + "\n"); // 替换整个文档内容
          await editor.document.save(); // 调用 save 方法
        });
      } else {
        vscode.window.showErrorMessage("没有活动的文本编辑器.");
      }
    }
  );
  vscode.commands.registerCommand(
    "speed-up.addEditContent",
    async (position, content) => {
      const editor = vscode.window.activeTextEditor;

      if (editor) {
        await editor.edit((editBuilder) => {
          editBuilder.insert(position, content);
        });
        // 滚动到插入位置
        editor.revealRange(
          new vscode.Range(position, position),
          vscode.TextEditorRevealType.InCenter
        );

        // 创建高亮装饰器
        const decorationType = vscode.window.createTextEditorDecorationType({
          backgroundColor: "rgba(173, 216, 230, 0.5)",
        });

        // 设置高亮范围
        const range = new vscode.Range(
          position,
          position.translate(0, content.length)
        );
        editor.setDecorations(decorationType, [range]);
        await editor.document.save(); // 调用 save 方法
        // 可选：设置定时器在一段时间后移除高亮
        setTimeout(() => {
          editor.setDecorations(decorationType, []); // 清除高亮
        }, 2000); // 2秒后清除高亮
      } else {
        vscode.window.showErrorMessage("没有活动的文本编辑器.");
      }
    }
  );
  vscode.commands.registerCommand("speed-up.importUtil", async (res) => {
    // let isImporting = context.globalState.get(isImportingKey) || false;
    if (
      vscode.window.activeTextEditor &&
      vscode.window.activeTextEditor.document.uri.scheme === "file"
    ) {
      console.log(vscode.window.activeTextEditor.document.languageId);
      if (vscode.window.activeTextEditor.document.languageId === "vue") {
        try {
          const editor = vscode.window.activeTextEditor;
          if (editor) {
            // 获取当前文档的文本
            const document = editor.document;
            const documentText = document.getText();
            const fileName = path.basename(
              res.fullPath,
              path.extname(res.fullPath)
            );
            const importName = res.label;

            const utilsPath: string = vscode.workspace
              .getConfiguration("speedImport")
              .get("utilsPath");
            const utilsAliasPath: string = vscode.workspace
              .getConfiguration("speedImport")
              .get("utilsAliasPath");
            const normalFullPath = path
              .normalize(res.fullPath)
              .replace(/\\/g, "/");

            const parts = normalFullPath.split(utilsPath);
            const aliasPathName = utilsAliasPath + parts[1];

            //判断是否是默认导出
            if (res.isDefault) {
              const existData = isExistDefault(documentText, fileName);
              if (existData) {
                vscode.window.showInformationMessage(
                  `Default Import Already Exist`
                );
                return;
              } else {
                const text = `import ${importName} from "${aliasPathName}"\n`;
                const lineNumber = findScriptArea(documentText);
                const position = new vscode.Position(lineNumber + 1, 0);
                await insertTextInEditor(position, text);
              }
            }
            //具名导出
            else {
              const existData = isExistName(documentText, fileName);
              if (existData) {
                if (existData.match[1].includes(importName)) {
                  vscode.window.showInformationMessage(
                    `Name Import Already Exist`
                  );
                } else {
                  const text = AddImport(existData.match[0], importName);
                  const line = document.lineAt(existData.lineNumber - 1);
                  const range = new vscode.Range(
                    line.range.start,
                    line.range.end
                  );
                  vscode.commands.executeCommand(
                    "speed-up.replaceEditContent",
                    range,
                    text
                  );
                }
              } else {
                const text = `import {${importName}} from "${aliasPathName}"\n`;
                const lineNumber = findScriptArea(documentText);
                const position = new vscode.Position(lineNumber + 1, 0);
                await insertTextInEditor(position, text);
              }
            }
          }
        } finally {
        }
      }
    }
  });
  vscode.commands.registerCommand("speed-up.openMySetting", async () => {
    vscode.commands.executeCommand(
      "workbench.action.openSettings",
      "@extension:speed-up"
    );
  });
  vscode.commands.registerCommand("speed-up.openHookPathSetting", async () => {
    vscode.commands.executeCommand(
      "workbench.action.openSettings",
      "@extension:speed-up.speedImport.hooksPath"
    );
  });
  vscode.commands.registerCommand("speed-up.openUtilPathSetting", async () => {
    vscode.commands.executeCommand(
      "workbench.action.openSettings",
      "@extension:speed-up.speedImport.utilsPath"
    );
  });
  vscode.commands.registerCommand("speed-up.importHook", async (res) => {
    if (
      vscode.window.activeTextEditor &&
      vscode.window.activeTextEditor.document.uri.scheme === "file"
    ) {
      console.log(vscode.window.activeTextEditor.document.languageId);
      if (vscode.window.activeTextEditor.document.languageId === "vue") {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          // 获取当前文档的文本
          const document = editor.document;
          const documentText = document.getText();
          const fileName = path.basename(
            res.fullPath,
            path.extname(res.fullPath)
          );
          const importName = res.label;
          const hooksPath: string = vscode.workspace
            .getConfiguration("speedImport")
            .get("hooksPath");
          const hooksAliasPath: string = vscode.workspace
            .getConfiguration("speedImport")
            .get("hooksAliasPath");
          const normalFullPath = path
            .normalize(res.fullPath)
            .replace(/\\/g, "/");

          const parts = normalFullPath.split(hooksPath);
          const aliasPathName = hooksAliasPath + parts[1];
          if (res.isDefault) {
            const existData = isExistDefault(documentText, fileName);
            if (existData) {
              vscode.window.showInformationMessage(
                `Default Import Already Exist`
              );
              return;
            } else {
              const text = `import ${importName} from "${aliasPathName}"\n`;
              const lineNumber = findScriptArea(documentText);
              const position = new vscode.Position(lineNumber + 1, 0);
              await insertTextInEditor(position, text);

              const returnText =
                res.returnType === "ObjectExpression"
                  ? `const {${res.returnData
                      .map((item) => item.returnName)
                      .join(",")}} = ${res.name}(${res.params.join(",")})\n`
                  : `const ${res.returnData
                      .map((item) => item.returnName)
                      .join(",")} = ${res.name}(${res.params.join(",")})\n`;
              let importLine = findLastImportLine(documentText) + 2;
              if (importLine === 1) {
                importLine = lineNumber + 1;
              }
              const importPosition = new vscode.Position(importLine, 0);
              await insertTextInEditor(importPosition, returnText);
            }
          } else {
            const existData = isExistName(documentText, fileName);
            console.log(existData, "existData");
            if (existData) {
              if (existData.match[1].includes(importName)) {
                vscode.window.showInformationMessage(
                  `Name Import Already Exist`
                );
              } else {
                const lineNumber = findScriptArea(documentText);
                const text = AddImport(existData.match[0], importName);
                const line = document.lineAt(existData.lineNumber - 1);
                const range = new vscode.Range(
                  line.range.start,
                  line.range.end
                );
                vscode.commands.executeCommand(
                  "speed-up.replaceEditContent",
                  range,
                  text
                );

                const returnText =
                  res.returnType === "ObjectExpression"
                    ? `const {${res.returnData
                        .map((item) => item.returnName)
                        .join(",")}} = ${res.name}(${res.params.join(",")})\n`
                    : `const ${res.returnData
                        .map((item) => item.returnName)
                        .join(",")} = ${res.name}(${res.params.join(",")})\n`;
                let importLine = findLastImportLine(documentText) + 2;
                if (importLine === 1) {
                  importLine = lineNumber + 1;
                }
                console.log(importLine, "importLine");
                const importPosition = new vscode.Position(importLine, 0);
                await insertTextInEditor(importPosition, returnText);
              }
            } else {
              const text = `import {${importName}} from "${aliasPathName}"\n`;
              const lineNumber = findScriptArea(documentText);
              const position = new vscode.Position(lineNumber + 1, 0);
              await insertTextInEditor(position, text);

              const returnText =
                res.returnType === "ObjectExpression"
                  ? `const {${res.returnData
                      .map((item) => item.returnName)
                      .join(",")}} = ${res.name}(${res.params.join(",")})\n`
                  : `const ${res.returnData
                      .map((item) => item.returnName)
                      .join(",")} = ${res.name}(${res.params.join(",")})\n`;
              let importLine = findLastImportLine(documentText) + 2;
              if (importLine === 1) {
                importLine = lineNumber + 1;
              }
              const importPosition = new vscode.Position(importLine, 0);
              await insertTextInEditor(importPosition, returnText);
            }
          }
        }
      }
    }
  });
  function openResource(resource: vscode.Uri): void {
    vscode.window.showTextDocument(resource);
  }
  async function insertTextInEditor(position, text) {
    console.log(text, "text123");
    await vscode.commands.executeCommand(
      "speed-up.addEditContent",
      position,
      text
    );
  }
   vscode.workspace.onDidChangeConfiguration(async(event) => {
     if (event.affectsConfiguration("speedImport.hooksPath")) {
        vscode.commands.executeCommand("speed-up.refreshHooks")
        
     }
     if (event.affectsConfiguration("speedImport.utilsPath")) {
       vscode.commands.executeCommand("speed-up.refreshUtils");
     }
   });
  new hookTreeProvide(context);
  new utilTreeProvide(context);
  //new webViewProvider(context,'hooks');
  import("./web/panelView.ts");
}

export function deactivate() {}
