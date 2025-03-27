import vscode from "vscode";
const editor = vscode.window.activeTextEditor;

export function findRefOrReactive() {
  if(!editor){
    return -1
  }
  let lastMatchLineNumber = -1;
  const refReactivePattern = /\b(ref|reactive)\(/g;

  for (
    let lineNumber = 0;
    lineNumber < editor?.document.lineCount;
    lineNumber++
  ) {
    const lineText = editor?.document.lineAt(lineNumber).text;

    if (refReactivePattern.test(lineText)) {
      lastMatchLineNumber = lineNumber;
    }
  }

  return lastMatchLineNumber;
}
export function findImport() {
   if (!editor) {
     return -1;
   }
  let lastMatchLineNumber = -1;
  const importPattern = /^\s*import\s+/g;

  for (
    let lineNumber = 0;
    lineNumber < editor?.document.lineCount;
    lineNumber++
  ) {
    const lineText = editor?.document.lineAt(lineNumber).text;

    if (importPattern.test(lineText)) {
      lastMatchLineNumber = lineNumber;
    }
  }

  return lastMatchLineNumber;
}
export function findScript() {
   if (!editor) {
     return -1;
   }
  let lastMatchLineNumber = -1;
  const scriptPattern = /<script.*>/i;

  for (
    let lineNumber = 0;
    lineNumber < editor?.document.lineCount;
    lineNumber++
  ) {
    const lineText = editor?.document.lineAt(lineNumber).text;

    if (scriptPattern.test(lineText)) {
      lastMatchLineNumber = lineNumber;
      break;
    }
  }

  return lastMatchLineNumber;
}
export function insertResponseDataPosition(){
    let index = findRefOrReactive();
    if(~index){
        return index;
    }
    index = findImport();
    if(~index){
        return index + 1;
    }
    index = findScript();
    if(~index){
        return index;
    }
    return 0;
}