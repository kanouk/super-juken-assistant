
export interface ParsedContent {
  type: 'block-math' | 'inline-math' | 'text';
  content: string;
  originalMatch?: string;
}

export const parseLatexContent = (content: string): ParsedContent[] => {
  console.log('Original content:', content);
  
  // 日本語キーボードの¥記号も\として扱う
  let normalizedContent = content.replace(/¥/g, '\\');
  console.log('After ¥ normalization:', normalizedContent);

  // 非常に厳密なLaTeX正規表現パターン - インライン数式は絶対に改行を含まない
  const latexPattern = /(\\?\[[\s\S]*?\\?\]|\$\$[\s\S]*?\$\$|\\?\([^\n\r]*?\\?\)|\$[^$\n\r]+?\$|\(\s*\\?(?:mathrm|text|ce)\{[^}\n\r]*\}\s*\))/g;
  
  const parts = normalizedContent.split(latexPattern);
  console.log('Split parts:', parts);

  return parts
    .filter(part => part && part.trim() !== '')
    .map((part, index) => {
      console.log(`Processing part ${index}:`, part);

      // ブロック数式の判定（改行を含む可能性があるもの）
      if ((part.startsWith('\\[') && part.endsWith('\\]')) || 
          (part.startsWith('$$') && part.endsWith('$$'))) {
        let math = '';
        if (part.startsWith('\\[')) {
          math = part.slice(2, -2).trim();
        } else {
          math = part.slice(2, -2).trim();
        }
        
        console.log('Block math detected:', math);
        return {
          type: 'block-math' as const,
          content: math,
          originalMatch: part
        };
      }

      // インライン数式の判定（改行を絶対に含まないもののみ）
      if ((part.startsWith('\\(') && part.endsWith('\\)') && !part.includes('\n') && !part.includes('\r')) ||
          (part.startsWith('$') && part.endsWith('$') && !part.startsWith('$$') && 
           !part.includes('\n') && !part.includes('\r') && part.length > 2) ||
          (part.startsWith('(') && /\\(?:mathrm|text|ce)\{[^}\n\r]*\}/.test(part) && 
           part.endsWith(')') && !part.includes('\n') && !part.includes('\r'))) {
        
        let math = '';
        
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          math = part.slice(2, -2).trim();
        } else if (part.startsWith('$') && part.endsWith('$')) {
          math = part.slice(1, -1).trim();
        } else if (part.startsWith('(') && /\\(?:mathrm|text|ce)\{/.test(part)) {
          math = part.replace(/^\(\s*/, '').replace(/\s*\)$/, '').trim();
        }
        
        // 空の数式は無視
        if (!math) {
          console.log('Empty math content, treating as text:', part);
          return {
            type: 'text' as const,
            content: part
          };
        }
        
        console.log('Inline math detected:', math);
        return {
          type: 'inline-math' as const,
          content: math,
          originalMatch: part
        };
      }

      // 通常のテキスト
      console.log('Processing as regular text:', part);
      return {
        type: 'text' as const,
        content: part
      };
    });
};
