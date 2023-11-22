const stackReg = /^\s*at (?:(.+) \()?([^(]+?):(\d+):(\d+)\)?$/;

export interface Stack {
  fileName: string;
  lineNumber: number;
  columnNumber: number;
  callStack: string;
  className: string;
  functionName: string;
  functionAlias: string;
  callerName: string;
}

export const parseCallStack = (
  data: Error,
  skip: number = 1,
): Partial<Stack> => {
  try {
    const stackLines = data.stack.split('\n').slice(skip);
    const lineMatch = stackReg.exec(stackLines[0]);
    if (lineMatch && lineMatch.length === 5) {
      let className = '';
      let functionName = '';
      let functionAlias = '';
      if (lineMatch[1] && lineMatch[1] !== '') {
        [functionName, functionAlias] = lineMatch[1]
          .replace(/[[\]]/g, '')
          .split(' as ');
        functionAlias = functionAlias || '';
        if (functionName.includes('.'))
          [className, functionName] = functionName.split('.');
      }
      return {
        fileName: lineMatch[2],
        lineNumber: parseInt(lineMatch[3], 10),
        columnNumber: parseInt(lineMatch[4], 10),
        callStack: stackLines.join('\n'),
        className,
        functionName,
        functionAlias,
        callerName: lineMatch[1] || '',
      };
    }
  } catch (err) {}
  return {};
};
