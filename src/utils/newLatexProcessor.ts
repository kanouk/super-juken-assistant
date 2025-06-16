
export interface LaTeXContent {
  type: 'block-math' | 'inline-math' | 'text';
  content: string;
  originalMatch?: string;
  isChemistry?: boolean;
}

interface ParseState {
  input: string;
  position: number;
  result: LaTeXContent[];
}

// ステートマシンベースのパーサー（改良版）
export class LaTeXParser {
  private static readonly BLOCK_PATTERNS = [
    { start: '$$', end: '$$' },
    { start: '\\[', end: '\\]' }
  ];

  private static readonly INLINE_PATTERNS = [
    { start: '$', end: '$' },
    { start: '\\(', end: '\\)' }
  ];

  private static readonly CHEMISTRY_PATTERNS = [
    /\(\\(?:ce|mathrm|text)\{([^}]+)\}\)/g,
    /\\(?:ce|mathrm|text)\{([^}]+)\}/g
  ];

  // 長い数式を自動的にブロック化すべきパターン
  private static readonly FORCE_BLOCK_PATTERNS = [
    /\\begin\{.*?\}/,
    /\\end\{.*?\}/,
    /\\vec\{.*?\}.*?\\times.*?\\vec\{.*?\}/,
    /.*?\\times.*?\\times.*?/,
    /\\frac\{.*?\}\{.*?\}.*?\\frac\{.*?\}\{.*?\}/,
    /.{50,}/ // 50文字以上の数式
  ];

  static parse(content: string): LaTeXContent[] {
    console.log('LaTeXParser: Starting parse of content:', content.substring(0, 100) + '...');
    
    // 日本語の¥記号を\に正規化
    const normalizedContent = content.replace(/¥/g, '\\');
    
    const state: ParseState = {
      input: normalizedContent,
      position: 0,
      result: []
    };

    while (state.position < state.input.length) {
      const blockMatch = this.tryMatchBlock(state);
      if (blockMatch) {
        this.addContent(state, blockMatch);
        continue;
      }

      const inlineMatch = this.tryMatchInline(state);
      if (inlineMatch) {
        // 長い数式パターンをチェックしてブロック化を検討
        const shouldBeBlock = this.shouldForceBlock(inlineMatch.content);
        if (shouldBeBlock) {
          const blockVersion = {
            ...inlineMatch,
            type: 'block-math' as const
          };
          this.addContent(state, blockVersion);
        } else {
          this.addContent(state, inlineMatch);
        }
        continue;
      }

      const chemMatch = this.tryMatchChemistry(state);
      if (chemMatch) {
        this.addContent(state, chemMatch);
        continue;
      }

      // 通常のテキストを1文字ずつ処理
      this.addTextContent(state);
    }

    // 最後のテキストコンテンツを追加
    this.finalizeTextContent(state);

    console.log('LaTeXParser: Parse completed with', state.result.length, 'parts');
    return state.result;
  }

  private static shouldForceBlock(content: string): boolean {
    return this.FORCE_BLOCK_PATTERNS.some(pattern => pattern.test(content));
  }

  private static tryMatchBlock(state: ParseState): LaTeXContent | null {
    for (const pattern of this.BLOCK_PATTERNS) {
      const match = this.matchPattern(state.input, state.position, pattern.start, pattern.end);
      if (match && !match.content.includes('\n')) {
        return {
          type: 'block-math',
          content: match.content,
          originalMatch: match.full
        };
      }
    }
    return null;
  }

  private static tryMatchInline(state: ParseState): LaTeXContent | null {
    for (const pattern of this.INLINE_PATTERNS) {
      const match = this.matchPattern(state.input, state.position, pattern.start, pattern.end);
      if (match && !match.content.includes('\n') && !match.content.includes('\r')) {
        return {
          type: 'inline-math',
          content: match.content,
          originalMatch: match.full
        };
      }
    }
    return null;
  }

  private static tryMatchChemistry(state: ParseState): LaTeXContent | null {
    const remaining = state.input.substring(state.position);
    
    for (const pattern of this.CHEMISTRY_PATTERNS) {
      pattern.lastIndex = 0; // Reset regex
      const match = pattern.exec(remaining);
      if (match && match.index === 0) {
        return {
          type: 'inline-math',
          content: match[1] || match[0],
          originalMatch: match[0],
          isChemistry: true
        };
      }
    }
    return null;
  }

  private static matchPattern(input: string, start: number, startDelim: string, endDelim: string) {
    if (!input.substring(start).startsWith(startDelim)) {
      return null;
    }

    const contentStart = start + startDelim.length;
    const endIndex = input.indexOf(endDelim, contentStart);
    
    if (endIndex === -1) {
      return null;
    }

    const content = input.substring(contentStart, endIndex);
    const full = input.substring(start, endIndex + endDelim.length);

    return { content, full, endPosition: endIndex + endDelim.length };
  }

  private static addContent(state: ParseState, content: LaTeXContent): void {
    // 既存のテキストコンテンツを確定
    this.finalizeTextContent(state);
    
    state.result.push(content);
    state.position += (content.originalMatch?.length || 0);
  }

  private static addTextContent(state: ParseState): void {
    // テキストコンテンツを1文字ずつ蓄積
    state.position++;
  }

  private static finalizeTextContent(state: ParseState): void {
    const textStart = state.result.reduce((pos, item) => {
      return pos + (item.originalMatch?.length || item.content.length);
    }, 0);

    if (textStart < state.position) {
      const textContent = state.input.substring(textStart, state.position);
      if (textContent.trim()) {
        state.result.push({
          type: 'text',
          content: textContent
        });
      }
    }
  }
}

// 旧パーサーとの互換性を保つエクスポート
export const parseLatexContent = (content: string): LaTeXContent[] => {
  return LaTeXParser.parse(content);
};
