// 正则表达式匹配默认导出
const defaultImportRegex =
  /import\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s+from\s+['"]([^'"]+)['"]/g;
// 正则表达式匹配具名导出
const namedImportRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
export function isExistDefault(code: string, fileName: string) {
    defaultImportRegex.lastIndex = 0;
  // 匹配默认导出
console.log(code,fileName,'code')
  let match;
  while ((match = defaultImportRegex.exec(code)) !== null) {
    // 判断路径是否相同
    console.log(match[2],'match');
    if (match[2].includes(fileName)) {
     return match;
    }
  }
  console.log(code,'notfound');
}
export function isExistName(code: string, fileName: string) {
  namedImportRegex.lastIndex = 0;
  // 匹配具名导出
  let match;
  const lines = code.split("\n"); 
  while ((match = namedImportRegex.exec(code)) !== null) {
    // 判断路径是否相同
    if (match[2].includes(fileName)) {
      const matchIndex = match.index; // 匹配项的起始索引
      const lineNumber = lines.slice(
        0,
        code.slice(0, matchIndex).split("\n").length
      ).length; // 计算行号
      return {
        match,
        lineNumber,
      };
    }
  }
}
export function findScriptArea(code:string){
  const lines = code.split("\n");
  // 匹配 <script> 标签的正则表达式
  const regex = /^\s*<script\b[^>]*>\s*$/;

  // 存储行号的数组
  let lineNumber =0;

  // 遍历每一行，检查是否匹配正则表达式
  lines.forEach((line:string, index:number) => {
    if (regex.test(line)) {
      lineNumber=index;
    }
  });
  return lineNumber;
}
export function findLastImportLine(code: string): number {
  const lines = code.split("\n");
  const importRegex = /^\s*import\s+.*\s+from\s+['"].*['"]\s*;?$/; // 正则表达式匹配 import 语句
  let lastImportLineNumber = -1; // 初始化为 -1，表示未找到

  // 遍历每一行，检查是否匹配 import 语句
  lines.forEach((line, index) => {
    if (importRegex.test(line)) {
      lastImportLineNumber = index+1; // 更新为当前行号
    }
  });

  return lastImportLineNumber; // 返回最后一个 import 语句的行号
}



